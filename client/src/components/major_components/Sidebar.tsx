import { useNavigate } from "react-router-dom"
import { ModeToggle } from "../mode-toggle"
import { Button } from "../ui/button"
import { LogIn } from "./account_management/LogIn";
import { SignUp } from "./account_management/SignUp";
import { LogOut } from "./account_management/LogOut";
import { ResetPassword } from "./account_management/ResetPassword";
import { useState } from "react";
import { SelectUsername } from "./account_management/SelectUsername";

const Sidebar = () => {

  const navigate = useNavigate();
  const [isLogInOpen, setIsLogInOpen] = useState(false)
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false)
  const [isSelectUsernameOpen, setIsSelectUsernameOpen] = useState(false)

  return (
      <nav className="sidebar">
        <div className="flex flex-col gap-4">
          <Button onClick={() => navigate("/")}>Home</Button>
          <Button variant={"secondary"}>Profile</Button>
          <LogIn isOpen={isLogInOpen} setIsOpen={setIsLogInOpen} setIsResetPasswordOpen={setIsResetPasswordOpen} setIsSelectUsernameOpen={setIsSelectUsernameOpen}/>
          <SignUp />
          <LogOut />
          <ResetPassword isOpen={isResetPasswordOpen} setIsOpen={setIsResetPasswordOpen} setIsLogInOpen={setIsLogInOpen}/>
          <SelectUsername isOpen={isSelectUsernameOpen} setIsOpen={setIsSelectUsernameOpen} />
        </div>
        <div className="flex flex-col">
          <ModeToggle />
        </div>
      </nav>
  )
}

export default Sidebar