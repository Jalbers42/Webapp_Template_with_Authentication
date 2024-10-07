import { Module } from '@nestjs/common';
import { MatchmakingService } from './matchmaking.service';
import { SocketModule } from 'src/socket/socket.module';
import { MatchMakingGateway } from './matchmaking.gateway';
import { GameSessionModule } from 'src/game-session/game-session.module';

@Module({
  imports: [SocketModule, GameSessionModule],
  providers: [MatchmakingService, MatchMakingGateway],
  controllers: []
})
export class MatchmakingModule {}

// providers: [MatchmakingService, MatchMakingGateway, GameSessionService],
// exports: [MatchmakingService],