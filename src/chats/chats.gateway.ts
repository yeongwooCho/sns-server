import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  // ws://localhost:3000/chats
  namespace: 'chats',
})
export class ChatsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  handleConnection(socket: Socket) {
    console.log(`on connect called: ${socket.id}`);
  }

  @SubscribeMessage('enter_chat')
  enterChat(@MessageBody() data: number[], @ConnectedSocket() socket: Socket) {
    console.log(`enter chat called: ${data}`);

    for (const chatId of data) {
      socket.join(chatId.toString());
    }
  }

  // socket.on('send_message', (message) => { console.log(message); });
  @SubscribeMessage('send_message')
  sendMessage(
    @MessageBody() message: { chatId: number; message: string },
    @ConnectedSocket() socket: Socket,
  ) {
    this.server.in(message.chatId.toString()).emit('receive_message', message);
  }
}
