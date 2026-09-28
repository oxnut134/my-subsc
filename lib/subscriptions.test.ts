import { describe, it, expect, vi } from "vitest";
import type Stripe from "stripe";
import { toSubscriptionStatus } from "@/lib/subscriptions";

// 実際の DB(RDS)に接続しないよう、db を差し替える。
// 誤って DB 操作が呼ばれた場合は、黙って通らずにテストを失敗させる。
vi.mock("@/db", () => ({
  db: new Proxy(
    {},
    {
      get(_target, property) {
        throw new Error(
          `db.${String(property)} was accessed in a unit test`
        );
      },
    }
  ),
}));

describe("toSubscriptionStatus", () => {
  it.each(["active", "trialing"] as const)(
    'maps "%s" to "active"',
    (stripeStatus) => {
      expect(toSubscriptionStatus(stripeStatus)).toBe("active");
    }
  );

  it.each(["past_due", "unpaid"] as const)(
    'maps "%s" to "payment_failed"',
    (stripeStatus) => {
      expect(toSubscriptionStatus(stripeStatus)).toBe("payment_failed");
    }
  );

  it.each(["canceled", "incomplete_expired"] as const)(
    'maps "%s" to "canceled"',
    (stripeStatus) => {
      expect(toSubscriptionStatus(stripeStatus)).toBe("canceled");
    }
  );

  it.each(["incomplete", "paused"] as const)(
    'returns null for "%s"',
    (stripeStatus) => {
      expect(toSubscriptionStatus(stripeStatus)).toBeNull();
    }
  );

  it("returns null for an unknown status that Stripe may add in the future", () => {
    const futureStatus: Stripe.Subscription.Status = "some_future_status";
    expect(toSubscriptionStatus(futureStatus)).toBeNull();
  });
});
