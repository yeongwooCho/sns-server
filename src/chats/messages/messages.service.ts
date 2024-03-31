import { Injectable } from '@nestjs/common';
import { MessagesModel } from './entity/messages.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonService } from '../../common/common.service';
import { PaginateMessageDto } from './dto/paginate-message.dto';
import { CreateMessagesDto } from './dto/create-messages.dto';

@Injectable()
export class ChatsMessagesService {
  constructor(
    @InjectRepository(MessagesModel)
    private readonly messagesRepository: Repository<MessagesModel>,
    private readonly commonService: CommonService,
  ) {}

  async createMessage(dto: CreateMessagesDto) {
    const message = await this.messagesRepository.save({
      chat: {
        id: dto.chatId,
      },
      author: {
        id: dto.authorId,
      },
      message: dto.message,
    });

    return this.messagesRepository.findOne({
      where: {
        id: message.id,
      },
    });
  }

  async paginateMessages(
    dto: PaginateMessageDto,
    overrideFunctions: FindManyOptions<MessagesModel>,
  ) {
    return this.commonService.paginate<MessagesModel>(
      dto,
      this.messagesRepository,
      overrideFunctions,
      'messages',
    );
  }
}
