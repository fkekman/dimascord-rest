import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, User } from '../interfaces/user-service.interface';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async canLogin(_userId: string) {
    return true;
  }
  async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async findUserById(id: string) {
    return this.userRepository.findOne({ id });
  }

  async create(dto: CreateUserDto): Promise<User> {
    return this.userRepository.create(dto);
  }

  async getCurrentUser(userId: string) {
    const foundUser = await this.findUserById(userId);
    if (!foundUser) {
      throw new NotFoundException('User not found');
    }
    return foundUser;
  }
}
