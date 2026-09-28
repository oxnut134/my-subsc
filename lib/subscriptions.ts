import { desc, eq, sql } from "drizzle-orm";
import type Stripe from "stripe";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";

export type SubscriptionStatus = (typeof subscriptions.$inferSelect)["status"];

export type BillingAction = "upgrade" | "manage" | "update_payment";

// 契約の status から、画面に出すボタンの種類を返す(契約が無い場合は null を渡す)
export function getBillingAction(
  status: SubscriptionStatus | null
): BillingAction {
  switch (status) {
    case "active":
      return "manage";
    case "payment_failed":
      return "update_payment";
    default:
      return "upgrade";
  }
}

// ユーザーの契約を1件返す。active な契約を優先し、無ければ最新の契約、どちらも無ければ null
export async function getUserSubscription(userId: string) {
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .orderBy(
      desc(sql`${subscriptions.status} = 'active'`),
      desc(subscriptions.createdAt)
    )
    .limit(1);

  return subscription ?? null;
}

// status が "active" の契約があるときだけ有料扱い(payment_failed, canceled は無料扱い)
export async function isPaidUser(userId: string) {
  const subscription = await getUserSubscription(userId);
  return subscription?.status === "active";
}

// 想定外の Stripe status(incomplete, paused など)は null を返す
export function toSubscriptionStatus(
  stripeStatus: Stripe.Subscription.Status
): SubscriptionStatus | null {
  switch (stripeStatus) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
    case "unpaid":
      return "payment_failed";
    case "canceled":
    case "incomplete_expired":
      return "canceled";
    default:
      return null;
  }
}

export async function upsertActiveSubscription(params: {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  priceId: string | null;
}) {
  const values = {
    userId: params.userId,
    stripeCustomerId: params.stripeCustomerId,
    stripeSubscriptionId: params.stripeSubscriptionId,
    priceId: params.priceId,
    status: "active" as const,
  };

  const [subscription] = await db
    .insert(subscriptions)
    .values(values)
    .onConflictDoUpdate({
      target: subscriptions.stripeCustomerId,
      set: { ...values, updatedAt: new Date() },
    })
    .returning();

  return subscription;
}

export async function updateSubscriptionByCustomerId(
  stripeCustomerId: string,
  changes: { status: SubscriptionStatus; priceId?: string | null }
) {
  const [subscription] = await db
    .update(subscriptions)
    .set({ ...changes, updatedAt: new Date() })
    .where(eq(subscriptions.stripeCustomerId, stripeCustomerId))
    .returning();

  return subscription ?? null;
}
