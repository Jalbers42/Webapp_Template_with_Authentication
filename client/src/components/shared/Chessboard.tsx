import { useState } from "react";



const Chessboard = () => {

    const [board, setBoard] = useState<string[][]>([
        ['0','0','0','0','0','0','0','0'],
        ['0','0','0','0','0','0','0','0'],
        ['0','0','0','0','0','0','0','0'],
        ['0','0','0','0','0','0','0','0'],
        ['0','0','0','0','0','0','0','0'],
        ['0','0','0','0','0','0','0','0'],
        ['0','0','0','0','0','0','0','0']
    ]);


  return (
    <div>
        {board.map((row, i) => (
            <div key={i} className="flex">
                {row.map((piece, j) => (
                    <div className={`w-[100px] h-[100px] ${((j + i) % 2 == 0) ? "bg-dark_tile" : "bg-light_tile"}`}>{piece}</div>
                ))}
            </div>    
        ))}
    </div>
  )
}

export default Chessboard