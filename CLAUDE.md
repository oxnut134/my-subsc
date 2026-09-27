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

## 開発の進め方
1. 基本の認証機能
2. 習慣のCRUD機能（課金なし）
3. Stripeサブスク決済の導入
4. アクセス制限の実装
5. AWSへのデプロイ

## 注意事項
- セキュリティに関わる情報（APIキー、シークレットキーなど）は、
  必ず、.envファイルで管理し、コードに直接書かない
---
