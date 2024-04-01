import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatsService } from './chats.service';
import { EnterChatDto } from './dto/enter-chat.dto';
import { CreateMessagesDto } from './messages/dto/create-messages.dto';
import { MessagesService } from './messages/messages.service';
import {
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SocketCatchHttpExceptionFilter } from '../common/exception-filter/socket-catch-http.exception-filter';
import { UsersModel } from '../users/entities/users.entity';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';

@WebSocketGateway({
  // ws://localhost:3000/chats
  namespace: 'chats',
})
export class ChatsGateway implements OnGatewayConnection {
  constructor(
    private readonly chatsService: ChatsService,
    private readonly messagesService: MessagesService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(socket: Socket & { user: UsersModel }) {
    console.log(`on connect called: ${socket.id}`);

    const headers = socket.handshake.headers;

    const rawToken = headers['authorization'];

    if (!rawToken) {
      socket.disconnect();
    }

    try {
      const token = this.authService.extractTokenFromHeader(rawToken, true);

      // payload 정보를 가져올 수 있다.
      const payload = this.authService.verifyToken(token);
      const user = await this.usersService.getUserByEmail(payload.email);

      // REST API 였으면 request 에 넣어줬을 것이다.
      socket.user = user;

      return true;
    } catch (e) {
      socket.disconnect();
    }
  }

  @UsePipes(
    new ValidationPipe({
      // DTO 에서 class-validator 데코레이터를 사용하면 자동으로 유효성 검사를 수행한다.
      // 이때 transform 옵션을 true 로 설정하면 요청이 들어올 때 자동으로 타입 변환을 수행한다.
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  @SubscribeMessage('create_chat')
  async createChat(
    @MessageBody() data: CreateChatDto,
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    const chat = await this.chatsService.createChat(data);
  }

  @UsePipes(
    new ValidationPipe({
      // DTO 에서 class-validator 데코레이터를 사용하면 자동으로 유효성 검사를 수행한다.
      // 이때 transform 옵션을 true 로 설정하면 요청이 들어올 때 자동으로 타입 변환을 수행한다.
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  @SubscribeMessage('enter_chat')
  async enterChat(
    @MessageBody() data: EnterChatDto,
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    console.log(`enter chat called: ${data.chatIds}`);

    for (const chatId of data.chatIds) {
      const exists = await this.chatsService.checkIfChatExists(chatId);

      if (!exists) {
        throw new WsException({
          code: 100,
          message: `존재하지 않는 chat 입니다. chatId: ${chatId}`,
        });
      }
    }

    socket.join(data.chatIds.map((chatId) => chatId.toString()));
  }

  @UsePipes(
    new ValidationPipe({
      // DTO 에서 class-validator 데코레이터를 사용하면 자동으로 유효성 검사를 수행한다.
      // 이때 transform 옵션을 true 로 설정하면 요청이 들어올 때 자동으로 타입 변환을 수행한다.
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  @SubscribeMessage('send_message')
  async sendMessage(
    @MessageBody() dto: CreateMessagesDto,
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    // socket.on('send_message', (message) => { console.log(message); });
    const chatExists = await this.chatsService.checkIfChatExists(dto.chatId);
    if (!chatExists) {
      throw new WsException({
        code: 100,
        message: `존재하지 않는 chat 입니다. chatId: ${dto.chatId}`,
      });
    }

    const message = await this.messagesService.createMessage(
      dto,
      socket.user.id,
    );

    // room에 있는 나를 제외한 모든 클라이언트에게 메시지를 전송한다.
    socket
      .to(message.chat.id.toString())
      .emit('receive_message', message.message);
  }
}
