import { SiteHeader } from "@/components/site-header"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 md:px-8 py-6">
        {children}
      </main>
    </div>
  )
}
