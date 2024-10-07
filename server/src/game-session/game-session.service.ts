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

import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { GameSession, Player, BOARD_SETUP, FirebaseGameSession, Position } from 'src/app.types';
import { GameSessionGateway } from './game-session.gateway';
import { FirebaseService } from 'src/firebase/firebase.service';
import { MoveRulesService } from './move_rules.service';
import { FieldValue } from 'firebase-admin/firestore';

@Injectable()
export class GameSessionService {

    constructor(
        @Inject(forwardRef(() => GameSessionGateway))
        private gameSessionGateway: GameSessionGateway,
        private firebaseService: FirebaseService,
        private moveRulesService: MoveRulesService
    ) {}

    async createGameSession(player1 : Player, player2 : Player ) {
        const newFirebaseGameSession : FirebaseGameSession = {
            player_white: player1,
            player_black: player2,
            turn: 'w',
            start_time: this.firebaseService.get_firebase_server_timestamp_field(),
            row_0 : ['bry','bn','bb','bq','bky','bb','bn','bry'],
            row_1 : ['bp','bp','bp','bp','bp','bp','bp','bp'],
            row_2 : ['00','00','00','00','00','00','00','00'],
            row_3 : ['00','00','00','00','00','00','00','00'],
            row_4 : ['00','00','00','00','00','00','00','00'],
            row_5 : ['00','00','00','00','00','00','00','00'],
            row_6 : ['wp','wp','wp','wp','wp','wp','wp','wp'],
            row_7 : ['wry','wn','wb','wq','wky','wb','wn','wry']
        }
        const id : string = await this.firebaseService.add_game_session_to_db(newFirebaseGameSession);
        this.gameSessionGateway.handleMatchCreated(id, newFirebaseGameSession);
    }

    is_players_turn(gameSession : GameSession, username : string) {
        if (username == gameSession.player_white.username && gameSession.turn == 'w')
            return (true);
        else if (username == gameSession.player_black.username && gameSession.turn == 'b')
            return (true);
        return (false);
    }

    switch_turn(gameSession : GameSession) {
        if (gameSession.turn == 'w')
            gameSession.turn = 'b';
        else
            gameSession.turn = 'w';
    }

    remove_last_move_x(board : string[][]){
        board.map((element, i) => {
            element.map((piece, j) => {
                if (piece[2] == 'x') {
                    board[i][j] = board[i][j].slice(0, -1);
                }
            })
        })
    }

    is_player_moving_his_piece(gameSession : GameSession, old_pos : Position) {
        if (gameSession.board[old_pos.row][old_pos.col][0] == gameSession.turn)
            return (true);
        return (false);
    }

    new_pos_is_empty_or_enemy(gameSession : GameSession, new_pos : Position) {
        if (gameSession.board[new_pos.row][new_pos.col][0] == gameSession.turn)
            return (false);
        return (true);
    }

    switch_pieces(board : string[][], old_pos : Position, new_pos : Position) {
        board[new_pos.row][new_pos.col] = board[old_pos.row][old_pos.col] + 'x';
        board[old_pos.row][old_pos.col] = "00x";
    }

    is_pawn_awaiting_promotion(board : string[][]) {
        for (let i = 0; i < 8; i++) {
            if (board[0][i][1] == 'p' || board[7][i][1] == 'p')
                return (true);
        }
        return (false);
    }

    async promotePiece(game_id : string, username : string, type : string, pos: Position) {
        const gameSession : GameSession = await this.firebaseService.get_game_session_from_db(game_id);
        if (
            gameSession &&
            (pos.row == 0 || pos.row == 7) &&
            gameSession.board[pos.row][pos.col][1] == 'p'
        ) {
            gameSession.board[pos.row][pos.col] = type;
            this.firebaseService.update_game_session_in_db(game_id, gameSession);
        }
        this.gameSessionGateway.sendBoardUpdate(gameSession);
    }

    async updateBoard(game_id : string, username : string, old_pos : Position, new_pos : Position) {
        const gameSession : GameSession = await this.firebaseService.get_game_session_from_db(game_id);

        // What if game session is null...

        if (
            gameSession &&
            this.is_players_turn(gameSession, username) &&
            this.is_player_moving_his_piece(gameSession, old_pos) &&
            this.new_pos_is_empty_or_enemy(gameSession, new_pos) &&
            !this.is_pawn_awaiting_promotion(gameSession.board) &&
            this.moveRulesService.is_move_possible(gameSession.board, old_pos, new_pos, gameSession.turn)
            ) {
            this.remove_last_move_x(gameSession.board);
            this.switch_pieces(gameSession.board, old_pos, new_pos);
            this.switch_turn(gameSession);
            this.firebaseService.update_game_session_in_db(game_id, gameSession);
        }
        this.gameSessionGateway.sendBoardUpdate(gameSession);
    }
}
