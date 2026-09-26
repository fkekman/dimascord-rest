import { IsNotEmpty, IsString } from 'class-validator';

export class SendFriendshipRequestDto {
  @IsString()
  @IsNotEmpty()
  friendId: string;
}
