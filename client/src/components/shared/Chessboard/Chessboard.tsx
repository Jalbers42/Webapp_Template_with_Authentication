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
import { GameSession, Position } from "@/types";
import { useWebSocketContext } from "@/context/WebSocketContext";
import { useUserContext } from "@/context/AuthContext";
import CapturedPieces from "./CapturedPieces";
import Promotion from "./Promotion";

const Chessboard = (props : {game_id : string}) => {
    
    console.log("Chessboard Render");

    const { user } = useUserContext();
    const { socket } = useWebSocketContext();
    const [piece, setPiece] = useState<Position | null>(null);
    const [turn, setTurn] = useState<string>('w');
    const [side, setSide] = useState<string | null>(null);
    const [isPromotionOpen, setIsPromotionOpen] = useState<boolean>(false);
    const [opponent, setOpponent] = useState<string>("");
    const [promotedPieceType, setPromotedPieceType] = useState<string | null>(null);
    const [promotedPiecePosition, setPromotedPiecePosition] = useState<Position | null>(null);
    
    console.log("Username: ", user.username);

    const columns : string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
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

    const selectPiece = (row : number, col : number) => {
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

    const handle_promotion = async (row : number, col : number) => {
        if ((row == 0 || row == 7) && board[row][col][1] == 'p') {
            setIsPromotionOpen(true);
            setPromotedPiecePosition({row, col});
        }
    }
    
    const send_promotion_to_server = () => {
        socket?.emit('promotePiece', {
            game_id : props.game_id as string,
            username: user.username as string,
            type: promotedPieceType as string,
            position: promotedPiecePosition as Position
        });
    }

    useEffect(() => {
        if (promotedPieceType !== null && promotedPiecePosition !== null) {
            board[promotedPiecePosition.row][promotedPiecePosition.col] = promotedPieceType;
            setStateBoard(board);
            send_promotion_to_server();
            setPromotedPieceType(null);
            setPromotedPiecePosition(null);
            setIsPromotionOpen(false);
        }
    }, [promotedPieceType])
    
    const send_move_to_server = (old_pos : Position, new_pos : Position) => {
        socket?.emit('movePiece', {
            game_id : props.game_id as string,
            username: user.username as string,
            old_pos: old_pos as Position,
            new_pos: new_pos as Position
        });
    }

    const preselectMove = (row : number, col : number) => {
        
    }
    
    const make_move = async (row : number, col : number) => {
        if (piece && board[piece.row][piece.col][0] == turn && is_move_possible(board, piece, {row, col})) {
            if (side != turn) {
                preselectMove();
            } else {
                switch_pieces(piece, row, col);
                remove_highlights();
                send_move_to_server(piece, {row, col});
                handle_promotion(row, col);
                switch_turn();
                setPiece(null);
            }
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
        <div className="ml-[30px]">
            <div>{opponent}</div>
            <CapturedPieces board={stateBoard} side={side}/>
        </div>
        {side && stateBoard.map((row, original_i) => { 
            const i = side === 'w' ? original_i : 7 - original_i;
            return (
                <div key={original_i} className="flex">
                    <div className="flex items-center justify-center w-[30px]">{8 - i}</div>
                    {row.map((piece, original_j) => {
                        const j = side === 'w' ? original_j : 7 - original_j;
                        return (
                            <div key={j} onClick={() => make_move(i, j)} className={`w-[var(--tile-size)] h-[var(--tile-size)] ${((j + i) % 2 == 0) ? "bg-light_tile" : "bg-dark_tile"}`}>
                                <div className={`w-full h-full ${(stateBoard[i][j][2] == 'x' && "bg-[var(--player-tile)]")}`}>
                                    {render_img(stateBoard[i][j])}
                                </div>
                            </div>
                    )})}
                </div>
        )})}
        <div className="flex ml-[30px]">
            {columns.map((element, original_i) => {
                const i = side === 'w' ? original_i : 7 - original_i;
                return (<div key={i} className="flex items-center justify-center w-[var(--tile-size)] h-[30px]">{columns[i]}</div>)
            })}
        </div>
        <div className="ml-[30px]">
            <div>{user.username}</div>
            <CapturedPieces board={stateBoard} side={side === 'w' ? 'b' : 'w'}/>
        </div>
        {isPromotionOpen && side && <Promotion side={side} setPromotedPieceType={setPromotedPieceType}/>}
    </div>
  )
}

export default Chessboard