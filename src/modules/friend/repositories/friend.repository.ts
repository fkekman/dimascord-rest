import {
  DefaultEntry,
  InMemoryRepository,
} from '../../../common/in-memory.repository';

export type FriendStatus = 'pending' | 'accepted';

export interface FriendEntry extends DefaultEntry {
  userId: string;
  friendId: string;
  status: FriendStatus;
}

export class FriendRepository extends InMemoryRepository<FriendEntry> {
  async createPendingRequest(userId: string, friendId: string) {
    const foundEntry = this.entries.find((entry) => {
      return (
        (entry.userId === userId && entry.friendId === friendId) ||
        (entry.userId === friendId && entry.friendId === userId)
      );
    });
    if (foundEntry) {
      throw new Error('Entry already exists');
    }
    return this.create({
      userId,
      friendId,
      status: 'pending',
    });
  }

  async acceptPendingRequest(requestId: string) {
    const foundEntry = await this.findOne({
      id: requestId,
    });
    if (!foundEntry) {
      throw new Error('Request not found');
    }
    await this.update(requestId, {
      status: 'accepted',
    });
  }
  async deleteById(id: string) {
    const foundEntry = await this.findOne({
      id,
    });
    if (!foundEntry) {
      throw new Error('Request not found');
    }
    await this.delete(id);
  }

  async deleteByUserFriend(userId: string, friendId: string) {
    const foundEntry = this.entries.find((entry) => {
      return (
        (entry.userId === userId && entry.friendId === friendId) ||
        (entry.userId === friendId && entry.friendId === userId)
      );
    });
    if (!foundEntry) {
      throw new Error('Request not found');
    }
    await this.delete(foundEntry.id);
  }

  async findById(id: string) {
    return this.findOne({ id });
  }

  async findPendingRequest(userId: string, friendId: string) {
    return this.findOne({
      userId,
      friendId,
      status: 'pending',
    });
  }

  async findOutgoingRequests(userId: string) {
    return this.find({ userId, status: 'pending' });
  }

  async findIncomingRequest(userId: string, friendId: string) {
    return this.findPendingRequest(friendId, userId);
  }

  async findIncomingRequests(userId: string) {
    return this.find({ friendId: userId, status: 'pending' });
  }

  async isFriends(userId: string, friendId: string) {
    const foundEntry =
      (await this.findOne({
        userId,
        friendId,
        status: 'accepted',
      })) ||
      (await this.findOne({
        userId: friendId,
        friendId: userId,
        status: 'accepted',
      }));
    return !!foundEntry;
  }

  async findUserFriends(userId: string) {
    return this.entries.filter(
      (entry) =>
        (entry.userId === userId || entry.friendId === userId) &&
        entry.status === 'accepted',
    );
  }
}
