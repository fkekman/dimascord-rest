import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { User } from '../../auth/decorators/user.decorator';
import { FriendService } from '../services/friend.service';
import { SendFriendshipRequestDto } from '../dto/send-friendship.request.dto';
import { AcceptFriendshipRequestDto } from '../dto/accept-friendship.request.dto';
import { DenyFriendshipRequestDto } from '../dto/deny-friendship.request.dto';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendService: FriendService) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  async getUserFriends(@User() user: any) {
    const userId = user.sub;
    return this.friendService.getUserFriends(userId);
  }

  @Post('send')
  @HttpCode(HttpStatus.OK)
  async sendFriendship(
    @User() user: any,
    @Body() dto: SendFriendshipRequestDto,
  ) {
    const userId = user.sub;
    const { friendId } = dto;
    return this.friendService.sendFriendship(userId, friendId);
  }

  @Post('accept')
  @HttpCode(HttpStatus.OK)
  async acceptFriendship(
    @User() user: any,
    @Body() dto: AcceptFriendshipRequestDto,
  ) {
    const userId = user.sub;
    const { requestId } = dto;
    return this.friendService.acceptFrindship(userId, requestId);
  }

  @Post('deny')
  @HttpCode(HttpStatus.OK)
  async denyFriendship(
    @User() user: any,
    @Body() dto: DenyFriendshipRequestDto,
  ) {
    const userId = user.sub;
    const { requestId } = dto;
    return this.friendService.denyFriendship(userId, requestId);
  }

  // @Post('unfriend')
  // @HttpCode(HttpStatus.OK)
  // async unfriend(
  // @User() user: any,
  // @Body() dto: UnfriendRequestDto
  // ) { }

  @Get('incoming')
  @HttpCode(HttpStatus.OK)
  async getIncomingFriendships(@User() user: any) {
    const userId = user.sub;
    return this.friendService.getIncomingFriendships(userId);
  }

  @Get('outgoing')
  @HttpCode(HttpStatus.OK)
  async getOutgoingFriendships(@User() user: any) {
    const userId = user.sub;
    return this.friendService.getOutgoingFriendships(userId);
  }
}
