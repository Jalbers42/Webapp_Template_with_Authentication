import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
              
const Home = () => {

  const [messages, setMessages] = useState(["Hi", "hey"])

  function addMessage() {
    setMessages([...messages, "NEW"])
  }

  function clear() {
    setMessages([])
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <div>
        {messages.map((element, index) => (
          <div key={index}>{element}</div>
        ))}
        <div className="grid w-full gap-2">
          <Textarea placeholder="Type your message here." />
          <Button onClick={addMessage}>Send message</Button>
          <Button onClick={clear}>Clear</Button>
        </div>
      </div>
    </div>
  )
}

export default Home