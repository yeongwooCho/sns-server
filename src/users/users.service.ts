import { BadRequestException, Injectable } from '@nestjs/common';
import { QueryRunner, Repository } from 'typeorm';
import { UsersModel } from './entity/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserFollowersModel } from './entity/user-followers.entity';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { ImageModel } from '../common/entity/image.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,

    @InjectRepository(UserFollowersModel)
    private readonly userFollowersRepository: Repository<UserFollowersModel>,
  ) {}

  getUsersRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<UsersModel>(UsersModel)
      : this.usersRepository;
  }

  getUserFollowersRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<UserFollowersModel>(UserFollowersModel)
      : this.userFollowersRepository;
  }

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

  async getFollowers(userId: number, includeNotConfirmed?: boolean) {
    /**
     * id: number;
     * follower: UsersModel;
     * followee: UsersModel;
     * isConfirmed: boolean;
     * createdAt: Date;
     * updatedAt: Date;
     * 우리는 followee 를 userId로 선택한 사람들을 찾아야한다.
     */
    const where: FindOptionsWhere<UserFollowersModel> = {
      followee: {
        id: userId,
      },
    };

    if (!includeNotConfirmed) {
      where.isConfirmed = true;
    }

    const result = await this.userFollowersRepository.find({
      where: where,
      relations: {
        follower: true,
        followee: true,
      },
    });

    return result.map((item) => ({
      id: item.follower.id,
      nickname: item.follower.nickname,
      email: item.follower.email,
      isConfirmed: item.isConfirmed,
    }));
  }

  async followUser(userId: number, targetId: number, qr?: QueryRunner) {
    const userFollowersRepository = this.getUserFollowersRepository(qr);

    await userFollowersRepository.save({
      follower: {
        id: userId,
      },
      followee: {
        id: targetId,
      },
    });

    return true;
  }

  async confirmFollow(userId: number, followerId: number, qr?: QueryRunner) {
    const userFollowersRepository = this.getUserFollowersRepository(qr);

    const existing = await userFollowersRepository.findOne({
      where: {
        follower: {
          id: followerId,
        },
        followee: {
          id: userId,
        },
      },
      relations: {
        // 아래 정보도 같이 불러온다.
        follower: true,
        followee: true,
      },
    });

    if (!existing) {
      throw new BadRequestException('존재하지 않는 팔로우 요청입니다.');
    }

    await userFollowersRepository.save({
      ...existing,
      isConfirmed: true,
    });

    return true;
  }

  async unfollowUser(followerId: number, followeeId: number, qr?: QueryRunner) {
    const userFollowersRepository = this.getUserFollowersRepository(qr);

    await userFollowersRepository.delete({
      follower: {
        id: followerId,
      },
      followee: {
        id: followeeId,
      },
    });

    return true;
  }
}
