import { Body, Controller, Get, Post } from '@nestjs/common';
import { User } from '../../auth/decorators/user.decorator';
import { FriendService } from '../services/friend.service';
import { SendFriendshipRequestDto } from '../dto/send-friendship.request.dto';
import { AcceptFriendshipRequestDto } from '../dto/accept-friendship.request.dto';
import { DenyFriendshipRequestDto } from '../dto/deny-friendship.request.dto';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendService: FriendService) {}

  @Get('')
  async getUserFriends(@User() user: any) {
    const userId = user.sub;
    return this.friendService.getUserFriends(userId);
  }

  @Post('request')
  async sendFriendshipRequest(
    @User() user: any,
    @Body() dto: SendFriendshipRequestDto,
  ) {
    const userId = user.sub;
    const { friendId } = dto;
    return this.friendService.sendFriendshipRequest(userId, friendId);
  }

  @Post('accept')
  async acceptFriendshipRequest(
    @User() user: any,
    @Body() dto: AcceptFriendshipRequestDto,
  ) {
    const userId = user.sub;
    const { requestId } = dto;
    return this.friendService.acceptFrindshipRequest(userId, requestId);
  }

  @Post('deny')
  async denyFriendshipRequest(
    @User() user: any,
    @Body() dto: DenyFriendshipRequestDto,
  ) {
    const userId = user.sub;
    const { requestId } = dto;
    return this.friendService.denyFriendshipRequest(userId, requestId);
  }
}
