import { auth } from "@/auth";
import Link from "next/link";
import { getAssetById, type AssetDTO } from "@/lib/data/assets";
import DeleteAssetButton from "@/components/DeleteAssetButton";
import AssetQr from "@/components/AssetQr";

export default async function AssetDetail({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.email) {
    return (
      <div className="card p-6">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p className="text-slate-300">Please sign in to access this page.</p>
        <Link href="/login" className="btn-ghost mt-4 inline-block">Go to Login</Link>
      </div>
    );
  }

  const asset = (await getAssetById(params.id, session.user.email)) as AssetDTO | null;

  if (!asset) {
    return (
      <div className="card p-6">
        <h1 className="text-2xl font-bold">Not found</h1>
        <p className="text-slate-300">The asset does not exist or you don’t have access.</p>
        <Link href="/assets" className="btn-ghost mt-4 inline-block">Back to list</Link>
      </div>
    );
  }

  const purchaseDate = asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : "-";
  const warrantyExpiry = asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString() : "-";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{asset.name}</h1>
        <div className="flex gap-2">
          <Link href={`/assets/${asset._id}/edit`} className="btn-ghost">Edit</Link>
          <DeleteAssetButton id={asset._id} name={asset.name} />
          <Link href="/assets" className="btn-ghost">Back</Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="card p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-3">Details</h2>
          <ul className="space-y-2 text-slate-300">
            <li><b>Type:</b> {asset.assetType}</li>
            <li><b>Serial:</b> {asset.serialNumber || "-"}</li>
            <li><b>Status:</b> {asset.status}</li>
            <li><b>Location:</b> {asset.location || "-"}</li>
            <li><b>Assigned To:</b> {asset.assignedTo || "-"}</li>
            <li><b>Purchased:</b> {purchaseDate}</li>
            <li><b>Warranty:</b> {warrantyExpiry}</li>
          </ul>
          <h3 className="text-lg font-semibold mt-6 mb-2">Notes</h3>
          <p className="text-slate-300 whitespace-pre-wrap">{asset.description || "—"}</p>
        </div>

        {/* QR Code card */}
        <div className="card p-6 flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold mb-4">QR Code</h2>
          <AssetQr id={asset._id} size={160} />
          <p className="text-slate-400 text-sm mt-3">Scan to open this asset</p>
        </div>
      </div>
    </div>
  );
}