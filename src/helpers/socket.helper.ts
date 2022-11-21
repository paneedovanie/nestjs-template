import { Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';

export const getSocketUserId = (client: Socket) => {
  const token = client.handshake.auth.token;
  try {
    return verify(token, 'secret');
  } catch {
    return;
  }
};
