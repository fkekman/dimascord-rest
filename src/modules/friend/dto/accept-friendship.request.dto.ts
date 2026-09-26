import { IsNotEmpty, IsString } from 'class-validator';

export class AcceptFriendshipRequestDto {
  @IsString()
  @IsNotEmpty()
  requestId: string;
}
