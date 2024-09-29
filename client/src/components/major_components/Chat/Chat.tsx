import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useState } from "react"
// import { useAuthContext } from '@/context/AuthContext'
import { useWebSocketContext } from "@/context/WebSocketContext"
              
const Chat = () => {

  const [chat, setChat] = useState<string[]>([]);
  const [message, setMessage] = useState<string>('');
  const { socket } = useWebSocketContext();

  function sendMessage(msg : string) {
    if (socket) {
      socket.emit('newMessage', msg);
    }
  }

  function clear() {
    setChat([])
  }

  useEffect(() => {
    if (socket) {
      const handleNewMessage = (msg: any) => {
        setChat(prevChat => [...prevChat, msg.content]);
        console.log('Received message', msg);
      };
      socket.on('onMessage', handleNewMessage);
      return () => {
        socket.off('onMessage', handleNewMessage);
      };
    }
  }, [socket, setChat]);

  return (
    <div className="flex flex-1 items-center justify-center">
      <div>
       {chat.map((element, index) => (
          <div key={index}>{element}</div>
        ))}
        <div className="grid w-full gap-2">
          <Textarea placeholder="Type your message here." value={message} onChange={(e) => {setMessage(e.target.value)}}/>
          <Button onClick={() => sendMessage(message)}>Send message</Button>
          <Button onClick={clear}>Clear</Button>
        </div>
      </div>
    </div>
  )
}

export default Chat