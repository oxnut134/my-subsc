import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { listHabits } from "@/lib/habits";
import { getTodayCompletedHabitIds } from "@/lib/habit-logs";
import { SignOutButton } from "./sign-out-button";
import { createHabit, deleteHabit, completeHabitToday } from "./actions";

export default async function HabitsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [userHabits, completedTodayIds] = await Promise.all([
    listHabits(session.user.id),
    getTodayCompletedHabitIds(session.user.id),
  ]);

  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-4 py-10">
      <div className="w-full max-w-md flex items-center justify-between">
        <h1 className="text-2xl font-bold">習慣一覧</h1>
        <SignOutButton />
      </div>

      <p className="w-full max-w-md text-sm text-gray-600">
        ログイン中: {session.user.email}
      </p>

      <form action={createHabit} className="w-full max-w-md flex gap-2">
        <input
          name="title"
          type="text"
          required
          placeholder="新しい習慣を入力"
          className="flex-1 border rounded-md px-3 py-2"
        />
        <button
          type="submit"
          className="bg-black text-white rounded-md px-4 py-2 whitespace-nowrap"
        >
          追加
        </button>
      </form>

      <ul className="w-full max-w-md flex flex-col gap-2">
        {userHabits.length === 0 && (
          <li className="text-sm text-gray-500">
            まだ習慣が登録されていません。
          </li>
        )}
        {userHabits.map((habit) => {
          const isCompletedToday = completedTodayIds.has(habit.id);

          return (
            <li
              key={habit.id}
              className="flex items-center justify-between border rounded-md px-3 py-2 gap-2"
            >
              <Link href={`/habits/${habit.id}`} className="underline">
                {habit.title}
              </Link>

              <div className="flex items-center gap-2 shrink-0">
                {isCompletedToday ? (
                  <span className="text-sm text-green-600">実施済み</span>
                ) : (
                  <form action={completeHabitToday.bind(null, habit.id)}>
                    <button
                      type="submit"
                      className="text-sm bg-black text-white rounded-md px-2 py-1"
                    >
                      今日実施した
                    </button>
                  </form>
                )}
                <form action={deleteHabit.bind(null, habit.id)}>
                  <button type="submit" className="text-sm text-red-600">
                    削除
                  </button>
                </form>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
