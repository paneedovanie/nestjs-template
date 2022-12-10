import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { CredentialService } from '../../user/services/credential.service';
import { ChangePasswordDto } from '../dtos/change-password.dto';
import * as bcrypt from 'bcrypt';

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

    if (user && bcrypt.compare(userPassword, password)) {
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

  async changePassword(
    userId: string,
    { currentPassword, password }: ChangePasswordDto,
  ) {
    const unauthorizedMessage = 'Invalid password password';
    const credential = await this.credentialService.findOne({ userId });
    if (!credential) throw new UnauthorizedException(unauthorizedMessage);
    const isMatch = currentPassword === credential.password;
    if (!isMatch) throw new UnauthorizedException(unauthorizedMessage);
    return this.credentialService.update({
      where: { id: credential.id },
      data: { password: await bcrypt.hash(password, 10) },
    });
  }
}
