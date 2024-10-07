import { OnModuleInit } from "@nestjs/common";
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from 'socket.io';

@WebSocketGateway({
    namespace: "chat",
    cors: {
        origin: 'http://localhost:5173',
        // methods: ["GET", "POST"],
        // allowedHeaders: [],
        // credentials: true
      }
})
export class ChatGateway implements OnModuleInit{

    @WebSocketServer()
    server : Server

    onModuleInit() {
        this.server.on('connection', (socket) => {
            console.log(socket.id);
            console.log('Connected');
        })
    }

    @SubscribeMessage('newMessage')
    onNewMessage(@MessageBody() body: any) {
        console.log(body);
        this.server.emit('onMessage', {
            msg: 'New Message',
            content: body
        })
    }
}