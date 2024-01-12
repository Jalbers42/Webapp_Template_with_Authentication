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