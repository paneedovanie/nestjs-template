import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { CredentialService } from '../../user/services/credential.service';

@Injectable()
export class AuthService {
  constructor(
    private credentialService: CredentialService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const credential = await this.credentialService.findOne({
      username,
    });

    if (!credential) throw new UnauthorizedException();

    const { user, password: userPassword } = credential;

    if (user && userPassword === password) {
      return user;
    }
    return null;
  }

  verify(token: string) {
    return this.jwtService.verify(token, { secret: 'secret' });
  }

  async login(user: User) {
    const credential = await this.credentialService.findOne({
      userId: user.id,
    });
    const payload = { id: user.id, username: credential.username };
    return {
      user: credential.user,
      accessToken: this.jwtService.sign(payload),
    };
  }
}
