'use client'
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";


export default function Home() {
	const { data: session } = authClient.useSession()

	if (!session) {
		redirect("/login")
	} else {
		redirect("/dashboard")
	}
	return (
		<>
		</>
	);
}
