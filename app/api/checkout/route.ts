import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createCheckoutSession } from "stripe-subscription-kit";
import { auth } from "@/auth";
import { canStartCheckout, getUserSubscription } from "@/lib/subscriptions";

const SUCCESS_URL = "http://localhost:3000/habits?checkout=success";
const CANCEL_URL = "http://localhost:3000/habits?checkout=cancel";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  const subscription = await getUserSubscription(session.user.id);
  const status = subscription?.status ?? null;
  if (!canStartCheckout(status)) {
    const message =
      status === "payment_failed"
        ? "お支払いに失敗している契約があります。支払い方法を更新してください。"
        : "すでに有料プランをご契約中です。";
    return NextResponse.json({ error: message }, { status: 409 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const result = await createCheckoutSession(
    {
      priceId: process.env.STRIPE_TEST_PRICE_ID!,
      successUrl: SUCCESS_URL,
      cancelUrl: CANCEL_URL,
      metadata: { userId: session.user.id },
    },
    stripe
  );

  return NextResponse.json(result);
}
