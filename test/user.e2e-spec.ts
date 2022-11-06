import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApplication } from '../src/helpers/test.helper';

jest.useFakeTimers();

describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApplication();
    await app.init();
  });

  it('/users (GET)', async () => {
    const { body } = await request(app.getHttpServer())
      .get('/users')
      .expect(200);

    expect(Array.isArray(body)).toBeTruthy();
  });
});
