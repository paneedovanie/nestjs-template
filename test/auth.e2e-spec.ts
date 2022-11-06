import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/modules/prisma/services/prisma.service';
import * as request from 'supertest';
import { createTestApplication } from '../src/helpers/test.helper';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;

  beforeAll(async () => {
    app = await createTestApplication();

    prisma = app.get(PrismaService);

    await prisma.user.create({
      data: {
        firstName: 'Coco',
        credential: {
          create: {
            email: 'user001@email.com',
            password: 'Password123',
          },
        },
      },
    });

    await app.init();
  });

  it('/auth/login (POST)', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'user001@email.com',
        password: 'Password123',
      })
      .expect(201);

    accessToken = body.access_token;
  });

  it('/auth/profile (GET)', async () => {
    const { body } = await request(app.getHttpServer())
      .get('/auth/profile')
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200);

    expect(body).toMatchObject({ firstName: 'Coco' });
  });
});
