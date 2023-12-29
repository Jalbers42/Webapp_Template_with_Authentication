import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

const Home = () => {
  return (
    <div className="flex flex-1 items-center justify-center">
        <div>
            <div className="grid w-full gap-2">
                <Textarea placeholder="Type your message here." />
                <Button>Send message</Button>
            </div>
        </div>
    </div>
  )
}

export default Home