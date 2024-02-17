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
    const opponent = useRef<string>("");


    const isPromotionOpen = useRef<boolean>(false);
    const promotedPiece = useRef<Tile | null>(null);


    const [preMove, setPreMove] = useState<Tile | null>(null);
    const preMoveRef = useRef(preMove);
    preMoveRef.current = preMove;


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
        new_tile.focus = true;
        old_tile.piece = "00";
        old_tile.focus = true;
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
            isPromotionOpen.current = true;
            promotedPiece.current = new_tile;
        }
    }

    const update_promoted_piece = (selected_piece : string) => {
        if (promotedPiece.current) {
            boardRef.current[promotedPiece.current.row][promotedPiece.current.col].piece = selected_piece;
            isPromotionOpen.current = false;
            setStateBoard(boardRef.current);
            socket?.emit('promotePiece', {
                game_id : props.game_id as string,
                username: user.username as string,
                type: selected_piece as string,
                position: {row: promotedPiece.current?.row, col: promotedPiece.current?.col} as Position
            });
            promotedPiece.current = null;
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

    const selectPreMove = (focusTile : Tile, tile : Tile) => {
        if (focusTile) {
            setPreMove(tile);
            focusTile.preMove = true;
            tile.preMove = true;
        }
    }

    const execute_move = (board : Tile[][], old_tile : Tile, new_tile : Tile) => {
        move_piece(old_tile, new_tile);
        remove_highlights(board);
        send_move_to_server(old_tile, new_tile);
        switch_turn();
        focusTileRef.current = null;
        handle_promotion(new_tile);
    }

    const handle_click_tile = (tile : Tile) => {
        const board = boardRef.current;
        const side = sideRef.current;
        const focusTile = focusTileRef.current;

        if (focusTile == tile)
            return;
        else if (focusTile && focusTile.piece[0] == side && is_move_possible(board, focusTile, tile)) {
            if (side != turnRef.current)
                selectPreMove(focusTile, tile);
            else if (!is_king_in_check(board, side))
                execute_move(board, focusTile, tile);
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
                    sideRef.current = 'w';
                    opponent.current = username_black;
                }
                else {
                    sideRef.current = 'b';
                    opponent.current = username_white;
                }
                turnRef.current = turn;
                setStateBoard(new_board.map((array, row) => array.map((piece, col) => ({piece, row, col, ...DefaultTileFields}))));
            }
            const updateBoard = (new_board : string[][], turn : string) => {
                console.log("Board update received");
                const converted_board : Tile[][] = new_board.map((array, row) => array.map((piece, col) => ({piece, row, col, ...DefaultTileFields})));
                if (focusTileRef.current)
                    converted_board[focusTileRef.current.row][focusTileRef.current.col].focus = true;
                setStateBoard(converted_board);
                turnRef.current = turn;
                if (preMoveRef.current && focusTileRef.current && true) {
                    execute_move(boardRef.current, focusTileRef.current, preMoveRef.current);
                }
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
            <div>{opponent.current}</div>
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
                                <div className={`w-full h-full ${(stateBoard[i][j].focus && "bg-[var(--player-tile)]")} ${(stateBoard[i][j].preMove && "bg-[var(--preselect-tile)]")}`}>
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
        {isPromotionOpen.current && sideRef.current && <Promotion side={sideRef.current} update_promoted_piece={update_promoted_piece} />}
    </div>
  )
}

export default Chessboard