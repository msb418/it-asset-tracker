import Link from "next/link";
import auth from "@/app/api/auth/[...nextauth]/auth";
import { getAssetsPaged } from "@/lib/data/assets";
import AssetsTable from "@/components/AssetsTable";
import AssetFilters from "@/components/AssetFilters"; // ← make sure this import exists

export const dynamic = "force-dynamic";

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const session = await auth();
  if (!session) {
    return (
      <div className="card p-6">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p className="text-slate-300">Please sign in to access assets.</p>
        <Link className="btn-primary mt-4 inline-block" href="/login">
          Go to Login
        </Link>
      </div>
    );
  }

  // Parse query params
  const q = (searchParams.q as string) || undefined;
  const status = (searchParams.status as string) || "All";
  // Support only sortable columns allowed by getAssetsPaged
  const allowedSorts = ["createdAt", "name"];
  const sortParamRaw = (searchParams.sort as string) || "createdAt";
  const sortParam = allowedSorts.includes(sortParamRaw) ? (sortParamRaw as "createdAt" | "name") : "createdAt";
  const order = ((searchParams.order as string) || "desc") as "asc" | "desc";
  const page = Number(searchParams.page ?? 1) || 1;
  const pageSize = Number(searchParams.pageSize ?? 10) || 10;

  // Only pass allowed sort fields to getAssetsPaged
  const sortField: "createdAt" | "name" = sortParam;

  const { items, total } = await getAssetsPaged({
    createdByEmail: session.user?.email || undefined,
    q,
    status,
    sort: sortField,
    order,
    page,
    pageSize,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Assets</h1>
        <div className="flex gap-2">
          <Link href="/assets/new" className="btn-primary">New Asset</Link>
        </div>
      </div>

      {/* Filter bar with search + status + sort + order (auto-applies) */}
      <AssetFilters enableStatus />

      {/* Table + page-size selector + Prev/Next */}
      <AssetsTable rows={items} page={page} total={total} pageSize={pageSize} />
    </div>
  );
}