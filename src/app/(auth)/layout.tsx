import Image from "next/image"
import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-6 p-6 md:p-10">
      <Link href="/" className="flex items-center gap-2 self-center">
        <Image
          src="/logo.png"
          alt="Let Coffee logo"
          width={28}
          height={28}
          className="size-7 rounded-md"
        />
        <span className="text-lg font-semibold tracking-tight">
          <span className="text-primary">Let</span> Coffee
        </span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}
