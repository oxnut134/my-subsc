import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createCheckoutSession } from "stripe-subscription-kit";

const SUCCESS_URL = "http://localhost:3000/success";
const CANCEL_URL = "http://localhost:3000/cancel";

export async function POST() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const result = await createCheckoutSession(
    {
      priceId: process.env.STRIPE_TEST_PRICE_ID!,
      successUrl: SUCCESS_URL,
      cancelUrl: CANCEL_URL,
    },
    stripe
  );

  return NextResponse.json(result);
}
