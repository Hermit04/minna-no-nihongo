"use client"

import { GalleryVerticalEnd } from "lucide-react"

import { LoginForm } from "@/components/login-form"
import { authClient } from "@/lib/auth-client"

export default function LoginPage() {

  const googleLogin = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
      })
    } catch (error) {
      console.error("Google sign-in failed", error)
    }
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Acme Inc.
        </a>
        <LoginForm onGoogleSignIn={googleLogin} />
      </div>
    </div>
  )
}
