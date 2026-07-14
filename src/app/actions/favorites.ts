"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function toggleFavorite(symbol: string) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) throw new Error("User not found");

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_symbol: {
        userId: user.id,
        symbol: symbol,
      },
    },
  });

  if (existing) {
    // Remove from favorites
    await prisma.favorite.delete({
      where: { id: existing.id },
    });
  } else {
    // Add to favorites
    await prisma.favorite.create({
      data: {
        userId: user.id,
        symbol: symbol,
      },
    });
  }

  revalidatePath("/analysis");
  revalidatePath("/");
}

export async function getFavorites() {
  const session = await auth();
  if (!session?.user?.email) return [];

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { favorites: true },
  });

  return user?.favorites.map(f => f.symbol) || [];
}
