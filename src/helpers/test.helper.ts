import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';

export const createTestApplication = async () => {
  const testingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    // .overrideProvider(PrismaService)
    // .useValue(mockDeep<PrismaClient>())
    .compile();

  const app = testingModule.createNestApplication();
  app.useGlobalPipes(new ValidationPipe());

  return app;
};
