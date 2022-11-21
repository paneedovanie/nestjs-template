import { IsNotEmpty, IsString } from 'class-validator';

export class SearchByUsernameDto {
  @IsString()
  @IsNotEmpty()
  username: string;
}
