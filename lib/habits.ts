import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { habits } from "@/db/schema";

export class HabitValidationError extends Error {}

export async function listHabits(userId: string) {
  return db
    .select()
    .from(habits)
    .where(eq(habits.userId, userId))
    .orderBy(desc(habits.createdAt));
}

export async function createHabit(userId: string, title: string) {
  const trimmedTitle = title.trim();

  if (trimmedTitle.length === 0) {
    throw new HabitValidationError("習慣名を入力してください。");
  }

  const [habit] = await db
    .insert(habits)
    .values({ userId, title: trimmedTitle })
    .returning();

  return habit;
}

export async function deleteHabit(userId: string, habitId: string) {
  const [deletedHabit] = await db
    .delete(habits)
    .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
    .returning();

  return deletedHabit ?? null;
}

export async function getHabitById(userId: string, habitId: string) {
  const [habit] = await db
    .select()
    .from(habits)
    .where(and(eq(habits.id, habitId), eq(habits.userId, userId)));

  return habit ?? null;
}
