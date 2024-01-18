export type IUser = {
    username: string,
    password: string,
    rank: number,
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
    id : string;
    player_white : string;
    player_black : string;
    board : string[][];
}