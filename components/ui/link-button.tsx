import Link, { type LinkProps } from "next/link"
import type { AnchorHTMLAttributes, PropsWithChildren } from "react"
import { type VariantProps } from "class-variance-authority"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type LinkButtonProps = PropsWithChildren<
  LinkProps &
    AnchorHTMLAttributes<HTMLAnchorElement> & {
      variant?: VariantProps<typeof buttonVariants>["variant"]
      size?: VariantProps<typeof buttonVariants>["size"]
      className?: string
    }
>

export function LinkButton({
  children,
  className,
  variant,
  size,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      {...props}
      className={cn(buttonVariants({ variant, size }), className)}
    >
      {children}
    </Link>
  )
}
