import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: Request) {
  const body = await request.json();
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { error: "メールアドレスの形式が正しくありません。" },
      { status: 400 }
    );
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `パスワードは${MIN_PASSWORD_LENGTH}文字以上で入力してください。` },
      { status: 400 }
    );
  }

  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (existingUser) {
    return NextResponse.json(
      { error: "このメールアドレスは既に登録されています。" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await db.insert(users).values({
    email,
    passwordHash,
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
