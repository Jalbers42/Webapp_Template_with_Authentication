
export type IUser = {
    username: string,
    password: string,
    rank: number,
}

export interface Tile {
    row: number;
    col: number
    piece: string;
    focus: boolean;
    lastMove: boolean;
    preMove: boolean;
    possibleMove: boolean;
}

export interface Position {
    row: number;
    col: number;
}

export interface LastMove {
    start_pos: Position;
    end_pos: Position;
}

export interface GameSession {
    username_white : string;
    username_black : string;
    turn: string;
    start_time: Date;
    board : string[][];
}