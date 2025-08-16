import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongoose";
import Asset from "@/models/Asset";
import { NextResponse } from "next/server";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });
  await dbConnect();
  const updated = await Asset.findOneAndUpdate(
    { _id: params.id, createdByEmail: session.user.email, deletedAt: { $ne: null } },
    { deletedAt: null },
    { new: true }
  );
  if (!updated) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json({ ok: true });
}