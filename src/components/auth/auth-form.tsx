"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthActions } from "@convex-dev/auth/react"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"

export type AuthMode = "signIn" | "signUp"

const copy: Record<
  AuthMode,
  {
    title: string
    description: string
    submitLabel: string
    switchPrompt: string
    switchLabel: string
    switchHref: string
  }
> = {
  signIn: {
    title: "Sign in",
    description: "Enter your email and password to access the dashboard.",
    submitLabel: "Sign in",
    switchPrompt: "Don't have an account?",
    switchLabel: "Sign up",
    switchHref: "/signup",
  },
  signUp: {
    title: "Create an account",
    description: "Set up access to the Let Coffee sales tracker.",
    submitLabel: "Create account",
    switchPrompt: "Already have an account?",
    switchLabel: "Sign in",
    switchHref: "/login",
  },
}

function getAuthErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }
  return "Authentication failed. Please try again."
}

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter()
  const { signIn } = useAuthActions()
  const [showPassword, setShowPassword] = React.useState(false)
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const text = copy[mode]

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const formData = new FormData(event.currentTarget)
    formData.set("flow", mode === "signIn" ? "signIn" : "signUp")

    setPending(true)
    try {
      await signIn("password", formData)
      router.push("/")
      router.refresh()
    } catch (caught) {
      const message = getAuthErrorMessage(caught)
      setError(message)
      toast.error(message)
    } finally {
      setPending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{text.title}</CardTitle>
        <CardDescription>{text.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {error && (
              <Field data-invalid>
                <FieldError>{error}</FieldError>
              </Field>
            )}
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@letcoffee.com"
                autoComplete="email"
                disabled={pending}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete={
                    mode === "signIn" ? "current-password" : "new-password"
                  }
                  minLength={8}
                  disabled={pending}
                  required
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="button"
                    size="icon-xs"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {mode === "signUp" && (
                <FieldDescription>
                  Must be at least 8 characters.
                </FieldDescription>
              )}
            </Field>
            <Field>
              <Button type="submit" disabled={pending}>
                {pending && <Spinner data-icon="inline-start" />}
                {text.submitLabel}
              </Button>
              <FieldDescription className="text-center">
                {text.switchPrompt}{" "}
                <Link href={text.switchHref}>{text.switchLabel}</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
