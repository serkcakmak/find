import { getPortfolioItems } from "@/app/actions/portfolio";
import { PortfolioManager } from "@/components/PortfolioManager";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function PortfolioPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  const items = await getPortfolioItems();

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Portföyüm</h1>
        <p className="text-gray-400 mt-1">Yatırımlarınızı takip edin, kâr ve zararlarınızı anlık analiz edin.</p>
      </header>

      <PortfolioManager initialItems={items} />
    </>
  );
}
