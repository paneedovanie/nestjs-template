import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/services/prisma.service';
import { User, Prisma } from '@prisma/client';
import { SignupDto } from '../../auth/dtos/signup.dto';
import { NotFoundError } from '@prisma/client/runtime';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findOne(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createUser({ username, password, ...rest }: SignupDto): Promise<User> {
    return this.prisma.user.create({
      data: {
        ...rest,
        username,
        credential: {
          create: {
            username,
            password,
          },
        },
      },
    });
  }

  async update(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return this.prisma.user.update({
      data,
      where,
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }

  async searchByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        credential: {
          username,
        },
      },
    });
    if (!user?.id) throw new NotFoundException();
    return user;
  }
}
