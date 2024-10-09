import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
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
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormTexts } from "@/types & constants/types";
import { FaArrowLeft, FaUser } from "react-icons/fa";
import { ThirdPartyLogin } from "../ThirdParyLogin";
import { auth } from "@/config/firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";
import { LoadingSpinner } from "../LoadingSpinner";

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
	submit_button: "Submit",
};

const formSchema = z.object({
	email: z.string().min(2, {
		message: "Email must be at least 2 characters.",
	}),
});

export function ResetPassword({
	isOpen,
	setIsOpen,
	setIsLogInOpen,
	setIsSelectUsernameOpen,
}: {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	setIsLogInOpen: (isOpen: boolean) => void;
	setIsSelectUsernameOpen: (isOpen: boolean) => void;
}) {
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isSuccess, setIsSuccess] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
		},
	});

	async function handleFormSubmit(values: z.infer<typeof formSchema>) {
		setIsLoading(false);
		try {
			await sendPasswordResetEmail(auth, values.email);
			console.log("Password reset email sent");
			setIsSuccess(true);
		} catch (error) {
			console.error("Password reset failed.", error);
			setErrorMessage("Password reset failed. Please try again.");
		} finally {
			setIsLoading(false);
		}
	}

	const handleGoBack = () => {
		setIsOpen(false);
		setIsLogInOpen(true);
	};

	useEffect(() => {
		if (isOpen) {
			setIsSuccess(false);
			setErrorMessage(null);
			form.reset({ email: "" });
		}
	}, [isOpen]);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className="sm:max-w-[300px]">
				{!isSuccess && (
					<DialogHeader>
						<div className="flex items-center space-x-2">
							<button onClick={handleGoBack}>
								<FaArrowLeft className="text-muted-foreground text-sm mt-1" />
							</button>
							<DialogTitle className="text-2xl">
								{formTexts.title}
							</DialogTitle>
						</div>
					</DialogHeader>
				)}
				{isSuccess ? (
					<div>
						<div className="font-bold">Success!</div>
						<div className="">
							We've emailed you a link to reset your password.
							Check your inbox!
						</div>
					</div>
				) : (
					<div>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(handleFormSubmit)}
								className="space-y-4"
							>
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
														id="email_or_username"
														type="text"
														className="pl-10 pr-10"
														placeholder="Enter Email"
														disabled={isLoading}
														{...field}
													/>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<div className="text-xs font-medium text-destructive">
									{errorMessage}
								</div>
								<div className="pt-4">
									<Button type="submit" className="w-full">
										{isLoading ? (
											<LoadingSpinner />
										) : (
											formTexts.submit_button
										)}
									</Button>
								</div>
							</form>
						</Form>
						<div className="flex items-center py-4">
							<hr className="flex-grow border-t border-muted-foreground" />
							<span className="px-2 text-gray-500 text-sm">
								OR
							</span>
							<hr className="flex-grow border-t border-muted-foreground" />
						</div>
						<ThirdPartyLogin
							setIsLogInOpen={setIsOpen}
							setIsSelectUsernameOpen={setIsSelectUsernameOpen}
						/>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
