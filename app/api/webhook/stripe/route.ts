import { NextResponse } from "next/server";
import Stripe from "stripe";
import { verifyWebhookEvent, handleWebhookEvent } from "stripe-subscription-kit";
import type {
  SubscriptionActiveData,
  SubscriptionUpdatedData,
  SubscriptionCanceledData,
  PaymentFailedData,
} from "stripe-subscription-kit";

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "stripe-signature ヘッダーがありません。" },
      { status: 400 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const verification = verifyWebhookEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!,
    stripe
  );

  if (!verification.success) {
    return NextResponse.json({ error: verification.error }, { status: 400 });
  }

  await handleWebhookEvent(verification.event, {
    onSubscriptionActive: (data: SubscriptionActiveData) => {
      console.log("onSubscriptionActive", data);
    },
    onSubscriptionUpdated: (data: SubscriptionUpdatedData) => {
      console.log("onSubscriptionUpdated", data);
    },
    onSubscriptionCanceled: (data: SubscriptionCanceledData) => {
      console.log("onSubscriptionCanceled", data);
    },
    onPaymentFailed: (data: PaymentFailedData) => {
      console.log("onPaymentFailed", data);
    },
  });

  return NextResponse.json({ received: true });
}
