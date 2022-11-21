import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { verify } from 'jsonwebtoken';

export const GetSocketUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const client = ctx.switchToWs().getClient();
    try {
      const decoded = verify(client.handshake.auth.token, 'secret') as {
        id: string;
        username: string;
        iat: number;
      };
      return decoded.id;
    } catch {
      return;
    }
  },
);
