import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/modules/prisma/services/prisma.service';
import * as request from 'supertest';
import { createTestApplication } from '../src/helpers/test.helper';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestApplication();

    prisma = app.get(PrismaService);

    await app.init();
  });

  it('/users (POST)', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/users')
      .send({
        firstName: 'Chloe',
        email: 'user002@email.com',
        password: 'Password123',
      })
      .expect(201);

    expect(body).toMatchObject({ firstName: 'Chloe' });
  });

  it('/users (GET)', async () => {
    const { body } = await request(app.getHttpServer())
      .get('/users')
      .expect(200);

    expect(Array.isArray(body)).toBeTruthy();
  });
});
