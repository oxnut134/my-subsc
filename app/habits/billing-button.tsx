"use client";

import { useState } from "react";
import type { BillingAction } from "@/lib/subscriptions";

const BUTTON_CONFIG: Record<BillingAction, { label: string; endpoint: string }> =
  {
    upgrade: { label: "有料プランにアップグレード", endpoint: "/api/checkout" },
    manage: { label: "契約を管理", endpoint: "/api/portal" },
    update_payment: { label: "支払い方法を更新", endpoint: "/api/portal" },
  };

export function BillingButton({ action }: { action: BillingAction }) {
  const { label, endpoint } = BUTTON_CONFIG[action];
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClick = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(endpoint, { method: "POST" });
      const data = await response.json();

      if (!response.ok || typeof data.url !== "string") {
        setError(data.error ?? "処理に失敗しました。");
        setIsSubmitting(false);
        return;
      }

      // Stripe の画面(外部 URL)へ移動する。移動が終わるまでボタンは押せないままにする
      window.location.href = data.url;
    } catch {
      setError("処理に失敗しました。時間をおいて再度お試しください。");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isSubmitting}
        className="bg-black text-white rounded-md px-4 py-2 text-sm disabled:opacity-50"
      >
        {label}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
