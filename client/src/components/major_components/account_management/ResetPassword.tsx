import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
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
import { FaArrowLeft, FaUser } from "react-icons/fa";
import { useAuthContext } from "@/context/AuthContext"

export interface FormFieldConfig {
  name: keyof z.infer<typeof formSchema>;
  label: string;
  type: string;
  placeholder: string;
}

const formTexts: FormTexts = {
  popup_button: "Forgot Password?",
  title: "Forgot Password?",
  description: null,
  submit_button: "Submit"
}

const formSchema = z.object({
  email: z.string().min(2, {
    message: "Email must be at least 2 characters.",
  }),
})


export function ResetPassword({ isOpen, setIsOpen, setIsLogInOpen }: { isOpen: boolean; setIsOpen: (isOpen: boolean) => void; setIsLogInOpen: (isOpen: boolean) => void}) {

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { resetPasswordWithUsernameOrEmail } = useAuthContext()
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })
  
  async function handleFormSubmit(values: z.infer<typeof formSchema>) {
    try {
      await resetPasswordWithUsernameOrEmail(values.email);
      console.log("Password reset email sent");
      setIsSuccess(true);
      // setIsOpen(false);
    } catch (error) {
      console.error("Password reset failed.", error);
      setErrorMessage("Password reset failed. Please try again.");
    }
  }

  const handleDialogChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setIsSuccess(false);
      setErrorMessage(null);
      form.reset({ email: "" });
    }
  };

  const handleGoBack = () => {
    setIsOpen(false);
    setIsLogInOpen(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-[300px]">
        {
          !isSuccess &&
          <DialogHeader>
            <div className="flex items-center space-x-2">
              <button onClick={handleGoBack}>
                <FaArrowLeft className="text-muted-foreground text-sm mt-1" />
              </button>
              <DialogTitle className="text-2xl">{formTexts.title}</DialogTitle>
            </div>
          </DialogHeader>
        }
        {
          isSuccess ?
          <div>
            <div className="font-bold">Success!</div>
            <div className="">We've emailed you a link to reset your password. Check your inbox!</div>
          </div>
          :
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
              <FormField
                key="email"
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="email"
                          type="text"
                          className="pl-10 pr-10" 
                          placeholder="Enter Username or Email"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="text-xs font-medium text-destructive">{errorMessage}</div>
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
