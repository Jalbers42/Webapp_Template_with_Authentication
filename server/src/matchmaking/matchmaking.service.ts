import { Injectable } from '@nestjs/common';
import { Player } from '../app.types';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { GameSessionService } from 'src/game-session/game-session.service';


/* 
    The mathmaking service needs to match players of equal rating. 
    
    When a player enters the queue

    Factors:
        - Rating
        - Waiting time
        - Location // can be ignored for now

*/

@Injectable()
export class MatchmakingService {

    private queue : Player[] = [];
    private players_in_queue = {}

    constructor(private gameSessionService : GameSessionService) {}

    addToQueue(player : Player) {
        this.queue.push(player);
        this.tryMatch();
    }
   
    private tryMatch() {
        if (this.queue.length >= 2) {
            const player1 = this.queue.pop()
            const player2 = this.queue.pop()
            this.gameSessionService.createGameSession(player1, player2);
        }
    }
    
}
