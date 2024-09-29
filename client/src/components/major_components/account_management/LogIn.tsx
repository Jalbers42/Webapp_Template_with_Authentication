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
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { FormTexts } from "@/types & constants/types"
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

export interface FormFieldConfig {
  name: keyof z.infer<typeof formSchema>;
  label: string;
  type: string;
  placeholder: string;
}

const formTexts: FormTexts = {
  popup_button: "Log In",
  title: "Log In",
  description: null,
  submit_button: "Log In"
}

const formFields: FormFieldConfig[] = [
  { name: "email", label: "Email", type: "text", placeholder: "Username or Email" },
  { name: "password", label: "Password", type: "password", placeholder: "Password" },
];

const formSchema = z.object({
  email: z.string().min(2, {
    message: "Email must be at least 2 characters.",
  }),
  password: z.string().min(2, {
    message: "Password must be at least 2 characters.",
  }),
})

export function LogIn({ isOpen, setIsOpen, setIsResetPasswordOpen }: { isOpen: boolean; setIsOpen: (isOpen: boolean) => void; setIsResetPasswordOpen : (isOpen: boolean) => void }) {

  const { logIn } = useAuthContext()
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })
  
  async function handleFormSubmit(values: z.infer<typeof formSchema>) {
    try {
      await logIn(values.email, values.password);
      console.log("User successfully logged in");
      setIsOpen(false);
    } catch (error) {
      console.error("Login failed", error);
      setErrorMessage("Log in failed. Please try again.");
    }
  }

  const handleForgotPassword = () => {
    setIsOpen(false);
    setIsResetPasswordOpen(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (open) setErrorMessage(null); }}>
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
        {
          form &&
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
              <div className="text-xs font-medium text-destructive">{errorMessage}</div>
              <div
                className="w-full text-end text-muted-foreground text-xs cursor-pointer"
                onClick={handleForgotPassword}
              >
                Forgot Password?
              </div>
              <div className="pt-4">
                <Button type="submit" className="w-full">{formTexts.submit_button}</Button>
              </div>
            </form>
          </Form>
        }
      </DialogContent>
    </Dialog>
  )
}
