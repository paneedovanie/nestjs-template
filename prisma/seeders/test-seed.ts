import { PrismaClient } from '@prisma/client';

export default async (prisma: PrismaClient) => {
  const user1 = await prisma.user.create({
    data: {
      name: 'Joe',
      username: 'user001',
      credential: {
        create: {
          username: 'user001',
          password: 'Password123',
        },
      },
    },
  });
  const user2 = await prisma.user.create({
    data: {
      name: 'Chloe',
      username: 'user002',
      credential: {
        create: {
          username: 'user002',
          password: 'Password123',
        },
      },
    },
  });
};
