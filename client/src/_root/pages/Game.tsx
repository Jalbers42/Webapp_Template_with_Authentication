import Chessboard from "@/components/shared/Chessboard/Chessboard"
import { useParams } from "react-router-dom";

const Game = () => {

    const { gameId } = useParams();

  return (
    <div>
        <div>{gameId}</div>
        <Chessboard />
    </div>
  )
}

export default Game