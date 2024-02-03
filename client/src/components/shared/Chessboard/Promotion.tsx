import { render_img } from "./render_image"

const Promotion = (props : {
    side : string;
    setPromotedPieceType : React.Dispatch<React.SetStateAction<string | null>>;
}) => {

    const handleSelection = (piece_type: string) => {
        props.setPromotedPieceType(props.side + piece_type)
    }

  return (
    <div className="absolute top-0 left-0 flex items-center justify-center h-full w-full">
        <div className="flex w-[80%] bg-primary-foreground">
            <button className="hover:bg-primary" onClick={() => handleSelection('q')}>
                {render_img(props.side + 'q')}
            </button>
            <button className="hover:bg-primary" onClick={() => handleSelection('r')}>
                {render_img(props.side + 'r')}
            </button>
            <button className="hover:bg-primary" onClick={() => handleSelection('b')}>
                {render_img(props.side + 'b')}
            </button>
            <button className="hover:bg-primary" onClick={() => handleSelection('n')}>
                {render_img(props.side + 'n')}
            </button>
        </div>
    </div>
  )
}

export default Promotion