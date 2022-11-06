import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { exec, spawn } from 'node:child_process';
import { PrismaService } from '../modules/prisma/services/prisma.service';

export const createTestApplication = async () => {
  const testingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    // .overrideProvider(PrismaService)
    // .useValue(mockDeep<PrismaClient>())
    .compile();

  //   const prismaService = new PrismaService();
  //   await prismaService.reset();

  //   await new Promise((res, rej) => {
  //     const ls = spawn('npm run migrate', [], { shell: true });
  //     ls.on('close', (code) => res(code));
  //   });

  return testingModule.createNestApplication();
};
