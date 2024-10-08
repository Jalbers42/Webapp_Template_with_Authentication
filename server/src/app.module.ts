import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { MatchmakingModule } from './matchmaking/matchmaking.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GameSessionModule } from './game-session/game-session.module';
import { SocketModule } from './socket/socket.module';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';

@Module({
    imports: [
        SocketModule,
        MatchmakingModule,
        GameSessionModule,
        EventEmitterModule.forRoot(),
        FirebaseModule,
        AuthModule,
    ],
    controllers: [
        AppController
    ],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: AuthGuard
        },
        Reflector
    ],
})
export class AppModule {}
