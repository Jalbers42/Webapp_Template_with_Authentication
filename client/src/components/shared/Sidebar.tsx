import { ModeToggle } from "../mode-toggle"
import { Button } from "../ui/button"

const Sidebar = () => {
  return (
      <nav className="sidebar">
        <div className="flex flex-col gap-4">
          <Button>Home</Button>
          <Button variant={"secondary"}>Profile</Button>
        </div>
        <div className="flex flex-col">
          <ModeToggle />
        </div>
      </nav>
  )
}

export default Sidebar