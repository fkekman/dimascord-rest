import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FriendRepository } from '../repositories/friend.repository';

@Injectable()
export class FriendService {
  constructor(private readonly friendRepository: FriendRepository) {}

  async sendFriendshipRequest(userId: string, friendUserId: string) {
    const isFriends = await this.friendRepository.isFriends(
      userId,
      friendUserId,
    );

    if (isFriends) return;

    const incomingRequest = await this.friendRepository.findIncomingRequest(
      userId,
      friendUserId,
    );
    if (incomingRequest) {
      throw new ConflictException('Request not found');
    }
    await this.friendRepository.createPendingRequest(userId, friendUserId);
  }

  async acceptFrindshipRequest(userId: string, requestId: string) {
    const incomingRequest = await this.friendRepository.findById(requestId);
    if (!incomingRequest) {
      throw new NotFoundException('Request not found');
    }
    if (incomingRequest.friendId !== userId) {
      throw new ConflictException('Cant accept this request');
    }
    await this.friendRepository.acceptPendingRequest(incomingRequest.id);
  }

  async denyFriendshipRequest(userId: string, requestId: string) {
    const incomingRequest = await this.friendRepository.findById(requestId);
    if (!incomingRequest) {
      throw new NotFoundException('Request not found');
    }
    if (incomingRequest.friendId !== userId) {
      throw new ConflictException('Cant deny this request');
    }
    await this.friendRepository.denyPendingRequest(incomingRequest.id);
  }

  async getUserFriends(userId: string) {
    return this.friendRepository.findUserFriends(userId);
  }
}
