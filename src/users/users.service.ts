import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UsersModel } from './entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,
  ) {}

  async getAllUsers() {
    return await this.usersRepository.find();
  }

  async getUserByEmail(email: string) {
    return await this.usersRepository.findOne({
      where: {
        email,
      },
    });
  }

  async getUserById(id: number) {
    return await this.usersRepository.findOne({
      where: {
        id,
      },
    });
  }

  async createUser(nickname: string, email: string, password: string) {
    const newUser = this.usersRepository.create({
      nickname,
      email,
      password,
    });

    return await this.usersRepository.save(newUser);
  }

  async updateUser(
    id: number,
    nickname?: string,
    email?: string,
    password?: string,
  ) {
    const user = await this.usersRepository.findOne({
      where: {
        id,
      },
    });

    if (nickname) {
      user.nickname = nickname;
    }
    if (email) {
      user.email = email;
    }
    if (password) {
      user.password = password;
    }

    return await this.usersRepository.save(user);
  }

  async deleteUser(id: number) {
    await this.usersRepository.delete(id);

    return id;
  }
}
