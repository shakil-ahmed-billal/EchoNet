import { cn } from "@/lib/utils"

export function SiteMark({
  className,
  ...props
}: React.ComponentProps<"img">) {
  return (
    <>
      <img
        src="/logo/dark-logo.png"
        alt="Shakil Logo"
        className={cn("hidden h-4 w-auto object-contain dark:block", className)}
        {...props}
      />
      <img
        src="/logo/light-logo.png"
        alt="Shakil Logo"
        className={cn("block h-4 w-auto object-contain dark:hidden", className)}
        {...props}
      />
    </>
  )
}

export function getMarkSVG(color: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><text x="50" y="50" fill="${color}">S</text></svg>`
}