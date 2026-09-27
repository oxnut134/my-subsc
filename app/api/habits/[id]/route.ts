import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteHabit } from "@/lib/habits";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  const { id } = await params;
  const deletedHabit = await deleteHabit(session.user.id, id);

  if (!deletedHabit) {
    return NextResponse.json(
      { error: "習慣が見つかりません。" },
      { status: 404 }
    );
  }

  return NextResponse.json({ habit: deletedHabit });
}
