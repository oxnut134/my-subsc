import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { FREE_PLAN_HABIT_LIMIT, canCreateHabit, listHabits } from "@/lib/habits";
import { getTodayCompletedHabitIds } from "@/lib/habit-logs";
import { getBillingAction, getUserSubscription } from "@/lib/subscriptions";
import { SignOutButton } from "./sign-out-button";
import { CreateHabitForm } from "./create-habit-form";
import { BillingButton } from "./billing-button";
import { deleteHabit, completeHabitToday } from "./actions";

export default async function HabitsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [userHabits, completedTodayIds, subscription, { checkout }] =
    await Promise.all([
      listHabits(session.user.id),
      getTodayCompletedHabitIds(session.user.id),
      getUserSubscription(session.user.id),
      searchParams,
    ]);

  const status = subscription?.status ?? null;
  const isPaid = status === "active";
  const billingAction = getBillingAction(status);
  const canCreate = canCreateHabit({
    isPaid,
    currentCount: userHabits.length,
  });

  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-4 py-10">
      <div className="w-full max-w-md flex items-center justify-between">
        <h1 className="text-2xl font-bold">習慣一覧</h1>
        <SignOutButton />
      </div>

      <p className="w-full max-w-md text-sm text-gray-600">
        ログイン中: {session.user.email}
      </p>

      {checkout === "success" && (
        <p className="w-full max-w-md border rounded-md px-3 py-2 text-sm text-green-600">
          ご契約ありがとうございます。反映まで数秒かかることがあります。反映されない場合は画面を更新してください。
        </p>
      )}
      {checkout === "cancel" && (
        <p className="w-full max-w-md border rounded-md px-3 py-2 text-sm text-gray-600">
          お申し込みはキャンセルされました。
        </p>
      )}

      <div className="w-full max-w-md flex flex-col gap-2">
        {status === "payment_failed" && (
          <p className="text-sm text-red-600">
            お支払いに失敗しています。支払い方法を更新するまで、無料プランとして扱われます。
          </p>
        )}
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-gray-600">
            現在のプラン: {isPaid ? "有料プラン" : "無料プラン"}
          </span>
          {/* 上限の案内を出しているときは、同じボタンをそちらに表示する */}
          {canCreate && <BillingButton action={billingAction} />}
        </div>
      </div>

      {canCreate ? (
        <CreateHabitForm />
      ) : (
        <div className="w-full max-w-md flex flex-col gap-2 border rounded-md px-3 py-2">
          <p className="text-sm">
            無料プランの上限({FREE_PLAN_HABIT_LIMIT}件)に達しました。有料プランにアップグレードすると、上限なく登録できます。
          </p>
          <BillingButton action={billingAction} />
        </div>
      )}

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
