"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import * as habitsLib from "@/lib/habits";
import * as habitLogsLib from "@/lib/habit-logs";

export type CreateHabitState = {
  error: string | null;
};

// 入力エラーと上限エラーは、画面に表示するため戻り値で返す
export async function createHabit(
  _prevState: CreateHabitState,
  formData: FormData
): Promise<CreateHabitState> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("認証が必要です。");
  }

  const title = formData.get("title");
  if (typeof title !== "string") {
    return { error: "習慣名を入力してください。" };
  }

  try {
    await habitsLib.createHabit(session.user.id, title);
  } catch (error) {
    if (
      error instanceof habitsLib.HabitValidationError ||
      error instanceof habitsLib.HabitLimitError
    ) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/habits");
  return { error: null };
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
