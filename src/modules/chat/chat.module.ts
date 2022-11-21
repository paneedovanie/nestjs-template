import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/services/auth.service';
import { PrismaService } from '../prisma/services/prisma.service';
import { CredentialService } from '../user/services/credential.service';
import { ChatController } from './controllers/chat.controller';
import { ChatGateway } from './gateways/chat.gateway';
import { ChatService } from './services/chat.service';

@Module({
  imports: [
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [ChatController],
  providers: [
    PrismaService,
    AuthService,
    JwtService,
    CredentialService,
    ChatGateway,
    ChatService,
  ],
})
export class ChatModule {}
