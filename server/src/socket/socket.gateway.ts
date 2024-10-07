import { OnModuleInit } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';
import { FirebaseService } from "src/firebase/firebase.service";
import { SocketAuthMiddleware } from "./socket.middleware";

@WebSocketGateway({
    cors: { origin: 'http://localhost:5173'}
})
export class SocketGateway implements OnModuleInit{

    @WebSocketServer()
    server : Server

    constructor(private firebaseService: FirebaseService, private socketAuthMiddleware: SocketAuthMiddleware) {}

    onModuleInit() {

        // Apply authentication middleware
        this.server.use((socket: Socket, next) => {
            this.socketAuthMiddleware.use(socket, next);
        });

        this.server.on('connection', (socket: Socket) => {
            console.log("Client connected, ID:", socket.id);
        });

    }

    @SubscribeMessage('authenticate')
    async authenticate(@MessageBody() token: string, @ConnectedSocket() socket: Socket) {
        if (!token) {
            console.log('No token provided for authentication.');
            socket.emit('unauthorized', { message: 'No token provided' });
            socket.disconnect();
        }
        try {
            const decodedToken = await this.firebaseService.verify_firebase_jwt_token(token);
            socket.data.authenticated = true;
            socket.data.username = decodedToken.name || 'Anonymous';
            socket.data.uid = decodedToken.uid;
            socket.emit('authenticated');
            console.log(`User authenticated: ${socket.data.username}, ${socket.data.uid}`);
        } catch (error) {
            console.error('Authentication failed:', error.message);
            socket.emit('unauthorized', { message: 'Invalid token' });
            socket.disconnect();
        }
    }
}