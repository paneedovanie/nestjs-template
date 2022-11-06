import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { spawn } from 'node:child_process';

export const createTestApplication = async () => {
  const testingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    // .overrideProvider(PrismaService)
    // .useValue(mockDeep<PrismaClient>())
    .compile();

  // # Reset test database
  // await new Promise((res) => {
  //   const command = `npx cross-env DATABASE_URL=${process.env.DATABASE_URL} npx prisma migrate reset`;

  //   spawn(command, ['-f'], {
  //     shell: true,
  //   }).on('close', (code) => res(code));
  // });

  return testingModule.createNestApplication();
};
