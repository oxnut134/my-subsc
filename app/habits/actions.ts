"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import * as habitsLib from "@/lib/habits";
import * as habitLogsLib from "@/lib/habit-logs";

export async function createHabit(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("認証が必要です。");
  }

  const title = formData.get("title");
  if (typeof title !== "string") {
    throw new Error("習慣名を入力してください。");
  }

  await habitsLib.createHabit(session.user.id, title);

  revalidatePath("/habits");
}

export async function deleteHabit(habitId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("認証が必要です。");
  }

  await habitsLib.deleteHabit(session.user.id, habitId);

  revalidatePath("/habits");
}

export async function completeHabitToday(habitId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("認証が必要です。");
  }

  const log = await habitLogsLib.completeHabit(session.user.id, habitId);
  if (!log) {
    throw new Error("習慣が見つかりません。");
  }

  revalidatePath("/habits");
  revalidatePath(`/habits/${habitId}`);
}
