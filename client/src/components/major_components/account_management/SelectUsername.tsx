import { useForm } from "react-hook-form";
import { useAuthContext } from "@/context/AuthContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoadingSpinner } from "../LoadingSpinner";

const formSchema = z.object({
	username: z.string().min(2, {
		message: "Username must be at least 2 characters.",
	}),
});

export function SelectUsername({
	isOpen,
	setIsOpen,
}: {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
}) {
	const { edit_current_users_username } = useAuthContext();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			username: "",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsLoading(true);
		try {
			await edit_current_users_username(values.username);
			console.log("Username changed successfully");
			setIsOpen(false);
		} catch (error) {
			console.error("Edit username failed", error);
			if (error instanceof Error) {
				setErrorMessage(error.message);
			} else {
				setErrorMessage("Sign-up failed. Please try again.");
			}
		} finally {
            setIsLoading(false);
        }
	}

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				setIsOpen(open);
				if (open) setErrorMessage(null);
			}}
		>
			<DialogContent className="sm:max-w-[300px]">
				<DialogHeader>
					<DialogTitle className="text-2xl">
						Choose your Username
					</DialogTitle>
					<DialogDescription></DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-6"
					>
						<FormField
							key="username"
							control={form.control}
							name="username"
							render={({ field }) => (
								<FormItem>
									<FormLabel htmlFor="username">
										Username
									</FormLabel>
									<FormControl>
										<Input
											id="username"
											type="text"
                                            disabled={isLoading}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="text-sm font-medium text-destructive">
							{errorMessage}
						</div>
						<Button type="submit" className="w-full">
								{isLoading ? (
									<LoadingSpinner />
								) : (
                                    "Submit"
								)}
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
