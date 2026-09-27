import { NextResponse } from "next/server";
import Stripe from "stripe";
import { verifyWebhookEvent, handleWebhookEvent } from "stripe-subscription-kit";
import type {
  SubscriptionActiveData,
  SubscriptionUpdatedData,
  SubscriptionCanceledData,
  PaymentFailedData,
} from "stripe-subscription-kit";
import {
  toSubscriptionStatus,
  updateSubscriptionByCustomerId,
  upsertActiveSubscription,
} from "@/lib/subscriptions";

function logSubscriptionNotFound(handler: string, customerId: string) {
  // エラーにすると Stripe が webhook を再送し続けるため、ログのみ出力する
  console.warn(`${handler}: customerId ${customerId} の subscription が見つかりません`);
}

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
    onSubscriptionActive: async (data: SubscriptionActiveData) => {
      const userId = data.metadata?.userId;
      if (!userId) {
        console.warn("onSubscriptionActive: metadata.userId がありません", data);
        return;
      }

      await upsertActiveSubscription({
        userId,
        stripeCustomerId: data.customerId,
        stripeSubscriptionId: data.subscriptionId,
        priceId: data.priceId || null,
      });
    },
    onSubscriptionUpdated: async (data: SubscriptionUpdatedData) => {
      const status = toSubscriptionStatus(data.status);
      if (!status) {
        console.warn(
          `onSubscriptionUpdated: 想定外の status ${data.status} のため更新をスキップします`,
          data
        );
        return;
      }

      const subscription = await updateSubscriptionByCustomerId(
        data.customerId,
        { status, priceId: data.priceId || null }
      );
      if (!subscription) {
        logSubscriptionNotFound("onSubscriptionUpdated", data.customerId);
      }
    },
    onSubscriptionCanceled: async (data: SubscriptionCanceledData) => {
      const subscription = await updateSubscriptionByCustomerId(
        data.customerId,
        { status: "canceled" }
      );
      if (!subscription) {
        logSubscriptionNotFound("onSubscriptionCanceled", data.customerId);
      }
    },
    onPaymentFailed: async (data: PaymentFailedData) => {
      const subscription = await updateSubscriptionByCustomerId(
        data.customerId,
        { status: "payment_failed" }
      );
      if (!subscription) {
        logSubscriptionNotFound("onPaymentFailed", data.customerId);
      }
    },
  });

  return NextResponse.json({ received: true });
}
