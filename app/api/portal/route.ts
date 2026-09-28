import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createPortalSession } from "stripe-subscription-kit";
import { auth } from "@/auth";
import { getUserSubscription } from "@/lib/subscriptions";

const RETURN_URL = "http://localhost:3000";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  // customerId はブラウザから受け取らず、ログイン中のユーザーの契約から引く
  const subscription = await getUserSubscription(session.user.id);
  if (!subscription) {
    return NextResponse.json(
      { error: "契約が見つかりません。" },
      { status: 404 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const result = await createPortalSession(
    {
      customerId: subscription.stripeCustomerId,
      returnUrl: RETURN_URL,
    },
    stripe
  );

  return NextResponse.json(result);
}
