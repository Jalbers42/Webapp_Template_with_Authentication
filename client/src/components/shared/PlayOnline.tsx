import { Button } from "../ui/button"
import { useUserContext } from '@/context/AuthContext'
import { useWebSocketContext } from "@/context/WebSocketContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PlayOnline = () => {

    const   { user } = useUserContext();
    const   { socket } = useWebSocketContext();
    let     navigate = useNavigate();

    const addToQueue = () => {
        if (socket === null) {
            console.log("Socket is null");
            return (null);
        }
        socket.emit('addToQueue', user.username);
    }

    useEffect(() => {
        const handleMatchCreated = (gameId : string) => {
            navigate("/game/" + gameId);
        };
    
        if (socket) {
            socket.on('match created', handleMatchCreated);
            return () => socket.off('match created', handleMatchCreated);
        }

        return () => {};
      }, [socket]);

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