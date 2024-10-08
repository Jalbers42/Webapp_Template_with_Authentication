import { useAuthContext } from "@/context/AuthContext";
import { Button } from "../ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaFacebook, FaGithub } from "react-icons/fa";
import { FacebookAuthProvider, GithubAuthProvider, GoogleAuthProvider, OAuthProvider } from "firebase/auth";

export function ThirdPartyLogin({ setIsLogInOpen, setIsSelectUsernameOpen } : { setIsLogInOpen: (isOpen: boolean) => void; setIsSelectUsernameOpen : (isOpen: boolean) => void;}) {

    const { sign_in_with_third_party_provider } = useAuthContext()
    const googleProvider = new GoogleAuthProvider();
    const githubProvider = new GithubAuthProvider();  // Add GitHub Provider
    // const facebookProvider = new FacebookAuthProvider();
    // const appleProvider = new OAuthProvider('apple.com');

    const handle_log_in = async (provider: any) => {
        try {
            setIsLogInOpen(false)
            const is_new_user: boolean = await sign_in_with_third_party_provider(provider)
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
            onClick={() => handle_log_in(googleProvider)}
        >
            <FcGoogle className="absolute left-4 text-lg" /> {/* Google logo on the left */}
            <span className="mx-auto">Log in with Google</span> {/* Text centered */}
        </Button>

        {/* GitHub Login */}
        <Button
            className="w-full bg-gray-800 text-white hover:bg-gray-900 flex items-center justify-center relative"
            onClick={() => handle_log_in(githubProvider)}
        >
            <FaGithub className="absolute left-4 text-lg" />
            <span className="mx-auto">Log in with GitHub</span>
        </Button>

        {/* Facebook Login */}
        {/* <Button
            className="w-full bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center relative"
            onClick={() => handle_log_in(facebookProvider)}
        >
            <FaFacebook className="absolute left-4 text-lg" />
            <span className="mx-auto">Log in with Facebook</span>
        </Button> */}

        {/* Apple Login */}
        {/* <Button
            className="w-full bg-black text-white hover:bg-gray-800 flex items-center justify-center relative"
            onClick={() => handle_log_in(appleProvider)}
        >
            <FaApple className="absolute left-4 text-lg" />
            <span className="mx-auto">Log in with Apple</span>
        </Button> */}
    </div>
  );
}