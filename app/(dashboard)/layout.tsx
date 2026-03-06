import { Navbar } from "@/components/shared/Navbar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50/50">
      <Navbar />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 md:py-8">
        {children}
      </main>
    </div>
  )
}
