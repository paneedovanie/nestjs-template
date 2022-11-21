import { IsArray, ArrayMinSize, IsUUID } from 'class-validator';

export class CreateRoomDto {
  @IsArray()
  @ArrayMinSize(2)
  @IsUUID(undefined, { each: true })
  usersId: string[];
}
