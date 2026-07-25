import type { Metadata } from "next"

import { AuthForm } from "@/components/auth/auth-form"

export const metadata: Metadata = {
  title: "Sign in — Let Coffee",
}

export default function LoginPage() {
  return <AuthForm mode="signIn" />
}
