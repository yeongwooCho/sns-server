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
    // room에 있는 모든 클라이언트에게 메시지를 전송한다.
    // this.server 은 서버 전체에 보내는 것을 의미한다.
    // this.server
    //   .in(message.chatId.toString())
    //   .emit('receive_message', message.message);

    // room에 있는 나를 제외한 모든 클라이언트에게 메시지를 전송한다.
    socket
      .to(message.chatId.toString())
      .emit('receive_message', message.message);
  }
}
