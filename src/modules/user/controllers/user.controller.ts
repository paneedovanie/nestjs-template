import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { User as UserModel } from '@prisma/client';
import { SignupDto } from '../dto/signup-dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUsers(): Promise<UserModel[]> {
    return this.userService.users({});
  }

  @Post()
  async signupUser(
    @Body()
    userData: SignupDto,
  ): Promise<UserModel> {
    return this.userService.createUser(userData);
  }
}
