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

import { Position } from "@/types";

const is_path_clear = (board : string[][], old_pos : Position, new_pos : Position) => {

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
        if (board[row][col][0] != '0')
            return (false);
        col += delta_col;
        row += delta_row;
    }
    return (true);
}

const is_pawn_move = (board : string[][], color : string, old_pos : Position, new_pos : Position) => {

    const   new_field : string = board[new_pos.row][new_pos.col];
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
                board[new_pos.row - direction][new_pos.col].slice(-2) == 'px' && 
                board[new_pos.row + direction][new_pos.col][2] == 'x'
            ) {
                board[new_pos.row - direction][new_pos.col] = '00'; 
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

export const is_move_possible = (board : string[][], old_pos : Position, new_pos : Position) => {

    const piece = board[old_pos.row][old_pos.col][1];
    const color = board[old_pos.row][old_pos.col][0];

    if (piece == 'p'){
        if (is_pawn_move(board, color, old_pos, new_pos))
            return (true);
    }
    else if (piece == 'r') {
        if (is_rook_move(old_pos, new_pos) && is_path_clear(board, old_pos, new_pos)) {
            return (true);
        }
    }
    else if (piece == 'n') {
        if (is_knight_move(old_pos, new_pos))
        return (true);
    }
    else if (piece == 'b') {
        if (is_bishop_move(old_pos, new_pos) && is_path_clear(board, old_pos, new_pos))
        return (true);
    }
    else if (piece == 'q') {
        if (is_queen_move(old_pos, new_pos) && is_path_clear(board, old_pos, new_pos))
            return (true);
    }
    else if (piece == 'k') {
        if (is_king_move(old_pos, new_pos))
            return (true);
    }
    else
        return (false);
}