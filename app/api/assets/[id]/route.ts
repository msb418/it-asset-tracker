// app/api/assets/[id]/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Asset from "@/models/Asset";
// NOTE: relative import so it works even if TS path aliases aren't active
import auth from "../../auth/[...nextauth]/auth";

export const dynamic = "force-dynamic";

async function requireEmail() {
  const session = await auth();
  const email = (session as any)?.user?.email;
  if (!email) {
    throw NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return email;
}

// ---------- GET: fetch one asset ----------
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const email = await requireEmail();
    await dbConnect();

    const item = await Asset.findOne({
      _id: params.id,
      createdByEmail: email,
      deletedAt: { $in: [null, undefined] },
    }).lean();

    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (err: any) {
    if (err?.status) return err; // bubbled NextResponse (e.g., 401)
    console.error("GET /api/assets/:id failed:", err);
    return NextResponse.json({ error: "Route error" }, { status: 500 });
  }
}

// ---------- PATCH: update one asset ----------
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const email = await requireEmail();
    await dbConnect();

    const body = await req.json();

    // Normalize fields (empty string => null; dates parsed)
    const toDate = (v: string | null | undefined) => {
      if (!v) return null;
      const dt = new Date(v);
      return Number.isNaN(dt.getTime()) ? null : dt;
    };

    // Determine new type, if provided. Prefer assetType, fall back to type. If neither provided, don't touch the type fields.
    const newType =
      typeof body?.assetType === "string" && body.assetType.trim()
        ? body.assetType.trim()
        : typeof body?.type === "string" && body.type.trim()
        ? body.type.trim()
        : undefined;

    const update: Record<string, any> = {
      // Only set provided fields; avoid overwriting with defaults on PATCH
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.serialNumber !== undefined ? { serialNumber: body.serialNumber } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
      ...(body.purchaseDate !== undefined ? { purchaseDate: toDate(body.purchaseDate) } : {}),
      ...(body.warrantyExpiry !== undefined ? { warrantyExpiry: toDate(body.warrantyExpiry) } : {}),
      ...(body.location !== undefined ? { location: body.location } : {}),
      ...(body.assignedTo !== undefined ? { assignedTo: body.assignedTo } : {}),
      updatedAt: new Date(),
    };

    if (newType) {
      // keep both fields in sync for compatibility with UI/components that read either
      update.assetType = newType;
      update.type = newType;
    }

    const result = await Asset.findOneAndUpdate(
      { _id: params.id, createdByEmail: email, deletedAt: { $in: [null, undefined] } },
      { $set: update },
      { new: true }
    ).lean();

    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, item: result });
  } catch (err: any) {
    if (err?.status) return err;
    console.error("PATCH /api/assets/:id failed:", err);
    return NextResponse.json({ error: "Route error" }, { status: 500 });
  }
}

// ---------- DELETE: permanently delete one asset ----------
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const email = await requireEmail();
    await dbConnect();

    const result = await Asset.findOneAndDelete({
      _id: params.id,
      createdByEmail: email,
    }).lean();

    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err?.status) return err;
    console.error("DELETE /api/assets/:id failed:", err);
    return NextResponse.json({ error: "Route error" }, { status: 500 });
  }
}