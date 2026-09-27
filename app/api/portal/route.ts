import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createPortalSession } from "stripe-subscription-kit";

const RETURN_URL = "http://localhost:3000";

export async function POST(request: Request) {
  const body = await request.json();
  const customerId = body.customerId;

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const result = await createPortalSession(
    {
      customerId,
      returnUrl: RETURN_URL,
    },
    stripe
  );

  return NextResponse.json(result);
}
