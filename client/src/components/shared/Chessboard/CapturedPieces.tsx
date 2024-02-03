import { useEffect, useState } from 'react'
import { render_img } from './render_image';

const CapturedPieces = (props : {board : string[][], side : string | null}) => {
    
    const [capturedPieces, setCapturedPieces] = useState<string[]>([]);

    const get_captured_pieces = (board : string[][], side : string) => {
        const captured_pieces : string[] = [];
        let queen : number = 1;
        let rook : number = 2;
        let bishop : number = 2;
        let knight: number = 2;
        let pawn : number = 8;

        board.map((row) => {
            row.map((element) => {
                if (element[0] == side) {
                    if (element[1] == 'q')
                        queen--;
                    else if (element[1] == 'r')
                        rook--;
                    else if (element[1] == 'b')
                        bishop--;
                    else if (element[1] == 'n')
                        knight--;
                    else if (element[1] == 'p')
                        pawn--;
                }
            })
        })
        if (queen == 1)
            captured_pieces.push(side + 'q');
        for (let i = 0; i < rook; i++)
            captured_pieces.push(side + 'r');
        for (let i = 0; i < bishop; i++)
            captured_pieces.push(side + 'b');
        for (let i = 0; i < knight; i++)
            captured_pieces.push(side + 'n');
        for (let i = 0; i < pawn; i++)
            captured_pieces.push(side + 'p');
    
        return (captured_pieces);
    }

    useEffect(() => {
        if (props.side)
            setCapturedPieces(get_captured_pieces(props.board, props.side));
    }, [props.board])

  return (
    <div className="flex h-[25px] mb-2">
        {
            capturedPieces.map((piece, i) => (
                <div className="w-[25px]" key={i}>{render_img(piece)}</div>
            ))
        }
    </div>
  )
}

export default CapturedPieces