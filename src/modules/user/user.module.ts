import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UserController } from './controllers/user.controller';
import { CredentialService } from './services/credential.service';
import { UserService } from './services/user.service';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService, CredentialService],
  exports: [UserService, CredentialService],
})
export class UserModule {}
