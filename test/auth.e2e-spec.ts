import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/modules/prisma/services/prisma.service';
import * as request from 'supertest';
import { createTestApplication } from '../src/helpers/test.helper';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;

  let user;

  beforeAll(async () => {
    app = await createTestApplication();
    prisma = app.get(PrismaService);

    user = await prisma.user.findFirst({
      include: {
        credential: true,
      },
    });

    await app.init();
  });

  afterAll(() => app.close());

  it('/auth/register (POST)', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Colette',
        username: 'user003',
        password: 'Password123',
      })
      .expect(201);

    expect(body.user).toMatchObject({ name: 'Colette' });
    expect(typeof body.accessToken === 'string').toBeTruthy();
  });

  it('/auth/login (POST)', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: user.credential.username,
        password: user.credential.password,
      })
      .expect(201);

    accessToken = body.accessToken;
  });

  it('/auth/profile (GET)', async () => {
    const { body } = await request(app.getHttpServer())
      .get('/auth/profile')
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200);

    expect(body).toMatchObject({ name: user.name });
  });
});
