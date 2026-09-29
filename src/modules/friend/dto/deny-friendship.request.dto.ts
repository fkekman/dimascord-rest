import { IsNotEmpty, IsString } from 'class-validator';

export class DenyFriendshipRequestDto {
  @IsString()
  @IsNotEmpty()
  requestId: string;
}
