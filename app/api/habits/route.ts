import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  HabitLimitError,
  HabitValidationError,
  createHabit,
  listHabits,
} from "@/lib/habits";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  const data = await listHabits(session.user.id);
  return NextResponse.json({ habits: data });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const title = body && typeof body.title === "string" ? body.title : "";

  try {
    const habit = await createHabit(session.user.id, title);
    return NextResponse.json({ habit }, { status: 201 });
  } catch (error) {
    if (error instanceof HabitValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof HabitLimitError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    throw error;
  }
}
