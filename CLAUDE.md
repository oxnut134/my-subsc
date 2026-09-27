---
# my-subsc プロジェクトルール

## プロジェクト概要
サブスクリプション課金型の、習慣トラッカーアプリ。
Stripe（サブスク課金）とAWS（インフラ）の、
実務経験を積むための、ポートフォリオプロジェクト。

## 技術スタック
- Next.js (App Router, TypeScript)
- Tailwind CSS
- NextAuth.js（認証）
- PostgreSQL + Drizzle ORM
- Stripe（サブスクリプション課金）
- AWS（デプロイ先）

## コーディング規約
- コンポーネントは、機能ごとに分割し、再利用性を意識する
- 型は、必ず、明示的に定義する（anyの使用は避ける）
- コミットメッセージは、英語で、簡潔に記載する

## データベース設計
- users (1) → habits (多) → habit_logs (多)
  - users: ユーザー
  - habits: 習慣（user_idで、users参照）
  - habit_logs: 記録（habit_idで、habits参照）
- users (1) → subscriptions (多)
  - subscriptions: サブスク契約（user_idで、users参照）
    - カラム: id, user_id, stripe_customer_id（一意）,
      stripe_subscription_id（一意、空欄可）, price_id（空欄可）,
      status（"active" | "canceled" | "payment_failed"）,
      created_at, updated_at

## 開発の進め方
1. 基本の認証機能
2. 習慣のCRUD機能（課金なし）
3. Stripeサブスク決済の導入
4. アクセス制限の実装
5. AWSへのデプロイ

## 開発環境

### Stripe webhook のローカルテスト
- Next.js（npm run dev）はWindows側、Stripe CLI（stripe listen）はWSL2側で動かす
- WSL2のNATモードでは、WSLから localhost で、Windows側のNext.jsサーバーに到達できない
  - WSLの localhost はWSL自身を指す
  - resolv.conf の nameserver（10.255.255.254）は、DNS専用のアドレスで、Windowsではない
- そのため、WSLのデフォルトゲートウェイIP（Windows側のIP）を使う
  - IPは再起動などで変わるため、固定値ではなく、コマンド内で毎回取得する
- WSL側のターミナルで、以下を実行する

```bash
stripe listen --events checkout.session.completed,customer.subscription.updated,customer.subscription.deleted,invoice.payment_failed --forward-to "http://$(ip route show default | awk '{print $3}'):3000/api/webhook/stripe"
```

- 実行後に表示される whsec_... の値が、.env の STRIPE_WEBHOOK_SECRET と一致しているか確認する
  - 異なる場合は、.env を更新し、npm run dev を再起動する
  - 一致していないと、webhookは届いても、署名検証で400エラーになる

## 注意事項
- セキュリティに関わる情報（APIキー、シークレットキーなど）は、
  必ず、.envファイルで管理し、コードに直接書かない
---
