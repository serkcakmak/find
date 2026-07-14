import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0f1115] text-white flex">
      <Sidebar />
      <main className="ml-64 flex-1 p-8 max-w-7xl">
        {children}
      </main>
    </div>
  );
}
