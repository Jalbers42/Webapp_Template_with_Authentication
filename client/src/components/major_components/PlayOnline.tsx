import { Button } from "../ui/button"
import { useWebSocketContext } from "@/context/WebSocketContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";

const PlayOnline = () => {

    const   { userState } = useAuthContext()
    const   { socket, connectSocket } = useWebSocketContext();
    let     navigate = useNavigate();

    const startGame = async () => {
        await connectSocket()
        if (socket) {
            socket.emit('addToQueue', userState.username);
        } else {
            console.log('Socket not connected.');
        }
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
        <h2>{userState.username}</h2>
        <h2>{userState.uid}</h2>
        <Button onClick={startGame}>
            Play
        </Button>
    </div>
  )
}

export default PlayOnline