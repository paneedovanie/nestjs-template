import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateRoomDto } from '../dtos/create-room.dto';
import { ChatService } from '../services/chat.service';

@Controller('chats')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createRoom(
    @Request() req,
    @Body()
    { usersId }: CreateRoomDto,
  ) {
    return this.chatService.findOrCreateRoom(req.user, usersId);
  }
}
