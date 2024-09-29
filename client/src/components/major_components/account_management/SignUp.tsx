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

export interface FormFieldConfig {
  name: keyof z.infer<typeof formSchema>;
  label: string;
  type: string;
}

const formFields: FormFieldConfig[] = [
  { name: "email", label: "Email", type: "text" },
  { name: "username", label: "Username", type: "text" },
  { name: "password", label: "Password", type: "password" },
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

export function SignUp() {

  const { register } = useAuthContext()
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

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
        {
          form &&
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
              {formFields?.map((fieldConfig) => (
                <FormField
                  key={fieldConfig.name}
                  control={form.control}
                  name={fieldConfig.name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor={fieldConfig.name}>{fieldConfig.label}</FormLabel>
                      <FormControl>
                        <Input
                          id={fieldConfig.name}
                          type={fieldConfig.type}
                          {...field}
                        />
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
        }
      </DialogContent>
    </Dialog>
  )
}
