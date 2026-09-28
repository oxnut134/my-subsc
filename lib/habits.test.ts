import { describe, it, expect, vi } from "vitest";
import { FREE_PLAN_HABIT_LIMIT, canCreateHabit } from "@/lib/habits";

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

describe("canCreateHabit", () => {
  describe("free plan", () => {
    it("allows creating when below the limit", () => {
      expect(canCreateHabit({ isPaid: false, currentCount: 0 })).toBe(true);
      expect(
        canCreateHabit({
          isPaid: false,
          currentCount: FREE_PLAN_HABIT_LIMIT - 1,
        })
      ).toBe(true);
    });

    it("rejects creating when the limit is reached", () => {
      expect(
        canCreateHabit({ isPaid: false, currentCount: FREE_PLAN_HABIT_LIMIT })
      ).toBe(false);
    });

    it("rejects creating when already above the limit", () => {
      expect(
        canCreateHabit({
          isPaid: false,
          currentCount: FREE_PLAN_HABIT_LIMIT + 1,
        })
      ).toBe(false);
    });
  });

  describe("paid plan", () => {
    it("allows creating regardless of the current count", () => {
      expect(canCreateHabit({ isPaid: true, currentCount: 0 })).toBe(true);
      expect(
        canCreateHabit({ isPaid: true, currentCount: FREE_PLAN_HABIT_LIMIT })
      ).toBe(true);
      expect(canCreateHabit({ isPaid: true, currentCount: 100 })).toBe(true);
    });
  });

  it("uses a free plan limit of 3", () => {
    expect(FREE_PLAN_HABIT_LIMIT).toBe(3);
  });
});
