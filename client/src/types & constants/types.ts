
export type IUser = {
    username: string,
    uid: string;
    isGuest: boolean;
}

export interface Tile {
    row: number;
    col: number;
    piece: string;
    focus: boolean;
    lastMove: boolean;
    firstMove: boolean;
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

export interface FormTexts {
    popup_button: string | null;
    title: string;
    description: string | null;
    submit_button: string;
}
