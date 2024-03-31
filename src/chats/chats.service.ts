import { Injectable } from '@nestjs/common';
import { ChatsModel } from './entity/chats.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateChatDto } from './dto/create-chat.dto';
import { CommonService } from '../common/common.service';
import { PaginateChatDto } from './dto/paginate-chat.dto';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(ChatsModel)
    private readonly chatsRepository: Repository<ChatsModel>,
    private readonly commonService: CommonService,
  ) {}

  paginateChats(dto: PaginateChatDto) {
    return this.commonService.paginate<ChatsModel>(
      dto,
      this.chatsRepository,
      {
        relations: {
          users: true,
        },
      },
      'chats',
    );
  }

  async createChat(dto: CreateChatDto) {
    const chat = await this.chatsRepository.save({
      // dto.users.map((userId) => ({ id: userId })) -> [{ id: 1 }, { id: 2 }]
      users: [...dto.userIds.map((id) => ({ id }))],
    });

    return await this.chatsRepository.find({
      where: {
        id: chat.id,
      },
    });
  }
}
