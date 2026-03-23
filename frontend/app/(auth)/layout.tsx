import { SiteHeader } from "@/components/site-header"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center p-2">
        {children}
      </main>
    </div>
  )
}
