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

import { useEffect, useRef, useState } from "react";
import { render_img } from "./render_image";
import { is_move_possible } from "./move_rules";
import { GameSession, LastMove, Position } from "@/types";
import { useWebSocketContext } from "@/context/WebSocketContext";
import { useUserContext } from "@/context/AuthContext";

const Chessboard = (props : {game_id : string}) => {
    
    console.log("Chessboard Render");

    const { user } = useUserContext();
    const { socket } = useWebSocketContext();
    const [piece, setPiece] = useState<Position | null>();
    const [turn, setTurn] = useState<string>('w');
    const [side, setSide] = useState<string | null>(null);
    const [opponent, setOpponent] = useState<string>("");
    const pieceRef = useRef(piece);
    pieceRef.current = piece;

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

    let board : string[][] = JSON.parse(JSON.stringify(stateBoard));

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
        board[row][col] = board[piece1.row][piece1.col] + 'x';
        board[piece1.row][piece1.col] = "00x";
    }
    
    const remove_highlights = () => {
        board.map((element, i) => {
            element.map((piece, j) => {
                if (piece[2] == 'x') {
                    board[i][j] = board[i][j].slice(0, -1);
                }
            })
        })
    }
    
    const   make_move = (row : number, col : number) => {
        if (piece && side == turn && board[piece.row][piece.col][0] == turn && is_move_possible(board, piece, {row, col})) {
            remove_highlights();
            switch_pieces(piece, row, col);
            switch_turn();
            setPiece(null);
            socket?.emit('movePiece', {game_id :props.game_id as string, board: board as string[][]});
        }
        else if (board[row][col][0] != '0')
            selectPiece(row, col);
        setStateBoard(board);
    }

    useEffect(() => {
        if (socket) {
            const getGameSession = (data : GameSession) => {
                console.log("getGameSession received");
                const { username_white, username_black, turn, start_time, board: new_board } = data;
                if (username_white == user.username) {
                    setSide('w');
                    setOpponent(username_black);
                }
                else {
                    setSide('b');
                    setOpponent(username_white);
                }
                setTurn(turn);
                setStateBoard(new_board);
            }
            const updateBoard = (new_board : string[][], turn : string) => {
                if (pieceRef.current)
                    new_board[pieceRef.current.row][pieceRef.current.col] += 'x';
                setStateBoard(new_board);
                setTurn(turn);
                console.log("Board update received ", turn);
            };
            socket.on('updateBoard', updateBoard);
            socket.on('getGameSession', getGameSession);
            if (props.game_id)
                socket.emit('getGameSession', props.game_id);
            return () => {
                socket.off('updateBoard', updateBoard);
                socket.off('getGameSession', getGameSession);
            };
        }
    }, [socket]);

  return (
    <div className="chessboard">
        <div>{opponent}</div>
        {side && stateBoard.map((row, original_i) => (
            <div key={original_i} className="flex">
                {row.map((piece, original_j) => {
                    const i = side === 'b' ? 7 - original_i : original_i;
                    const j = side === 'b' ? 7 - original_j : original_j;
                    return (
                    <div key={j} onClick={() => make_move(i, j)} className={`w-[var(--tile-size)] h-[var(--tile-size)] ${((j + i) % 2 == 0) ? "bg-light_tile" : "bg-dark_tile"}`}>
                        <div className={`w-full h-full ${(stateBoard[i][j][2] == 'x' && "bg-[var(--player-tile)]")}`}>
                            {render_img(stateBoard[i][j])}
                        </div>
                    </div>
                )})}
            </div>    
        ))}
        <div>{user.username}</div>
    </div>
  )
}

export default Chessboard