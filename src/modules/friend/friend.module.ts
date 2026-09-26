import { Module } from '@nestjs/common';
import { FriendService } from './services/friend.service';
import { FriendRepository } from './repositories/friend.repository';
import { FriendsController } from './controllers/friend.controller';

@Module({
  providers: [FriendService, FriendRepository],
  controllers: [FriendsController],
})
export class FriendModule {}
