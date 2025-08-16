import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongoose";
import Asset from "@/models/Asset";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });
  await dbConnect();

  const { ids, action } = (await req.json()) as {
    ids: string[];
    action: "delete" | "restore" | "destroy";
  };

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ ok: true });
  }

  if (action === "delete") {
    await Asset.updateMany(
      { _id: { $in: ids }, createdByEmail: session.user.email, deletedAt: null },
      { $set: { deletedAt: new Date() } }
    );
  } else if (action === "restore") {
    await Asset.updateMany(
      { _id: { $in: ids }, createdByEmail: session.user.email, deletedAt: { $ne: null } },
      { $set: { deletedAt: null } }
    );
  } else if (action === "destroy") {
    await Asset.deleteMany({
      _id: { $in: ids },
      createdByEmail: session.user.email,
      deletedAt: { $ne: null },
    });
  } else {
    return new NextResponse("Bad Request", { status: 400 });
  }

  return NextResponse.json({ ok: true });
}