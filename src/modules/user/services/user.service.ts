import { Injectable } from '@nestjs/common';
import { CreateUserDto, User } from '../interfaces/user-service.interface';

@Injectable()
export class UserService {
  async canLogin(_userId: string) {
    return true;
  }
  async findUserByEmail(_email: string): Promise<User | null> {
    return {
      id: 'someId',
      username: '1212',
      email: 'asdfasdf',
      passwordHash: 'some_hash',
    };
  }

  async create(_dto: CreateUserDto): Promise<User> {
    return {
      id: 'someId',
      username: 'sdasd',
      email: 'asdfasdf',
      passwordHash: 'dfadsfadsf',
    };
  }
}
