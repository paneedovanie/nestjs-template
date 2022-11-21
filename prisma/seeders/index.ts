import { PrismaClient } from '@prisma/client';
import seed from './seed';
import testSeed from './test-seed';

const prisma = new PrismaClient();

const main = async () => {
  const isTest = process.env.NODE_ENV === 'test';
  if (isTest) testSeed(prisma);
  else seed(prisma);
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
