import { Controller, Get, Param, Query } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { PaginateMessageDto } from './dto/paginate-message.dto';

@Controller('chats/:cid/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  paginateMessages(@Query() dto: PaginateMessageDto, @Param('cid') id: number) {
    return this.messagesService.paginateMessages(dto, {
      where: {
        chat: {
          id,
        },
      },
      relations: {
        chat: true,
        author: true,
      },
    });
  }
}
