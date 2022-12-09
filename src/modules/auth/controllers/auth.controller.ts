import {
  Controller,
  UseGuards,
  Post,
  Request,
  Get,
  Body,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { UserService } from '../../user/services/user.service';
import { SignupDto } from '../dtos/signup.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('register')
  async register(
    @Body()
    userData: SignupDto,
  ): Promise<{ accessToken: string; user: User }> {
    const user = await this.userService.createUser(userData);
    return this.authService.login(user);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return this.userService.findOne({ id: req.user.id });
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  changePassword(@Request() req) {
    return this.authService.changePassword(req.user.id, req.body);
  }
}
