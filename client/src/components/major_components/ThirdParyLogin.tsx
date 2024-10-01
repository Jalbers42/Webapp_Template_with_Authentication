import { useAuthContext } from "@/context/AuthContext";
import { Button } from "../ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaFacebook } from "react-icons/fa";

export function ThirdPartyLogin({ setIsLogInOpen, setIsSelectUsernameOpen } : { setIsLogInOpen: (isOpen: boolean) => void; setIsSelectUsernameOpen : (isOpen: boolean) => void;}) {

    const { sign_in_with_apple, sign_in_with_google, sign_in_with_facebook } = useAuthContext()

    const handle_log_in = async (loginFunction: () => Promise<boolean>) => {
        try {
            setIsLogInOpen(false)
            const is_new_user: boolean = await loginFunction()
            if (is_new_user)
                setIsSelectUsernameOpen(true)
        } catch (error) {
            console.error('Login error', error);
        }
    };

  return (
    <div className="flex flex-col space-y-4">

        {/* Google Login */}
        <Button
            className="w-full bg-white text-black border hover:bg-gray-100 flex items-center justify-center relative"
            onClick={() => handle_log_in(sign_in_with_google)}
        >
            <FcGoogle className="absolute left-4 text-lg" /> {/* Google logo on the left */}
            <span className="mx-auto">Log in with Google</span> {/* Text centered */}
        </Button>

        {/* Facebook Login */}
        <Button
            className="w-full bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center relative"
            onClick={() => handle_log_in(sign_in_with_facebook)}
        >
            <FaFacebook className="absolute left-4 text-lg" /> {/* Facebook logo on the left */}
            <span className="mx-auto">Log in with Facebook</span> {/* Text centered */}
        </Button>

        {/* Apple Login */}
        <Button
            className="w-full bg-black text-white hover:bg-gray-800 flex items-center justify-center relative"
            onClick={() => handle_log_in(sign_in_with_apple)}
        >
            <FaApple className="absolute left-4 text-lg" /> {/* Logo on the left */}
            <span className="mx-auto">Log in with Apple</span> {/* Text centered */}
        </Button>
    </div>
  );
}