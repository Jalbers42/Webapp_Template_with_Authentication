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

import { Position, Tile } from "@/types & constants/types";

const is_path_clear = (board : Tile[][], old_pos : Position, new_pos : Position) => {

    let row = old_pos.row;
    let col = old_pos.col;
    let delta_row = 0;
    let delta_col = 0;

    if (row < new_pos.row)
        delta_row = 1;
    else if (row > new_pos.row)
        delta_row = -1;
    if (col < new_pos.col)
        delta_col = 1;
    else if (col > new_pos.col)
        delta_col = -1;
    col += delta_col;
    row += delta_row;
    while (row != new_pos.row || col != new_pos.col) {
        if (board[row][col].piece[0] != '0')
            return (false);
        col += delta_col;
        row += delta_row;
    }
    return (true);
}

const is_pawn_move = (board : Tile[][], color : string, old_tile : Tile, new_tile : Tile) => {

    // const   new_field : string = board[new_tile.row][new_tile.col].piece;
    let     direction : number;

    if (color == 'w')
        direction = -1;
    else
        direction = 1;
    if  (new_tile.row - old_tile.row == direction)
    {
        if (old_tile.col == new_tile.col && new_tile.piece[0] == '0')
            return (true);
        else if (Math.abs(old_tile.col - new_tile.col) == 1) {
            if (new_tile.piece[0] != '0' && color != new_tile.piece[0])
                return (true);
            else if (
                new_tile.piece[0] == '0' &&
                board[new_tile.row - direction][new_tile.col].piece.slice(-2) == 'px' &&
                board[new_tile.row + direction][new_tile.col].piece[2] == 'x'
            ) {
                board[new_tile.row - direction][new_tile.col].piece = '00';
                return (true);
            }
        }
    }
    else if (new_tile.row - old_tile.row == (direction * 2) && old_tile.col == new_tile.col)
    {
        if (color == 'w' && old_tile.row == 6)
            return (true);
        else if (color == 'b' && old_tile.row == 1)
            return (true);
    }
    return (false);
}

const is_knight_move = (old_tile : Position, new_tile : Position) => {
    if (Math.abs(old_tile.col - new_tile.col) == 2 && Math.abs(old_tile.row - new_tile.row) == 1)
        return (true);
    else if (Math.abs(old_tile.row - new_tile.row) == 2 && Math.abs(old_tile.col - new_tile.col) == 1)
        return (true);
    return (false);
}

const is_rook_move = (old_tile : Position, new_tile : Position) => {
    if (old_tile.col - new_tile.col == 0)
        return (true);
    else if (old_tile.row - new_tile.row == 0)
        return (true);
    return (false);
}

const is_bishop_move = (old_tile : Position, new_tile : Position) => {
    if (Math.abs(old_tile.row - new_tile.row) == Math.abs(old_tile.col - new_tile.col))
        return (true);
    return (false);
}

const is_queen_move = (old_tile : Position, new_tile : Position) => {
    if (Math.abs(old_tile.row - new_tile.row) == Math.abs(old_tile.col - new_tile.col))
        return (true);
    else if (old_tile.col - new_tile.col == 0)
        return (true);
    else if (old_tile.row - new_tile.row == 0)
        return (true);
    return (false);
}

const is_rochade_possible = (board : Tile[][], king_pos : Tile, direction : number) => {
    if (board[king_pos.row][king_pos.col].firstMove) {
        if (direction === 1 && board[king_pos.row][7].firstMove && is_path_clear(board, king_pos, {row: king_pos.row, col: 7}))
            return (true);
        else if (direction === -1 && board[king_pos.row][0].firstMove && is_path_clear(board, king_pos, {row: king_pos.row, col: 0}))
            return (true);
    }
    return (false);
}

const is_king_move = (board : Tile[][], old_tile : Tile, new_tile : Tile) => {
    const row_delta : number = new_tile.row - old_tile.row;
    const col_delta : number = new_tile.col - old_tile.col;

    if (Math.abs(row_delta) <= 1 && Math.abs(col_delta) <= 1) {
        old_tile.firstMove = false;
        return (true);
    }
    else if (col_delta == 2 && row_delta === 0 && is_rochade_possible(board, old_tile, 1)) {
        old_tile.firstMove = false;
        board[old_tile.row][7].firstMove = false;
        board[old_tile.row][old_tile.col + 1].piece = board[old_tile.row][7].piece;
        board[old_tile.row][7].piece = "00";
        return (true);
    }
    else if (col_delta == -2 && row_delta === 0 && is_rochade_possible(board, old_tile, -1)) {
        old_tile.firstMove = false;
        board[old_tile.row][7].firstMove = false;
        board[old_tile.row][old_tile.col - 1].piece = board[old_tile.row][0].piece;
        board[old_tile.row][0].piece = "00";
        return (true);
    }
    return (false);
}

export const is_move_legal = (board : Tile[][], old_tile : Tile, new_tile : Tile) => {
    const type = old_tile.piece[1];
    const color = old_tile.piece[0];

    if (type == 'p'){
        if (is_pawn_move(board, color, old_tile, new_tile))
            return (true);
    }
    else if (type == 'r') {
        if (is_rook_move(old_tile, new_tile) && is_path_clear(board, old_tile, new_tile)) {
            old_tile.firstMove = false;
            return (true);
        }
    }
    else if (type == 'n') {
        if (is_knight_move(old_tile, new_tile))
        return (true);
    }
    else if (type == 'b') {
        if (is_bishop_move(old_tile, new_tile) && is_path_clear(board, old_tile, new_tile))
        return (true);
    }
    else if (type == 'q') {
        if (is_queen_move(old_tile, new_tile) && is_path_clear(board, old_tile, new_tile))
            return (true);
    }
    else if (type == 'k') {
        if (is_king_move(board, old_tile, new_tile))
            return (true);
    }
    return (false);
}