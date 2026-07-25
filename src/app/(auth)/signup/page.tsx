import type { Metadata } from "next"

import { AuthForm } from "@/components/auth/auth-form"

export const metadata: Metadata = {
  title: "Sign up — Let Coffee",
}

export default function SignupPage() {
  return <AuthForm mode="signUp" />
}
