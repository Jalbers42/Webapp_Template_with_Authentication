import { Injectable } from '@nestjs/common';
import { Position } from 'src/app.types';

@Injectable()
export class MoveRulesService {

    is_path_clear = (board : string[][], old_pos : Position, new_pos : Position) => {

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

    is_pawn_move = (board : string[][], color : string, old_pos : Position, new_pos : Position) => {

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

    is_knight_move = (old_pos : Position, new_pos : Position) => {
        if (Math.abs(old_pos.col - new_pos.col) == 2 && Math.abs(old_pos.row - new_pos.row) == 1)
            return (true);
        else if (Math.abs(old_pos.row - new_pos.row) == 2 && Math.abs(old_pos.col - new_pos.col) == 1)
            return (true);
        return (false);
    }

    is_rook_move = (old_pos : Position, new_pos : Position) => {
        if (old_pos.col - new_pos.col == 0)
            return (true);
        else if (old_pos.row - new_pos.row == 0)
            return (true);
        return (false);
    }

    is_bishop_move = (old_pos : Position, new_pos : Position) => {
        if (Math.abs(old_pos.row - new_pos.row) == Math.abs(old_pos.col - new_pos.col))
            return (true);
        return (false);
    }

    is_queen_move = (old_pos : Position, new_pos : Position) => {
        if (Math.abs(old_pos.row - new_pos.row) == Math.abs(old_pos.col - new_pos.col))
            return (true);
        else if (old_pos.col - new_pos.col == 0)
            return (true);
        else if (old_pos.row - new_pos.row == 0)
            return (true);
        return (false);
    }

    remove_first_move_y = (board : string [][], pos : Position) => {
        if (board[pos.row][pos.col][2] === 'y')
            board[pos.row][pos.col] = board[pos.row][pos.col].slice(0, 2);
    }

    is_rochade_possible = (board : string[][], king_pos : Position, direction : number) => {
        if (board[king_pos.row][king_pos.col][2] === 'y') {
            if (direction === 1 && board[king_pos.row][7][2] === 'y' && this.is_path_clear(board, king_pos, {row: king_pos.row, col: 7}))
                return (true);
            else if (direction === -1 && board[king_pos.row][0][2] === 'y' && this.is_path_clear(board, king_pos, {row: king_pos.row, col: 0}))
                return (true);
        }
        return (false);
    }

    // includes rochade
    is_king_move = (board : string [][], old_pos : Position, new_pos : Position) => {
        const row_delta : number = new_pos.row - old_pos.row;
        const col_delta : number = new_pos.col - old_pos.col;

        if (Math.abs(row_delta) <= 1 && Math.abs(col_delta) <= 1) {
            this.remove_first_move_y(board, old_pos);
            return (true);
        }
        else if (col_delta == 2 && row_delta === 0 && this.is_rochade_possible(board, old_pos, 1)) {
            this.remove_first_move_y(board, old_pos);
            this.remove_first_move_y(board, {row: old_pos.row, col: 7});
            board[old_pos.row][old_pos.col + 1] = board[old_pos.row][7];
            board[old_pos.row][7] = "00";
            return (true);
        }
        else if (col_delta == -2 && row_delta === 0 && this.is_rochade_possible(board, old_pos, -1)) {
            this.remove_first_move_y(board, old_pos);
            this.remove_first_move_y(board, {row: old_pos.row, col: 0});
            board[old_pos.row][old_pos.col - 1] = board[old_pos.row][0];
            board[old_pos.row][0] = "00";
            return (true);
        }

        return (false);
    }

    is_move_possible(board : string[][], old_pos : Position, new_pos : Position, turn : string) {

        const piece = board[old_pos.row][old_pos.col][1];
        const color = board[old_pos.row][old_pos.col][0];

        if (piece == 'p'){
            if (this.is_pawn_move(board, color, old_pos, new_pos))
                return (true);
        }
        else if (piece == 'r') {
            if (this.is_rook_move(old_pos, new_pos) && this.is_path_clear(board, old_pos, new_pos)) {
                this.remove_first_move_y(board, old_pos);
                return (true);
            }
        }
        else if (piece == 'n') {
            if (this.is_knight_move(old_pos, new_pos))
            return (true);
        }
        else if (piece == 'b') {
            if (this.is_bishop_move(old_pos, new_pos) && this.is_path_clear(board, old_pos, new_pos))
            return (true);
        }
        else if (piece == 'q') {
            if (this.is_queen_move(old_pos, new_pos) && this.is_path_clear(board, old_pos, new_pos))
                return (true);
        }
        else if (piece == 'k') {
            if (this.is_king_move(board, old_pos, new_pos))
                return (true);
        }
        return (false);
    }
}
