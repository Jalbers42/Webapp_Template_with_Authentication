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

const is_pawn_move = (board : Tile[][], color : string, old_pos : Position, new_pos : Position) => {

    const   new_field : string = board[new_pos.row][new_pos.col].piece;
    let     direction : number;

    if (color == 'w')
        direction = -1;
    else
        direction = 1;
    if  (new_pos.row - old_pos.row == direction)
    {
        if (old_pos.col == new_pos.col && new_field[0] == '0')
            return (true);
        else if (Math.abs(old_pos.col - new_pos.col) == 1) {
            if (new_field[0] != '0' && color != new_field[0])
                return (true);
            else if (
                new_field[0] == '0' &&
                board[new_pos.row - direction][new_pos.col].piece.slice(-2) == 'px' &&
                board[new_pos.row + direction][new_pos.col].piece[2] == 'x'
            ) {
                board[new_pos.row - direction][new_pos.col].piece = '00';
                return (true);
            }
        }
    }
    else if (new_pos.row - old_pos.row == (direction * 2) && old_pos.col == new_pos.col)
    {
        if (color == 'w' && old_pos.row == 6)
            return (true);
        else if (color == 'b' && old_pos.row == 1)
            return (true);
    }
    return (false);
}

const is_knight_move = (old_pos : Position, new_pos : Position) => {
    if (Math.abs(old_pos.col - new_pos.col) == 2 && Math.abs(old_pos.row - new_pos.row) == 1)
        return (true);
    else if (Math.abs(old_pos.row - new_pos.row) == 2 && Math.abs(old_pos.col - new_pos.col) == 1)
        return (true);
    return (false);
}

const is_rook_move = (old_pos : Position, new_pos : Position) => {
    if (old_pos.col - new_pos.col == 0)
        return (true);
    else if (old_pos.row - new_pos.row == 0)
        return (true);
    return (false);
}

const is_bishop_move = (old_pos : Position, new_pos : Position) => {
    if (Math.abs(old_pos.row - new_pos.row) == Math.abs(old_pos.col - new_pos.col))
        return (true);
    return (false);
}

const is_queen_move = (old_pos : Position, new_pos : Position) => {
    if (Math.abs(old_pos.row - new_pos.row) == Math.abs(old_pos.col - new_pos.col))
        return (true);
    else if (old_pos.col - new_pos.col == 0)
        return (true);
    else if (old_pos.row - new_pos.row == 0)
        return (true);
    return (false);
}

const is_king_move = (old_pos : Position, new_pos : Position) => {
    if (Math.abs(old_pos.row - new_pos.row) <= 1 && Math.abs(old_pos.col - new_pos.col) <= 1)
        return (true);
    return (false);
}

export const is_move_possible = (board : Tile[][], old_pos : Position, new_pos : Position) => {

    const type = board[old_pos.row][old_pos.col].piece[1];
    const color = board[old_pos.row][old_pos.col].piece[0];

    if (is_pawn_move(board, color, old_pos, new_pos))
    if (type == 'p'){
            return (true);
    }
    else if (type == 'r') {
        if (is_rook_move(old_pos, new_pos) && is_path_clear(board, old_pos, new_pos)) {
            return (true);
        }
    }
    else if (type == 'n') {
        if (is_knight_move(old_pos, new_pos))
        return (true);
    }
    else if (type == 'b') {
        if (is_bishop_move(old_pos, new_pos) && is_path_clear(board, old_pos, new_pos))
        return (true);
    }
    else if (type == 'q') {
        if (is_queen_move(old_pos, new_pos) && is_path_clear(board, old_pos, new_pos))
            return (true);
    }
    else if (type == 'k') {
        if (is_king_move(old_pos, new_pos))
            return (true);
    }
    return (false);
}