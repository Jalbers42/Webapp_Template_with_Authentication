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
import { GameSession, Position, Tile } from "@/types & constants/types";
import { useWebSocketContext } from "@/context/WebSocketContext";
import { useUserContext } from "@/context/AuthContext";
import CapturedPieces from "./CapturedPieces";
import Promotion from "./Promotion";
import { CHESSBOARD, COLUMNS } from "@/types & constants/constants";
import { is_king_in_check } from "./check_logic";

const Chessboard = (props : {game_id : string}) => {

    console.log("Chessboard Render");

    const { user } = useUserContext();
    const { socket } = useWebSocketContext();
    const [focusPiece, setfocusPiece] = useState<Position | null>(null);
    const [turn, setTurn] = useState<string>('w');
    const [side, setSide] = useState<string | null>(null);
    const [isPromotionOpen, setIsPromotionOpen] = useState<boolean>(false);
    const [opponent, setOpponent] = useState<string>("");
    const [promotedPieceType, setPromotedPieceType] = useState<string | null>(null);
    const [promotedPiecePosition, setPromotedPiecePosition] = useState<Position | null>(null);
    const [preMove, setPreMove] = useState<Position | null>(null);

    const focusPieceRef = useRef(focusPiece);
    focusPieceRef.current = focusPiece;
    const preMoveRef = useRef(preMove);
    preMoveRef.current = preMove;

    const [stateBoard, setStateBoard] = useState<Tile[][]>([]);

    // JSON stringify and parse to ensure board is a copy
    let board : Tile[][] = JSON.parse(JSON.stringify(stateBoard));

    const selectPiece = (tile : Position) => {
        if (board[tile.row][tile.col].piece[0] != '0') {
            if (focusPiece)
                board[focusPiece.row][focusPiece.col].piece = board[focusPiece.row][focusPiece.col].piece.slice(0, 2);
            if (board[tile.row][tile.col].piece.length <= 2)
                board[tile.row][tile.col].piece += 'x';
            setfocusPiece(tile);
        }
    }

    const switch_turn = () => {
        if (turn == 'w')
            setTurn('b');
        else
            setTurn('w');
    }

    const move_piece = (old_pos: Position, new_pos: Position) => {
        board[new_pos.row][new_pos.col].piece = board[old_pos.row][old_pos.col].piece;
        board[new_pos.row][new_pos.col].lastMove = true;
        board[old_pos.row][old_pos.col].piece = "00";
        board[old_pos.row][old_pos.col].lastMove = true;
    }

    const remove_highlights = () => {
        board.map((element, i) => {
            element.map((tile, j) => {
                if (tile.lastMove) {
                    board[i][j].lastMove = false;
                }
            })
        })
    }

    const handle_promotion = async (new_pos : Position) => {
        if ((new_pos.row == 0 || new_pos.row == 7) && board[new_pos.row][new_pos.col].piece[1] == 'p') {
            setIsPromotionOpen(true);
            setPromotedPiecePosition(new_pos);
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


    const send_move_to_server = (old_pos : Position, new_pos : Position) => {
        socket?.emit('movePiece', {
            game_id : props.game_id as string,
            username: user.username as string,
            old_pos: old_pos as Position,
            new_pos: new_pos as Position
        });
    }

    const selectPreMove = (tile : Position) => {
        if (focusPiece) {
            setPreMove(tile);
            board[focusPiece.row][focusPiece.col].preMove = true;
            board[tile.row][tile.col].preMove = true;
        }
    }

    const execute_move = (old_pos : Position, new_pos : Position) => {
        console.log("execute ", focusPiece);
        move_piece(old_pos, new_pos);
        remove_highlights();
        send_move_to_server(old_pos, new_pos);
        handle_promotion(new_pos);
        switch_turn();
        setfocusPiece(null);
    }

    const handle_click_tile = (tile : Position) => {
        if (focusPiece && focusPiece.row == tile.row && focusPiece.col == tile.col) {
            return;
        }
        else if (focusPiece && board[focusPiece.row][focusPiece.col].piece[0] == side && is_move_possible(board, focusPiece, tile)) {
            if (side != turn) {
                selectPreMove(tile);
            } else if (!is_king_in_check(board, focusPiece, tile, side)) {
                execute_move(focusPiece, tile);
            }
        }
        else
            selectPiece(tile);
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
            if (focusPieceRef.current)
                new_board[focusPieceRef.current.row][focusPieceRef.current.col] += 'x';
            setStateBoard(new_board);
            setTurn(turn);
            if (preMoveRef.current && focusPieceRef.current && true) {
                // add check check
                execute_move(focusPieceRef.current, preMoveRef.current);
            }
            console.log("Board update received");
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

useEffect(() => {
    if (promotedPieceType !== null && promotedPiecePosition !== null) {
        board[promotedPiecePosition.row][promotedPiecePosition.col].piece = promotedPieceType;
        setStateBoard(board);
        send_promotion_to_server();
        setPromotedPieceType(null);
        setPromotedPiecePosition(null);
        setIsPromotionOpen(false);
    }
}, [promotedPieceType])

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
                            <div key={j} onClick={() => handle_click_tile({row: i, col: j})} className={`w-[var(--tile-size)] h-[var(--tile-size)] ${((j + i) % 2 == 0) ? "bg-light_tile" : "bg-dark_tile"}`}>
                                <div className={`w-full h-full ${(stateBoard[i][j].focus && "bg-[var(--player-tile)]")} ${(stateBoard[i][j].preMove && "bg-[var(--preselect-tile)]")}`}>
                                    {render_img(stateBoard[i][j].piece)}
                                </div>
                            </div>
                    )})}
                </div>
        )})}
        <div className="flex ml-[30px]">
            {COLUMNS.map((element, original_i) => {
                const i = side === 'w' ? original_i : 7 - original_i;
                return (<div key={i} className="flex items-center justify-center w-[var(--tile-size)] h-[30px]">{COLUMNS[i]}</div>)
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