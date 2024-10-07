import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class SocketAuthMiddleware {
    use(socket: Socket, next: Function) {
        socket.onAny((eventName) => {
            if (eventName !== 'authenticate' && !socket.data.authenticated) {
                console.log('SocketAuthMiddleware: Unauthorized access attempt on event:', eventName);
                socket.emit('Socket: Unauthorized', { message: 'You must authenticate first.' });
                return;
            }
        });
        next();
    }
}