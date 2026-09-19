import {
  DefaultEntry,
  InMemoryRepository,
} from '../../../common/in-memory.repository';

export interface UserEntry extends DefaultEntry {
  email: string;
  username: string;
  passwordHash: string;
}

export class UserRepository extends InMemoryRepository<UserEntry> {
  async findByEmail(email: string) {
    return this.findOne({ email });
  }
}
