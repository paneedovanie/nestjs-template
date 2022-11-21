import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/services/prisma.service';
import { User, Room, Prisma, Message } from '@prisma/client';
import { CreateRoomDto } from '../dtos/create-room.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async findOrCreateRoom(user: User, usersId: string[]) {
    const room = await this.prisma.room.findFirst({
      where: {
        userRoom: {
          every: {
            userId: {
              in: usersId,
            },
          },
        },
      },
      include: {
        userRoom: {
          include: {
            user: true,
          },
        },
      },
    });

    if (room) return room;

    return this.prisma.room.create({
      data: {
        userId: user.id,
        userRoom: {
          create: usersId.map((userId) => ({ userId })),
        },
      },
    });
  }

  async findOneRoom(
    roomWhereUniqueInput: Prisma.RoomWhereUniqueInput,
  ): Promise<Room | null> {
    return this.prisma.room.findUnique({
      where: roomWhereUniqueInput,
    });
  }

  async createRoom(user: User, { usersId }: CreateRoomDto): Promise<Room> {
    return this.prisma.room.create({
      data: {
        userId: user.id,
        userRoom: {
          create: usersId.map((userId) => ({ userId })),
        },
      },
    });
  }

  async createMessage(
    userId: string,
    roomId: string,
    content: string,
  ): Promise<Message | false> {
    if (
      !content ||
      content === '' ||
      !userId ||
      userId === '' ||
      !roomId ||
      roomId === ''
    )
      return false;

    return this.prisma.message.create({
      data: {
        content,
        userId,
        roomId,
      },
      include: {
        user: {
          include: {
            online: true,
          },
        },
        room: true,
      },
    });
  }

  async getMessages(
    userId: string,
    roomId: string,
    page: number = 0,
  ): Promise<Message[]> {
    if (!userId || userId === '' || !roomId || roomId === '') return [];

    const TAKE = 20;
    const skip = TAKE * page;

    const isExists = await this.prisma.userRoom.findFirst({
      where: {
        userId,
        roomId,
      },
    });

    if (!isExists) return [];

    return this.prisma.message.findMany({
      where: {
        roomId,
      },
      include: {
        user: true,
        room: true,
      },
      take: 20,
      skip,
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async getLatestMessages(userId: string, page: number): Promise<Message[]> {
    const TAKE = 20;
    const skip = TAKE * page;
    const unreadCounts = await this.prisma.$queryRaw`
      SELECT 
        (
          SELECT COUNT(*)
          FROM "Message"
          WHERE
            "roomId" = M."roomId"
            AND (
              "createdAt" > (
                SELECT SM."createdAt"
                FROM "UserRoom" UR
                JOIN "Message" SM ON UR."lastSeenMessageId" = SM.id
                WHERE UR."userId" = ${userId}
                LIMIT 1
              ) OR (
                SELECT "lastSeenMessageId"
                FROM "UserRoom"
                WHERE "userId" = ${userId}
                LIMIT 1
              ) IS NULL
            )
        ) as count
      FROM "Message" M
      WHERE 
        id = (
          SELECT id
          FROM "Message"
          WHERE "roomId" = M."roomId"
          ORDER BY "createdAt" DESC
          LIMIT 1
        ) 
      ORDER BY "createdAt" DESC
    `;

    const messages = await this.prisma.message.findMany({
      include: {
        room: {
          include: {
            userRoom: {
              include: {
                user: {
                  include: {
                    online: true,
                  },
                },
              },
            },
          },
        },
      },
      where: {
        room: {
          userRoom: {
            some: {
              userId,
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      distinct: ['roomId'],
      take: TAKE,
      skip,
    });

    return messages.map((message, i) => ({
      ...message,
      unread: parseInt(unreadCounts[i].count),
    }));
  }

  async setOnline(userId: string, active: boolean): Promise<void> {
    await this.prisma.online.upsert({
      where: {
        userId,
      },
      update: {
        active,
      },
      create: {
        userId,
        active,
      },
    });
  }

  async isOnline(userId: string): Promise<boolean> {
    const result = await this.prisma.online.findFirst({
      where: {
        userId,
      },
    });

    return result?.active || false;
  }

  async seen(userId: string, roomId: string, messageId: string): Promise<void> {
    await this.prisma.userRoom.updateMany({
      where: {
        roomId,
        userId,
      },
      data: { lastSeenMessageId: messageId },
    });
  }
}
