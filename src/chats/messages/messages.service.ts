import { Injectable } from '@nestjs/common';
import { MessagesModel } from './entity/messages.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonService } from '../../common/common.service';
import { PaginateMessageDto } from './dto/paginate-message.dto';

@Injectable()
export class ChatsMessagesService {
  constructor(
    @InjectRepository(MessagesModel)
    private readonly messagesRepository: Repository<MessagesModel>,
    private readonly commonService: CommonService,
  ) {}

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
