// app/assets/[id]/edit/page.tsx
export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/db";
import Asset from "@/models/Asset";
import AssetEditForm from "@/components/AssetEditForm";

// A narrow, explicit type for the fields we read from Mongo via .lean()
type LeanAsset = {
  _id: any;
  name?: string;
  type?: string;
  assetType?: string; // some records use assetType
  status?: string;
  serialNumber?: string;
  description?: string;
  notes?: string;
  purchaseDate?: Date | string | null;
  warrantyExpiry?: Date | string | null;
  location?: string;
  assignedTo?: string;
  deletedAt?: Date | null | undefined;
};

// Format a date-like value to yyyy-mm-dd (for <input type="date">)
function toYmd(d?: Date | string | null): string {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime?.() ?? NaN)) return "";
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default async function EditAssetPage({
  params,
}: {
  params: { id: string };
}) {
  await dbConnect();

  const doc = (await Asset.findById(params.id).lean()) as LeanAsset | null;

  if (!doc || doc.deletedAt) {
    return notFound();
  }

  const resolvedType = doc.type ?? doc.assetType ?? "Laptop";
  const initial = {
    id: String(doc._id),
    name: doc.name ?? "",
    type: resolvedType,
    status: doc.status ?? "In Stock",
    serialNumber: doc.serialNumber ?? "",
    description: doc.description ?? "",
    notes: doc.notes ?? "",
    purchaseDate: toYmd(doc.purchaseDate),
    warrantyExpiry: toYmd(doc.warrantyExpiry),
    location: doc.location ?? "",
    assignedTo: doc.assignedTo ?? "",
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="rounded-2xl bg-slate-900/40 ring-1 ring-white/10 p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Asset</h1>
        <AssetEditForm initial={initial} />
      </div>
    </div>
  );
}