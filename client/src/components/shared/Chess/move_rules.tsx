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

const is_pawn_move = (board : string[][], pos : Position, move : Position) => {

    let direction : number;

    if (board[pos.row][pos.col][0] == 'w')
        direction = -1;
    else
        direction = 1;
    if  (move.col === pos.col) {
        if (move.row - pos.row === direction)
            return (true);
    }
    return (false);
}

export const can_piece_move_like_this = (board : string[][], pos : Position, move : Position) => {
    if (board[pos.row][pos.col][1] == 'p' && is_pawn_move(board, pos, move))
        return (true);

    return (false);
}