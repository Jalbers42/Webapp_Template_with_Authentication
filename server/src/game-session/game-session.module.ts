import { Module } from '@nestjs/common';
import { GameSessionService } from './game-session.service';
import { GameSessionGateway } from './game-session.gateway';
import { SocketModule } from 'src/socket/socket.module';
import { FirebaseService } from 'src/firebase/firebase.service';
import { MoveRulesService } from './move_rules.service';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [SocketModule, FirebaseModule],
  providers: [GameSessionService, GameSessionGateway, MoveRulesService],
  exports: [GameSessionService]
})
export class GameSessionModule {}
