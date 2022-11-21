import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketServer,
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatEvent } from '../types/enums/chat-event.enum';
import { AuthService } from '../../auth/services/auth.service';
import { ChatService } from '../services/chat.service';
import { GetSocketUserId } from '../decorators/get-socket-user-id.decorator';
import { Message, Room } from '@prisma/client';
import { verify } from 'jsonwebtoken';

@WebSocketGateway({ cors: true })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: Server;

  constructor(
    private authService: AuthService,
    private chatService: ChatService,
  ) {}

  afterInit() {}

  handleConnection(@ConnectedSocket() client: Socket) {
    const { id } = verify(client.handshake.auth.token, 'secret') as {
      id: string;
      username: string;
      iat: number;
    };
    this.chatService.setOnline(id, true);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    const { id } = verify(client.handshake.auth.token, 'secret') as {
      id: string;
      username: string;
      iat: number;
    };

    this.chatService.setOnline(id, false);
  }

  @SubscribeMessage(ChatEvent.Message)
  async handleMessage(
    @GetSocketUserId() userId: string,
    @MessageBody() { content, roomId }: { content: string; roomId: string },
  ): Promise<Message | false> {
    const message = await this.chatService.createMessage(
      userId,
      roomId,
      content,
    );

    this.server.to(roomId).emit(ChatEvent.Message, message);

    return message;
  }

  @SubscribeMessage(ChatEvent.Messages)
  async handleGetMessages(
    @GetSocketUserId() userId: string,
    @MessageBody()
    { roomId, page = 0 }: { string; roomId: string; page: number },
  ): Promise<Message[]> {
    return this.chatService.getMessages(userId, roomId, page);
  }

  @SubscribeMessage(ChatEvent.LatestMessages)
  async handleGetLatestMessages(
    @GetSocketUserId() userId: string,
    @MessageBody()
    params: { page: number },
  ): Promise<Message[]> {
    return this.chatService.getLatestMessages(userId, params?.page || 0);
  }

  @SubscribeMessage(ChatEvent.JoinRoom)
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    id: string,
  ): Promise<void> {
    client.join(id);
  }

  @SubscribeMessage(ChatEvent.LeaveRoom)
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    id: string,
  ): Promise<void> {
    client.leave(id);
  }

  @SubscribeMessage(ChatEvent.IsOnline)
  async handleIsOnline(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    id: string,
  ): Promise<boolean> {
    return this.chatService.isOnline(id);
  }

  @SubscribeMessage(ChatEvent.Seen)
  async handleSeen(
    @GetSocketUserId() userId: string,
    @MessageBody()
    { roomId, messageId }: { roomId: string; messageId: string },
  ): Promise<void> {
    return this.chatService.seen(userId, roomId, messageId);
  }
}
