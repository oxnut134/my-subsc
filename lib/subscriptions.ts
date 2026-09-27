import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";

type SubscriptionStatus = (typeof subscriptions.$inferSelect)["status"];

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
