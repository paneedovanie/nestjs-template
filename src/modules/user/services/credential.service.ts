import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/services/prisma.service';
import { Credential, Prisma, User } from '@prisma/client';

@Injectable()
export class CredentialService {
  constructor(private prisma: PrismaService) {}

  async findOne(
    credentialWhereUniqueInput: Prisma.CredentialWhereUniqueInput,
  ): Promise<
    | (Credential & {
        user: User;
      })
    | null
  > {
    return this.prisma.credential.findUnique({
      where: credentialWhereUniqueInput,
      include: {
        user: true,
      },
    });
  }

  async update(params: {
    where: Prisma.CredentialWhereUniqueInput;
    data: Prisma.CredentialUpdateInput;
  }): Promise<Credential> {
    const { where, data } = params;
    return this.prisma.credential.update({
      data,
      where,
    });
  }
}
