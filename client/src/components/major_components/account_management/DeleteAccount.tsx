import { useForm } from "react-hook-form"
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
} from "@/components/ui/form"

const formTexts = {
  popup_button: "Delete Account",
  title: "Delete Account",
  description: null,
  submit_button: "Confirm"
}

export function DeleteAccount() {

  const { delete_account } = useAuthContext()
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm()

  async function onSubmit() {
    try {
      await delete_account();
      console.log("User account deleted successfully");
      setIsOpen(false);
    } catch (error) {
      console.error("Account deletion failed. ", error);
      setErrorMessage("Account deletion failed. Please try again.");
    }
  }

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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="text-sm font-medium text-destructive">{errorMessage}</div>
            <Button type="submit" className="w-full">{formTexts.submit_button}</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
