import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FriendRepository } from '../repositories/friend.repository';

@Injectable()
export class FriendService {
  constructor(private readonly friendRepository: FriendRepository) {}

  async sendFriendship(userId: string, friendUserId: string) {
    if (userId === friendUserId) {
      throw new ConflictException();
    }
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
      throw new NotFoundException('Request not found');
    }
    await this.friendRepository.createPendingRequest(userId, friendUserId);
  }

  async acceptFrindship(userId: string, requestId: string) {
    const incomingRequest = await this.friendRepository.findById(requestId);
    if (!incomingRequest) {
      throw new NotFoundException('Request not found');
    }
    if (incomingRequest.friendId !== userId) {
      throw new ConflictException('Cant accept this request');
    }
    await this.friendRepository.acceptPendingRequest(incomingRequest.id);
  }

  async denyFriendship(userId: string, requestId: string) {
    const incomingRequest = await this.friendRepository.findById(requestId);
    if (!incomingRequest) {
      throw new NotFoundException('Request not found');
    }
    if (
      incomingRequest.friendId !== userId ||
      incomingRequest.status !== 'pending'
    ) {
      throw new ConflictException('Cant deny this request');
    }
    await this.friendRepository.deleteById(incomingRequest.id);
  }

  async unfriend(userId: string, friendId: string) {
    const isFriends = await this.friendRepository.isFriends(userId, friendId);
    if (!isFriends) return;

    await this.friendRepository.deleteByUserFriend(userId, friendId);
  }

  async getUserFriends(userId: string) {
    return this.friendRepository.findUserFriends(userId);
  }

  async getIncomingFriendships(userId: string) {
    return this.friendRepository.findIncomingRequests(userId);
  }

  async getOutgoingFriendships(userId: string) {
    return this.friendRepository.findOutgoingRequests(userId);
  }
}
