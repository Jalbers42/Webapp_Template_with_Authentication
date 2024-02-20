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

import { BOARD_HEIGHT, BOARD_WIDTH } from "@/types & constants/constants";
import { Tile } from "@/types & constants/types";

const is_knight_attacking = (board : Tile[][], king_tile : Tile, side : string) => {
    const opponent_horse = side === 'w' ? 'bn' : 'wn';
    const directions = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [2, -1], [2, 1], [1, -2], [1, 2]
    ];
    for (const [dy, dx] of directions) {
        const row = king_tile.row + dy;
        const col = king_tile.col + dx;
        if (row >= 0 && col >= 0 && row < BOARD_HEIGHT && col < BOARD_WIDTH)
            if (board[row][col].piece.slice(0, 2) === opponent_horse)
                return (true);
    }
    return (false);
}

export const is_king_in_check = (board : Tile[][], side : string) => {

    let king_tile : Tile | undefined;

    for (let row of board) {
        king_tile = row.find(tile => tile.piece.slice(0, 2) == side + 'k');
        if (king_tile)
            break;
    }
    if (!king_tile) {
        console.log("king not found");
        return;
    }
    if (is_knight_attacking(board, king_tile, side))
        return (true);



    return (false);
}
