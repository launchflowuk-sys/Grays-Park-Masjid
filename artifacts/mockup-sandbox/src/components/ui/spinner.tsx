import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

// Typed from the icon itself rather than "svg": lucide's ref type is narrower
// than React.ComponentProps<"svg">, so the two disagree on `ref` under React 19.
function Spinner({ className, ...props }: React.ComponentProps<typeof Loader2Icon>) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
