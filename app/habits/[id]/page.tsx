import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getHabitById } from "@/lib/habits";
import { getHabitLogs } from "@/lib/habit-logs";

export default async function HabitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const habit = await getHabitById(session.user.id, id);
  if (!habit) {
    notFound();
  }

  const logs = await getHabitLogs(session.user.id, id);

  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-4 py-10">
      <div className="w-full max-w-md flex items-center justify-between">
        <h1 className="text-2xl font-bold">{habit.title}</h1>
        <Link href="/habits" className="text-sm underline">
          一覧へ戻る
        </Link>
      </div>

      <div className="w-full max-w-md">
        <h2 className="text-sm font-medium text-gray-600 mb-2">実施履歴</h2>
        <ul className="flex flex-col gap-1">
          {(!logs || logs.length === 0) && (
            <li className="text-sm text-gray-500">
              まだ記録がありません。
            </li>
          )}
          {logs?.map((log) => (
            <li
              key={log.id}
              className="border rounded-md px-3 py-2 text-sm"
            >
              {log.completedAt}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
