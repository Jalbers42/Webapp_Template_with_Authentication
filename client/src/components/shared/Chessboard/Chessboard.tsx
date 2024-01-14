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

import { useState } from "react";
import { render_img } from "./render_image";
import { is_move_possible } from "./move_rules";
import { LastMove, Position } from "@/types";

const Chessboard = () => {
    
    const [piece, setPiece] = useState<Position | null>();
    const [lastMove, setLastMove] = useState<LastMove>();
    const [turn, setTurn] = useState('w');

    const [stateBoard, setStateBoard] = useState<string[][]>([
        ['br','bn','bb','bq','bk','bb','bn','br'],
        ['bp','bp','bp','bp','bp','bp','bp','bp'],
        ['00','00','00','00','00','00','00','00'],
        ['00','00','00','00','00','00','00','00'],
        ['00','00','00','00','00','00','00','00'],
        ['00','00','00','00','00','00','00','00'],
        ['wp','wp','wp','wp','wp','wp','wp','wp'],
        ['wr','wn','wb','wq','wk','wb','wn','wr']
    ]);

    const board = [...stateBoard];

    const   selectPiece = (row : number, col : number) => {
        if (piece)
            board[piece.row][piece.col] = board[piece.row][piece.col].slice(0, -1);
        setPiece({row, col});
        board[row][col] += 'x';
    }

    const switch_turn = () => {
        if (turn == 'w')
            setTurn('b');
        else
            setTurn('w');
    }
    
    const switch_pieces = (piece1 : Position, row : number, col : number) => {
        board[row][col] = board[piece1.row][piece1.col];
        board[piece1.row][piece1.col] = "00x";
    }
    
    const update_last_move = (piece : Position, row : number, col : number) => {
        if (lastMove) {
            board[lastMove.start_pos.row][lastMove.start_pos.col] = board[lastMove.start_pos.row][lastMove.start_pos.col].slice(0, -1)
            board[lastMove.end_pos.row][lastMove.end_pos.col] = board[lastMove.end_pos.row][lastMove.end_pos.col].slice(0, -1)
        }
        setLastMove({start_pos: piece, end_pos: {row, col}});
    }
    
    const   make_move = (row : number, col : number) => {
        if (board[row][col][0] == turn)
            selectPiece(row, col);
        else if (piece && is_move_possible(board, piece, {row, col})) {
            update_last_move(piece, row, col);
            switch_pieces(piece, row, col);
            switch_turn();
            setPiece(null);
        }
        setStateBoard(board);
    }
    
  return (
    <div className="chessboard">
        {stateBoard.map((row, i) => (
            <div key={i} className="flex">
                {row.map((piece, j) => (
                    <div key={j} onClick={() => make_move(i, j)} className={`w-[var(--tile-size)] h-[var(--tile-size)] ${((j + i) % 2 == 0) ? "bg-light_tile" : "bg-dark_tile"}`}>
                        <div className={`w-full h-full ${(stateBoard[i][j][2] == 'x' && "bg-[var(--player-tile)]")}`}>
                            {render_img(piece)}
                        </div>
                    </div>
                ))}
            </div>    
        ))}
    </div>
  )
}

export default Chessboard