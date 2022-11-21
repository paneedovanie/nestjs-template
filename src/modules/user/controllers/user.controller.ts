import { Body, Controller, Get, Query } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { User as UserModel } from '@prisma/client';
import { SignupDto } from '../../auth/dtos/signup.dto';
import { SearchByUsernameDto } from '../dtos/search-by-username.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUsers(): Promise<UserModel[]> {
    return this.userService.users({});
  }

  @Get('search')
  async searchByUsername(
    @Query() { username }: SearchByUsernameDto,
  ): Promise<UserModel | null> {
    return this.userService.searchByUsername(username);
  }
}
