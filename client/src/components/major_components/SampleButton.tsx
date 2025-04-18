import { Button } from "../ui/button"
import { useWebSocketContext } from "@/context/WebSocketContext";
import { useAuthContext } from "@/context/AuthContext";

const SampleButton = () => {

    const   { userState } = useAuthContext()
    const   { socket, connectSocket } = useWebSocketContext();

    const sample_function = async () => {
        await connectSocket()
        if (socket) {
            console.log('Socket connected:', socket);
        } else {
            console.log('Socket not connected.');
        }
    }

  return (
    <div className="w-full h-full border flex flex-col gap-5 items-center justify-center">
        <h2>{userState.username}</h2>
        <h2>{userState.uid}</h2>
        <Button onClick={sample_function}>
            Sample Button
        </Button>
    </div>
  )
}

export default SampleButton