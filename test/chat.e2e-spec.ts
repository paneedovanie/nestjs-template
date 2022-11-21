import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/modules/prisma/services/prisma.service';
import { createTestApplication } from '../src/helpers/test.helper';
import { io as clientIo } from 'socket.io-client';
import { User, Credential, Room } from '@prisma/client';
import { ChatEvent } from '../src/modules/chat/types/enums/chat-event.enum';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from '../src/modules/chat/services/chat.service';
import * as request from 'supertest';
import { StatusCodes } from 'http-status-codes';

let room;

describe('ChatController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;

  let users: (User & {
    credential: Credential;
  })[];

  beforeAll(async () => {
    app = await createTestApplication();
    prisma = app.get(PrismaService);
    await app.init();
    app.listen(0);

    const jwtService = app.get(JwtService);
    const chatService = app.get(ChatService);

    users = await prisma.user.findMany({
      include: {
        credential: true,
      },
    });

    accessToken = await jwtService.sign(
      { id: users[0].id, username: users[0].credential.username },
      {
        secret: 'secret',
      },
    );
  });

  afterAll(() => {
    app.close();
  });

  describe('/chats (POST)', () => {
    it('should return 404 when trying to create chat without user ids', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/chats')
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(StatusCodes.BAD_REQUEST);
    });

    it('should create a chat', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/chats')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({
          usersId: users.map(({ id }) => id),
        })
        .expect(StatusCodes.CREATED);

      room = body;
    });

    it('should return an existing chat', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/chats')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({
          usersId: users.map(({ id }) => id),
        })
        .expect(StatusCodes.CREATED);

      expect(body.id).toBe(room.id);
    });
  });
});

describe('ChatGateway (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let users: (User & {
    credential: Credential;
  })[];
  let accessToken: string;

  let clientSocket;

  beforeAll(async () => {
    app = await createTestApplication();
    prisma = app.get(PrismaService);
    await app.init();
    app.listen(0);

    const jwtService = app.get(JwtService);
    const chatService = app.get(ChatService);

    users = await prisma.user.findMany({
      include: {
        credential: true,
      },
    });

    accessToken = await jwtService.sign(
      { id: users[0].id, username: users[0].credential.username },
      {
        secret: 'secret',
      },
    );

    const address = app.getHttpServer().address();
    clientSocket = clientIo(`http://[${address.address}]:${address.port}`, {
      transports: ['websocket'],
      forceNew: true,
      auth: {
        token: accessToken,
      },
    });

    await new Promise((res, rej) => {
      clientSocket.on('connect', () => res(undefined));
      clientSocket.on('connect_error', rej);
    });
  });

  afterAll(() => {
    clientSocket.close();
    app.close();
  });

  describe(`${ChatEvent.Message} (EVENT)`, () => {
    it('should be able to send a message', async () => {
      await new Promise((res) => {
        clientSocket.emit(
          ChatEvent.Message,
          { content: 'world', roomId: room.id },
          ({ content }) => {
            expect(content).toBe('world');
            res(undefined);
          },
        );
      });
    });

    it('should return false when sending an empty string message', async () => {
      await new Promise((res) => {
        clientSocket.emit(
          ChatEvent.Message,
          { content: '', roomId: room.id },
          (response) => {
            expect(response).toBe(false);
            res(undefined);
          },
        );
      });
    });
  });

  describe(`${ChatEvent.Messages} (EVENT)`, () => {
    it(`should be able to get the room messages`, async () => {
      await new Promise((res) => {
        clientSocket.emit(
          ChatEvent.Messages,
          { roomId: room.id, page: 0 },
          (messages) => {
            expect(Array.isArray(messages)).toBeTruthy();
            expect(messages).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  content: expect.any(String),
                  user: expect.any(Object),
                  room: expect.any(Object),
                }),
              ]),
            );
            res(undefined);
          },
        );
      });
    });
  });

  describe(`${ChatEvent.LatestMessages} (EVENT)`, () => {
    it(`should be able to get the latest messages`, async () => {
      await new Promise((res) => {
        clientSocket.emit(ChatEvent.LatestMessages, { page: 0 }, (rooms) => {
          expect(Array.isArray(rooms)).toBeTruthy();
          expect(rooms).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                content: expect.any(String),
                room: expect.any(Object),
              }),
            ]),
          );
          res(undefined);
        });
      });
    });
  });
});
