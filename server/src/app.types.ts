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

import { FieldValue } from "firebase-admin/firestore";

export interface Player {
    username : string;
    socket_id : string;
}

export const BOARD_SETUP = [
    ['br','bn','bb','bq','bk','bb','bn','br'],
    ['bp','bp','bp','bp','bp','bp','bp','bp'],
    ['00','00','00','00','00','00','00','00'],
    ['00','00','00','00','00','00','00','00'],
    ['00','00','00','00','00','00','00','00'],
    ['00','00','00','00','00','00','00','00'],
    ['wp','wp','wp','wp','wp','wp','wp','wp'],
    ['wr','wn','wb','wq','wk','wb','wn','wr']
]

export interface GameSession {
    player_white : Player;
    player_black : Player;
    turn: string;
    start_time: FieldValue;
    board : string[][];
}
            
export interface FirebaseGameSession {
    player_white : Player;
    player_black : Player;
    turn: string;
    start_time: FieldValue;
    row_0 : string[];
    row_1 : string[];
    row_2 : string[];
    row_3 : string[];
    row_4 : string[];
    row_5 : string[];
    row_6 : string[];
    row_7 : string[];
    [key: string]: any; 
}

export interface ClientGameSession {
    username_white : string;
    username_black : string;
    turn: string;
    start_time: FieldValue;
    board : string[][];
}

export interface Position {
    row: number;
    col: number;
}

export interface MovePieceMsg {
    game_id : string;
    username: string;
    old_pos: Position;
    new_pos: Position;
}

export interface PromotePieceMsg {
    game_id : string;
    username: string;
    type: string;
    position: Position;
}