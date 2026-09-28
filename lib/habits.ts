import { and, count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { habits } from "@/db/schema";
import { isPaidUser } from "@/lib/subscriptions";

export const FREE_PLAN_HABIT_LIMIT = 3;

export class HabitValidationError extends Error {}

export class HabitLimitError extends Error {}

export function canCreateHabit(params: {
  isPaid: boolean;
  currentCount: number;
}) {
  return params.isPaid || params.currentCount < FREE_PLAN_HABIT_LIMIT;
}

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

  const [{ currentCount }] = await db
    .select({ currentCount: count() })
    .from(habits)
    .where(eq(habits.userId, userId));
  const isPaid = await isPaidUser(userId);

  if (!canCreateHabit({ isPaid, currentCount })) {
    throw new HabitLimitError(
      `無料プランで登録できる習慣は${FREE_PLAN_HABIT_LIMIT}件までです。有料プランにアップグレードすると、上限なく登録できます。`
    );
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
