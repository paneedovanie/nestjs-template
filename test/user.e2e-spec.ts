import { INestApplication } from '@nestjs/common';
import { StatusCodes } from 'http-status-codes';
import * as request from 'supertest';
import { createTestApplication } from '../src/helpers/test.helper';

describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApplication();
    await app.init();
  });

  afterAll(() => app.close());

  it('/users (GET)', async () => {
    const { body } = await request(app.getHttpServer())
      .get('/users')
      .expect(StatusCodes.OK);

    expect(Array.isArray(body)).toBeTruthy();
  });

  describe('/users/search (GET)', () => {
    const path = (username: string) => `/users/search?username=${username}`;

    it('should not return 404 when no user exists', async () => {
      const { body } = await request(app.getHttpServer())
        .get(path('unknown'))
        .expect(StatusCodes.NOT_FOUND);
    });

    it('should return a user', async () => {
      const { body } = await request(app.getHttpServer())
        .get(path('user001'))
        .expect(StatusCodes.OK);

      expect(body).toMatchObject({
        name: 'Joe',
      });
    });
  });
});
