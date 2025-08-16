import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Asset from "@/models/Asset";

export const runtime = "nodejs";

// helper: safe date parsing
function toDate(v: any): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

// helper: always generate a non-null assetTag (unique index friendly)
function genAssetTag(name: string, assetType: string) {
  const prefix =
    (assetType || name || "ASSET")
      .toString()
      .trim()
      .slice(0, 2)
      .toUpperCase() || "AS";
  const num = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${num}`;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // quick health endpoint if you were using it elsewhere
    await dbConnect();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Route check failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const name = String(body.name || "").trim();
    const assetType = String((body.assetType ?? body.type ?? "Laptop")).trim();
    const status = String(body.status || "In Stock");

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const doc = {
      name,
      assetType,
      status,
      serialNumber: (body.serialNumber ?? "").toString().trim() || undefined,
      description: (body.description ?? "").toString().trim() || undefined,
      notes: (body.notes ?? "").toString().trim() || undefined, // <-- persist Notes
      purchaseDate: toDate(body.purchaseDate),
      warrantyExpiry: toDate(body.warrantyExpiry),
      location: (body.location ?? "").toString().trim() || undefined,
      assignedTo: (body.assignedTo ?? "").toString().trim() || undefined,
      // important scoping + soft delete
      createdByEmail: session.user.email,
      deletedAt: null,
      // ensure unique index never sees null
      assetTag: genAssetTag(name, assetType),
    };

    await dbConnect();

    const created = await Asset.create(doc);

    return NextResponse.json({ id: created._id.toString() }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/assets failed:", err);
    // Surface a clearer duplicate key error if any unique index trips
    if (err?.code === 11000) {
      return NextResponse.json(
        { error: `Duplicate key on ${Object.keys(err.keyPattern || {}).join(", ")}` },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to create asset" }, { status: 500 });
  }
}