import { useAuthContext } from "@/context/AuthContext";
import { Button } from "../ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaFacebook } from "react-icons/fa";

export function ThirdPartyLogin() {

    const { signInWithApple, signInWithGoogle, signInWithFacebook } = useAuthContext()

  return (
    <div className="flex flex-col space-y-4">

        {/* Google Login */}
        <Button
            className="w-full bg-white text-black border hover:bg-gray-100 flex items-center justify-center relative"
            onClick={signInWithGoogle}
        >
            <FcGoogle className="absolute left-4 text-lg" /> {/* Google logo on the left */}
            <span className="mx-auto">Log in with Google</span> {/* Text centered */}
        </Button>

        {/* Facebook Login */}
        <Button
            className="w-full bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center relative"
            onClick={signInWithFacebook}
        >
            <FaFacebook className="absolute left-4 text-lg" /> {/* Facebook logo on the left */}
            <span className="mx-auto">Log in with Facebook</span> {/* Text centered */}
        </Button>

        {/* Apple Login */}
        <Button
            className="w-full bg-black text-white hover:bg-gray-800 flex items-center justify-center relative"
            onClick={signInWithApple}
        >
            <FaApple className="absolute left-4 text-lg" /> {/* Logo on the left */}
            <span className="mx-auto">Log in with Apple</span> {/* Text centered */}
        </Button>

    </div>
  );
}