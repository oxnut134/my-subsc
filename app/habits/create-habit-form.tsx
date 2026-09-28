"use client";

import { useActionState } from "react";
import { createHabit, type CreateHabitState } from "./actions";

const initialState: CreateHabitState = { error: null };

export function CreateHabitForm() {
  const [state, formAction, isPending] = useActionState(
    createHabit,
    initialState
  );

  return (
    <div className="w-full max-w-md flex flex-col gap-2">
      <form action={formAction} className="flex gap-2">
        <input
          name="title"
          type="text"
          required
          placeholder="新しい習慣を入力"
          className="flex-1 border rounded-md px-3 py-2"
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-black text-white rounded-md px-4 py-2 whitespace-nowrap disabled:opacity-50"
        >
          追加
        </button>
      </form>
      {state.error && (
        <p aria-live="polite" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
    </div>
  );
}
