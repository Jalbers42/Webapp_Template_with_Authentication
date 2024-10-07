import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SocketAuthMiddleware } from './socket.middleware';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
    imports: [FirebaseModule],
    providers: [SocketGateway, SocketAuthMiddleware],
    exports: [SocketGateway]
})
export class SocketModule {}
