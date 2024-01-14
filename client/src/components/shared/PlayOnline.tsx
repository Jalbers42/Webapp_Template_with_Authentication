import { Button } from "../ui/button"
import { useUserContext } from '@/context/AuthContext'
import { useWebSocketContext } from "@/context/WebSocketContext";
import { useEffect } from "react";

const PlayOnline = () => {

    const { user } = useUserContext();
    const { socket } = useWebSocketContext();

    const addToQueue = () => {
        if (socket === null) {
            console.log("Socket is null");
            return (null);
        }
        socket.emit('addToQueue', user.username);
    }

    type MatchData = {
      opponent: string;
    };

    const handleMatchCreated = (data : MatchData) => {
        console.log('Match created. ', data)
    }

    if (socket) {
        socket.on('match created', handleMatchCreated);
        console.log("test");
    } else {
        console.log("Not connected");
    }

    // useEffect(() => {
    //     // if (gameSessionSocket) {
    //     //   gameSessionSocket.on('match created', handleMatchCreated);
    //     // }

      
    //     // Cleanup to run when component unmounts
    //     return () => {
    //       if (gameSessionSocket) {
    //         gameSessionSocket.off('match created', handleMatchCreated);
    //       }
    //     }
    //   }, [gameSessionSocket]);

  return (
    <div className="w-full h-full border flex flex-col gap-5 items-center justify-center">
        <h2>{user.username}</h2>
        <Button onClick={addToQueue}>
            Play
        </Button>
    </div>
  )
}

export default PlayOnline