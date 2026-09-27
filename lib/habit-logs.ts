import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { habitLogs, habits } from "@/db/schema";
import { getHabitById } from "@/lib/habits";

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export async function completeHabit(userId: string, habitId: string) {
  const habit = await getHabitById(userId, habitId);
  if (!habit) {
    return null;
  }

  const today = todayDateString();

  const [existingLog] = await db
    .select()
    .from(habitLogs)
    .where(
      and(eq(habitLogs.habitId, habitId), eq(habitLogs.completedAt, today))
    );

  if (existingLog) {
    return existingLog;
  }

  const [log] = await db
    .insert(habitLogs)
    .values({ habitId, completedAt: today })
    .returning();

  return log;
}

export async function getHabitLogs(userId: string, habitId: string) {
  const habit = await getHabitById(userId, habitId);
  if (!habit) {
    return null;
  }

  return db
    .select()
    .from(habitLogs)
    .where(eq(habitLogs.habitId, habitId))
    .orderBy(desc(habitLogs.completedAt));
}

export async function getTodayCompletedHabitIds(userId: string) {
  const today = todayDateString();

  const rows = await db
    .select({ habitId: habitLogs.habitId })
    .from(habitLogs)
    .innerJoin(habits, eq(habitLogs.habitId, habits.id))
    .where(and(eq(habits.userId, userId), eq(habitLogs.completedAt, today)));

  return new Set(rows.map((row) => row.habitId));
}
