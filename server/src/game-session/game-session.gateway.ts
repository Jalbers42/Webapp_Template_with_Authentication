/******************************************************************************/
/*                                                                            */
/*                                                        :::      ::::::::   */
/*                                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*                                                  +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Jalbers42                                         #+#    #+#             */
/*   https://github.com/Jalbers42                     ###   ###########       */
/*                                                                            */
/******************************************************************************/

import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { SocketGateway } from "src/socket/socket.gateway";
import { GameSessionService } from "./game-session.service";
import { GameSession, MovePieceMsg, FirebaseGameSession, ClientGameSession, PromotePieceMsg } from "src/app.types";
import { Inject, forwardRef } from "@nestjs/common";
import { Socket } from "socket.io";
import { FirebaseService } from "src/firebase/firebase.service";

@WebSocketGateway()
export class GameSessionGateway {

    constructor(
        private socketGateway: SocketGateway,
        @Inject(forwardRef(() => GameSessionService))
        private gameSessionService: GameSessionService,
        private firebaseService: FirebaseService
    ){}

    handleMatchCreated(game_id : string, gameSession : FirebaseGameSession) {
        this.socketGateway.server.to(gameSession.player_white.socket_id).emit('match created', game_id);
        this.socketGateway.server.to(gameSession.player_black.socket_id).emit('match created', game_id);
    }

    @SubscribeMessage('getGameSession')
    async getBoard(@MessageBody() game_id : string, @ConnectedSocket() socket : Socket) {
        const gameSession : GameSession  = await this.firebaseService.get_game_session_from_db(game_id);
        const clientGameSession : ClientGameSession = {
            username_white : gameSession.player_white.username,
            username_black : gameSession.player_black.username,
            turn: gameSession.turn,
            start_time: gameSession.start_time,
            board : gameSession.board
        }
        console.log(clientGameSession)
        this.socketGateway.server.to(socket.id).emit('getGameSession', clientGameSession);
    }

    @SubscribeMessage('movePiece')
    movePiece(@MessageBody()  movePieceMsg : MovePieceMsg) {
        this.gameSessionService.updateBoard(
            movePieceMsg.game_id,
            movePieceMsg.username,
            movePieceMsg.old_pos,
            movePieceMsg.new_pos);
    }

    @SubscribeMessage('promotePiece')
    promotePiece(@MessageBody()  promotePieceMsg : PromotePieceMsg) {
        this.gameSessionService.promotePiece(
            promotePieceMsg.game_id,
            promotePieceMsg.username,
            promotePieceMsg.type,
            promotePieceMsg.position);
    }

    sendBoardUpdate(gameSession : GameSession) {
        this.socketGateway.server.to(gameSession.player_white.socket_id).emit('updateBoard', gameSession.board, gameSession.turn);
        this.socketGateway.server.to(gameSession.player_black.socket_id).emit('updateBoard', gameSession.board, gameSession.turn);
    }

    // sendResetMove(gameSession : GameSession) {
    //     // if (gameSession.turn == 'w')
    //         this.socketGateway.server.to(gameSession.player_white.socket_id).emit('Reset move', gameSession.board, gameSession.turn);
    //     // else
    //         this.socketGateway.server.to(gameSession.player_black.socket_id).emit('Reset move', gameSession.board, gameSession.turn);
    // }

}