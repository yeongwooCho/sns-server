import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UsersModel } from './entity/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserFollowersModel } from './entity/user-followers.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,

    @InjectRepository(UserFollowersModel)
    private readonly userFollowersRepository: Repository<UserFollowersModel>,
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

  async createUser(user: Pick<UsersModel, 'nickname' | 'email' | 'password'>) {
    // nickname 중복 확인
    const nicknameExists = await this.usersRepository.exists({
      where: {
        nickname: user.nickname,
      },
    });
    if (nicknameExists) {
      throw new BadRequestException('이미 존재하는 닉네임 입니다.');
    }

    // email 중복확인
    const emailExists = await this.usersRepository.exists({
      where: {
        email: user.email,
      },
    });
    if (emailExists) {
      throw new BadRequestException('이미 존재하는 이메일 입니다.');
    }

    const userObj = this.usersRepository.create({
      nickname: user.nickname,
      email: user.email,
      password: user.password,
    });

    return await this.usersRepository.save(userObj);
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

  async getFollowers(userId: number): Promise<UsersModel[]> {
    /**
     * id: number;
     * follower: UsersModel;
     * followee: UsersModel;
     * isConfirmed: boolean;
     * createdAt: Date;
     * updatedAt: Date;
     * 우리는 followee 를 userId로 선택한 사람들을 찾아야한다.
     */
    const result = await this.userFollowersRepository.find({
      where: {
        followee: {
          id: userId,
        },
      },
      relations: {
        follower: true,
        followee: true,
      },
    });

    return result.map((item) => item.follower);
  }

  async followUser(userId: number, targetId: number) {
    const result = await this.userFollowersRepository.save({
      follower: {
        id: userId,
      },
      followee: {
        id: targetId,
      },
    });

    return true;
  }
}
