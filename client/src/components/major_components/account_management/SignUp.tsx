import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useAuthContext } from "@/context/AuthContext"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { FormTexts } from "@/types & constants/types"
import { ThirdPartyLogin } from "../ThirdParyLogin"
import { FaEnvelope, FaEye, FaEyeSlash, FaLock, FaUser } from "react-icons/fa"

export interface FormFieldConfig {
  name: keyof z.infer<typeof formSchema>;
  label: string;
  type: string;
  placeholder: string;
}

const formFields: FormFieldConfig[] = [
  { name: "email", label: "Email", type: "text", placeholder: "Email" },
  { name: "username", label: "Username", type: "text", placeholder: "Username" },
  { name: "password", label: "Password", type: "password", placeholder: "Password" },
];

const formTexts: FormTexts = {
  popup_button: "Sign Up",
  title: "Sign Up",
  description: null,
  submit_button: "Sign Up"
}

const formSchema = z.object({
  email: z.string().min(2, {
    message: "Email must be at least 2 characters.",
  }),
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(2, {
    message: "Password must be at least 2 characters.",
  }),
})

export function SignUp({ setIsSelectUsernameOpen }: { setIsSelectUsernameOpen : (isOpen: boolean) => void; }) {

  const { register } = useAuthContext()
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
    },
  })
  
  async function handleFormSubmit(values: z.infer<typeof formSchema>) {
    try {
      await register(values.email, values.password, values.username);
      console.log("User successfully signed up");
      setIsOpen(false);
    } catch (error) {
      console.error("Sign in failed", error);
      setErrorMessage("Sign in failed. Please try again.");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{formTexts.popup_button}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[300px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{formTexts.title}</DialogTitle>
          <DialogDescription>
            {formTexts.description}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            {formFields?.map((fieldConfig) => (
              <FormField
                key={fieldConfig.name}
                control={form.control}
                name={fieldConfig.name}
                render={({ field }) => (
                  <FormItem>
                    {/* <FormLabel htmlFor={fieldConfig.name}>{fieldConfig.label}</FormLabel> */}
                    <FormControl>
                      <div className="relative">
                        {fieldConfig.name === "email" && (
                          <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        )}
                        {fieldConfig.name === "username" && (
                          <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        )}
                        {fieldConfig.name === "password" && (
                          <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        )}
                        <Input
                          id={fieldConfig.name}
                          type={
                            fieldConfig.name === "password" && passwordVisible
                              ? "text"
                              : fieldConfig.type
                          }
                          className="pl-10 pr-10" 
                          placeholder={fieldConfig.placeholder}
                          {...field}
                        />
                        {fieldConfig.name === "password" && (
                          <button
                            type="button"
                            onClick={() => setPasswordVisible(!passwordVisible)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                          >
                            {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <div className="text-sm font-medium text-destructive">{errorMessage}</div>
            <Button type="submit" className="w-full">{formTexts.submit_button}</Button>
          </form>
        </Form>
        <div className="flex items-center py-4">
          <hr className="flex-grow border-t border-muted-foreground" />
          <span className="px-2 text-gray-500 text-sm">OR</span>
          <hr className="flex-grow border-t border-muted-foreground" />
        </div>
        <ThirdPartyLogin setIsLogInOpen={setIsOpen} setIsSelectUsernameOpen={setIsSelectUsernameOpen}/>
      </DialogContent>
    </Dialog>
  )
}
