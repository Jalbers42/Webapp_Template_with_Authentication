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

@Module({
  imports: [SocketModule, MatchmakingModule, GameSessionModule, EventEmitterModule.forRoot(), FirebaseModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
