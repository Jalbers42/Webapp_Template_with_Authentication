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
import { can_piece_move_like_this } from "./move_rules";
import { Position } from "@/types";

const Chessboard = () => {
    
    const [piece, setPiece] = useState<Position | null>();
    const [turn, setTurn] = useState('w');

    const [stateBoard, setStateBoard] = useState<string[][]>([
        ['br','bn','bb','bq','bk','bb','bn','br'],
        ['bp','bp','bp','bp','bp','bp','bp','bp'],
        ['0','0','0','0','0','0','0','0'],
        ['0','0','0','0','0','0','0','0'],
        ['0','0','0','0','0','0','0','0'],
        ['0','0','0','0','0','0','0','0'],
        ['wp','wp','wp','wp','wp','wp','wp','wp'],
        ['wr','wn','wb','wq','wk','wb','wn','wr']
    ]);

    const board = [...stateBoard];

    const   selectPiece = (row : number, col : number) => {
        if (turn === 'w' && board[row][col][0] === 'w')
            setPiece({row: row, col: col});
        else if (turn === 'b' && board[row][col][0] === 'b')
            setPiece({row: row, col: col});
    }

    const switch_turn = () => {
        if (turn === 'w')
            setTurn('b');
        else
            setTurn('w');
    }

    const move_piece = (row : number, col : number) => {
        if (piece) {
            board[row][col] = board[piece.row][piece.col];
            board[piece.row][piece.col] = '0';
        }
    }

    const is_move_possible = (row : number, col : number) => {
        if (!piece)
            return (false);
        if (piece.row === row && piece.col === col)
            return (false);
        if (!can_piece_move_like_this(board, piece, {row, col}))
            return (false);
        return (true);
    }

    const   make_move = (row : number, col : number) => {
        if (!piece) {
            selectPiece(row, col);
        }
        else if (is_move_possible(row, col)) {
            move_piece(row, col);
            switch_turn();
            setPiece(null);
        }
        setStateBoard(board);
    }
    
  return (
    <div>
        {board.map((row, i) => (
            <div key={i} className="flex">
                {row.map((piece, j) => (
                    <div onClick={() => make_move(i, j)} className={`w-[var(--tile-size)] h-[var(--tile-size)] ${((j + i) % 2 == 0) ? "bg-light_tile" : "bg-dark_tile"}`}>
                        {render_img(piece)}
                    </div>
                ))}
            </div>    
        ))}
    </div>
  )
}

export default Chessboard