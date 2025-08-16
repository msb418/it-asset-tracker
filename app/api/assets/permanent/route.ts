import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Asset from "@/models/Asset";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const ids: string[] = Array.isArray(body?.ids)
      ? body.ids
      : body?.id
      ? [String(body.id)]
      : [];

    if (!ids.length) {
      return NextResponse.json({ error: "No ids provided" }, { status: 400 });
    }

    await dbConnect();

    const res = await Asset.deleteMany({
      _id: { $in: ids },
      createdByEmail: session.user.email,
    });

    return NextResponse.json({ ok: true, deleted: res.deletedCount ?? 0 });
  } catch (err: any) {
    console.error("POST /api/assets/permanent failed:", err);
    return NextResponse.json({ error: "Failed to permanently delete" }, { status: 500 });
  }
}