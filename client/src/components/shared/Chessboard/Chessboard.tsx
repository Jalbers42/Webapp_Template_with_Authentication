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
import { is_move_legal } from "./move_rules";
import { GameSession, Position, Tile } from "@/types & constants/types";
import { useWebSocketContext } from "@/context/WebSocketContext";
import { useUserContext } from "@/context/AuthContext";
import CapturedPieces from "./CapturedPieces";
import Promotion from "./Promotion";
import { COLUMNS, DefaultTileFields } from "@/types & constants/constants";
import { is_king_in_check } from "./check_logic";

const Chessboard = (props : {game_id : string}) => {

    console.log("Chessboard Render");

    const { user } = useUserContext();
    const { socket } = useWebSocketContext();

    const [stateBoard, setStateBoard] = useState<Tile[][]>([]);
    const boardRef = useRef<Tile[][]>([]);
    const focusTileRef = useRef<Tile | null>(null);
    const turnRef = useRef<string>('w');
    const sideRef = useRef<string | null>(null);
    const opponentRef = useRef<string>("");
    const isPromotionOpenRef = useRef<boolean>(false);
    const promotedPieceRef = useRef<Tile | null>(null);
    const preMoveRef = useRef<Tile[]>([]);

    const selectPiece = (tile : Tile) => {
        if (tile.piece[0] != '0') {
            if (focusTileRef.current)
                focusTileRef.current.focus = false;
            focusTileRef.current = tile;
            tile.focus = true;
        }
    }

    const switch_turn = () => {
        if (turnRef.current == 'w')
            turnRef.current = 'b';
        else
            turnRef.current = 'w';
    }

    const move_piece = (old_tile: Tile, new_tile: Tile) => {
        new_tile.piece = old_tile.piece;
        new_tile.lastMove = true;
        old_tile.piece = "00";
        old_tile.lastMove = true;
    }

    const remove_highlights = (board : Tile[][]) => {
        board.map((element, i) => {
            element.map((tile, j) => {
                if (tile.lastMove) {
                    board[i][j].lastMove = false;
                }
            })
        })
    }

    const handle_promotion = (new_tile : Tile) => {
        if ((new_tile.row == 0 || new_tile.row == 7) && new_tile.piece[1] == 'p') {
            isPromotionOpenRef.current = true;
            promotedPieceRef.current = new_tile;
        }
    }

    const update_promoted_piece = (selected_piece : string) => {
        let promotedPiece = promotedPieceRef.current;
        if (promotedPiece) {
            boardRef.current[promotedPiece.row][promotedPiece.col].piece = selected_piece;
            isPromotionOpenRef.current = false;
            setStateBoard(boardRef.current);
            socket?.emit('promotePiece', {
                game_id : props.game_id as string,
                username: user.username as string,
                type: selected_piece as string,
                position: {row: promotedPiece.row, col: promotedPiece.col} as Position
            });
            promotedPieceRef.current = null;
        }
    }

    const select_pre_move = (focusTile : Tile, tile : Tile) => {
        if (focusTile) {
            if (preMoveRef.current.length > 0)
                clear_pre_move(boardRef.current)
            preMoveRef.current.push(focusTile);
            preMoveRef.current.push(tile);
            focusTile.preMove = true;
            tile.preMove = true;
            move_piece(focusTile, tile);
        }
    }

    const clear_pre_move = (board : Tile[][]) => {
        if (preMoveRef.current.length > 0) {
            const preMoveStart = preMoveRef.current[0];
            const preMoveEnd = preMoveRef.current[1];
            board[preMoveStart.row][preMoveStart.col].preMove = false;
            board[preMoveEnd.row][preMoveEnd.col].preMove = false;
            move_piece(board[preMoveEnd.row][preMoveEnd.col], board[preMoveStart.row][preMoveStart.col]);
            // last move needs to be set to false after move piece
            board[preMoveStart.row][preMoveStart.col].lastMove = false;
            board[preMoveEnd.row][preMoveEnd.col].lastMove = false;
            preMoveRef.current = [];
        }
    }

    const send_move_to_server = (old_tile : Tile, new_tile : Tile) => {
        socket?.emit('movePiece', {
            game_id : props.game_id as string,
            username: user.username as string,
            old_pos: {row: old_tile.row, col: old_tile.col} as Position,
            new_pos: {row: new_tile.row, col: new_tile.col} as Position
        });
    }

    const execute_move = (board : Tile[][], old_tile : Tile, new_tile : Tile) => {
        remove_highlights(board);
        move_piece(old_tile, new_tile);
        switch_turn();
        send_move_to_server(old_tile, new_tile);
        handle_promotion(new_tile);
        focusTileRef.current = null;
    }

    const handle_click_tile = (new_tile : Tile) => {
        const focusTile = focusTileRef.current;
        const side = sideRef.current;
        const board = boardRef.current;
        const turn = turnRef.current;

        if (focusTile == new_tile || !side)
            return;
        if (turn == side && focusTile && focusTile.piece[0] == side && new_tile.piece[0] != side && is_move_legal(board, focusTile, new_tile) && !is_king_in_check(board, side))
            execute_move(board, focusTile, new_tile);
        else if (turn != side && focusTile && focusTile.piece[0] == side && is_move_legal(board, focusTile, new_tile))
            select_pre_move(focusTile, new_tile);
        else {
            selectPiece(new_tile);
            clear_pre_move(board);
        }
        setStateBoard(boardRef.current);
    }

    useEffect(() => {
        if (socket) {

            const getGameSession = (data : GameSession) => {
                console.log("getGameSession received");
                const { username_white, username_black, turn: server_turn, start_time, board: server_board } = data;
                if (username_white == user.username) {
                    sideRef.current = 'w';
                    opponentRef.current = username_black;
                }
                else {
                    sideRef.current = 'b';
                    opponentRef.current = username_white;
                }
                turnRef.current = server_turn;
                setStateBoard(server_board.map((array, row) => array.map((piece, col) => ({piece, row, col, ...DefaultTileFields}))));
            }

            const updateBoard = (server_board : string[][], server_turn : string) => {
                console.log("Board update received");
                turnRef.current = server_turn;

                // const new_board : Tile[][] = server_board.map((array, row) => array.map((piece, col) => (piece[2] === 'x' ? {piece, row, col, ...DefaultTileFields, lastMove: true} : {piece, row, col, ...DefaultTileFields})));
                const new_board : Tile[][] = server_board.map((array, row) => array.map((piece, col) => {
                    const lastMove : boolean = piece[2] === 'x' ? true : false;
                    const firstMove : boolean = piece[2] === 'y' ? true : false;
                    return ({piece, row, col, ...DefaultTileFields, lastMove, firstMove})
                }));
                if (focusTileRef.current)
                    new_board[focusTileRef.current.row][focusTileRef.current.col].focus = true;

                // This long variable passing is due to execution function expecting correct tile reference, same for is_move_possible... en passant
                const preMove = preMoveRef.current;
                if (preMove.length === 2 && turnRef.current === sideRef.current) {
                    if (is_move_legal(new_board, new_board[preMove[0].row][preMove[0].col], new_board[preMove[1].row][preMove[1].col]) && !is_king_in_check(new_board, sideRef.current))
                    execute_move(new_board, new_board[preMove[0].row][preMove[0].col], new_board[preMove[1].row][preMove[1].col]);
                    preMoveRef.current = [];
                }

                setStateBoard(new_board);
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
        boardRef.current = [...stateBoard];
    }, [stateBoard]);

return (
    <div className="chessboard">
        <div className="ml-[30px]">
            <div>{opponentRef.current}</div>
            <CapturedPieces board={stateBoard} side={sideRef.current}/>
        </div>
        {sideRef.current && stateBoard.map((row, original_i) => {
            const i = sideRef.current === 'w' ? original_i : 7 - original_i;
            return (
                <div key={original_i} className="flex">
                    <div className="flex items-center justify-center w-[30px]">{8 - i}</div>
                    {row.map((piece, original_j) => {
                        const j = sideRef.current === 'w' ? original_j : 7 - original_j;
                        return (
                            <div key={j} onClick={() => handle_click_tile(boardRef.current[i][j])} className={`w-[var(--tile-size)] h-[var(--tile-size)] ${((j + i) % 2 == 0) ? "bg-light_tile" : "bg-dark_tile"}`}>
                                <div className={`w-full h-full ${((stateBoard[i][j].focus || stateBoard[i][j].lastMove) && "bg-[var(--player-tile)]")} ${(stateBoard[i][j].preMove && "bg-[var(--preselect-tile)]")}`}>
                                    {render_img(stateBoard[i][j].piece)}
                                </div>
                            </div>
                    )})}
                </div>
        )})}
        <div className="flex ml-[30px]">
            {COLUMNS.map((element, original_i) => {
                const i = sideRef.current === 'w' ? original_i : 7 - original_i;
                return (<div key={i} className="flex items-center justify-center w-[var(--tile-size)] h-[30px]">{COLUMNS[i]}</div>)
            })}
        </div>
        <div className="ml-[30px]">
            <div>{user.username}</div>
            <CapturedPieces board={stateBoard} side={sideRef.current === 'w' ? 'b' : 'w'}/>
        </div>
        {isPromotionOpenRef.current && sideRef.current && <Promotion side={sideRef.current} update_promoted_piece={update_promoted_piece} />}
    </div>
  )
}

export default Chessboard