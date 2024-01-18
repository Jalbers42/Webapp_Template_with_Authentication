import { Link, useNavigate } from "react-router-dom"
import { ModeToggle } from "../mode-toggle"
import { Button } from "../ui/button"

const Sidebar = () => {

  const navigate = useNavigate();

  return (
      <nav className="sidebar">
        <div className="flex flex-col gap-4">
          <Button onClick={() => navigate("/")}>Home</Button>
          <Button variant={"secondary"}>Profile</Button>
        </div>
        <div className="flex flex-col">
          <ModeToggle />
        </div>
      </nav>
  )
}

export default Sidebar