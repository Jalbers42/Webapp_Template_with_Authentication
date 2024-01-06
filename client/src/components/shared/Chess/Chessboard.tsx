import { useState } from "react";
import { render_img } from "./render_image";

interface Position {
    row: number;
    col: number;
  }

const Chessboard = () => {
    
    const [piece, setPiece] = useState<Position | null>();

    const [stateBoard, setStateBoard] = useState<string[][]>([
        ['br','bn','bb','bq','bk','bb','bn','br'],
        ['bp','bp','bp','bp','bp','bp','bp','bp'],
        ['0','0','0','0','0','0','0','0'],
        ['0','0','0','0','0','0','0','0'],
        ['0','0','0','0','0','0','0','0'],
        ['0','0','0','0','0','0','0','0'],
        ['wp','wp','wp','wp','wp','wp','wp','wp'],
        ['wr','wn','wb','wq','wk','wb','wn','wr']
    ]);

    const board = [...stateBoard];

    const   selectPiece = (row : number, col : number) => {
        if (board[row][col] != '0') {
            setPiece({row: row, col: col});
        }
    }

    const   move_piece = (row : number, col : number) => {
        if (!piece) {
            selectPiece(row, col);
        }
        else if (piece.row !== row || piece.col !== col) {
            board[row][col] = board[piece.row][piece.col];
            board[piece.row][piece.col] = '0';
            setPiece(null);
        }
        setStateBoard(board);
    }
    
  return (
    <div>
        {board.map((row, i) => (
            <div key={i} className="flex">
                {row.map((piece, j) => (
                    <div onClick={() => move_piece(i, j)} className={`w-[100px] h-[100px] ${((j + i) % 2 == 0) ? "bg-light_tile" : "bg-dark_tile"}`}>
                        {render_img(piece)}
                    </div>
                ))}
            </div>    
        ))}
    </div>
  )
}

export default Chessboard