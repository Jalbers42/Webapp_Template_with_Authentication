import Chessboard from "@/components/major_components/Chessboard/Chessboard"
import { useParams } from "react-router-dom";

const Game = () => {

  const { game_id } = useParams();

  return (
    <div>
      {game_id && <Chessboard game_id={game_id}/>}
    </div>
  )
}

export default Game