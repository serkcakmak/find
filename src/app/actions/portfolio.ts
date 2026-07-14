"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function addPortfolioItem(symbol: string, quantity: number, averagePrice: number) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) throw new Error("User not found");

  await prisma.portfolioItem.create({
    data: {
      userId: user.id,
      symbol: symbol.toUpperCase(),
      quantity,
      averagePrice,
    },
  });

  revalidatePath("/portfolio");
}

export async function deletePortfolioItem(id: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  await prisma.portfolioItem.delete({
    where: { id },
  });

  revalidatePath("/portfolio");
}

export async function getPortfolioItems() {
  const session = await auth();
  if (!session?.user?.email) return [];

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      portfolio: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return user?.portfolio || [];
}
