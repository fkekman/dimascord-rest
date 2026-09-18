export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
}

export interface CreateUserDto extends Omit<User, 'id'> {}
