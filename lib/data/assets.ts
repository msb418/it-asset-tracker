import "server-only";
import { dbConnect } from "@/lib/mongoose";
import Asset from "@/models/Asset";

/** App-facing DTO (plain JSON) */
export type AssetDTO = {
  type: any;
  _id: string;
  name: string;
  description?: string;
  serialNumber?: string;
  assetType: string;
  purchaseDate?: string | null;
  warrantyExpiry?: string | null;
  status: string;
  location?: string;
  assignedTo?: string;
  createdByEmail?: string;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

function toDTO(doc: any): AssetDTO {
  return {
    type: doc.type ?? undefined,
    _id: doc._id.toString(),
    name: doc.name,
    description: doc.description ?? undefined,
    serialNumber: doc.serialNumber ?? undefined,
    assetType: doc.assetType ?? "Laptop",
    purchaseDate: doc.purchaseDate ? new Date(doc.purchaseDate).toISOString() : null,
    warrantyExpiry: doc.warrantyExpiry ? new Date(doc.warrantyExpiry).toISOString() : null,
    status: doc.status ?? "In Stock",
    location: doc.location ?? undefined,
    assignedTo: doc.assignedTo ?? undefined,
    createdByEmail: doc.createdByEmail ?? undefined,
    deletedAt: doc.deletedAt ? new Date(doc.deletedAt).toISOString() : null,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : undefined,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : undefined,
  };
}

export type ListOptions = {
  createdByEmail?: string;
  /** Free text across name, serial, location, assignedTo */
  q?: string;
  /** e.g., In Stock | Assigned | Repair | Retired */
  status?: string;
  /** name|createdAt */
  sort?: "name" | "createdAt";
  /** asc|desc */
  order?: "asc" | "desc";
  page?: number;       // 1-based
  pageSize?: number;   // default 10
};

export type PagedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

function buildSearch(q?: string) {
  if (!q) return {};
  const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  return {
    $or: [
      { name: rx },
      { serialNumber: rx },
      { location: rx },
      { assignedTo: rx },
      { assetType: rx },
      { status: rx },
    ],
  };
}

function sortSpec(
  sort: ListOptions["sort"],
  order: ListOptions["order"],
): Record<string, 1 | -1> {
  // Use literal numeric types so Mongoose typings accept the sort spec
  const dir: 1 | -1 = order === "asc" ? 1 : -1;
  if (sort === "name") {
    return { name: dir, _id: 1 };
  }
  // default sort by createdAt
  return { createdAt: dir, _id: 1 };
}

export async function getAssetsPaged(opts: ListOptions): Promise<PagedResult<AssetDTO>> {
  await dbConnect();

  const page = Math.max(1, opts.page || 1);
  const pageSize = Math.min(100, Math.max(1, opts.pageSize || 10));

  const base: any = { deletedAt: null };
  if (opts.createdByEmail) base.createdByEmail = opts.createdByEmail;
  if (opts.status && opts.status !== "All") base.status = opts.status;
  const query = { ...base, ...buildSearch(opts.q) };

  const [items, total] = await Promise.all([
    Asset.find(query)
      .sort(sortSpec(opts.sort, opts.order))
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    Asset.countDocuments(query),
  ]);

  return { items: items.map(toDTO), total, page, pageSize };
}

export async function getTrashPaged(opts: ListOptions): Promise<PagedResult<AssetDTO>> {
  await dbConnect();

  const page = Math.max(1, opts.page || 1);
  const pageSize = Math.min(100, Math.max(1, opts.pageSize || 10));

  const base: any = { deletedAt: { $ne: null } };
  if (opts.createdByEmail) base.createdByEmail = opts.createdByEmail;
  const query = { ...base, ...buildSearch(opts.q) };

  const [items, total] = await Promise.all([
    Asset.find(query)
      .sort(sortSpec(opts.sort, opts.order))
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    Asset.countDocuments(query),
  ]);

  return { items: items.map(toDTO), total, page, pageSize };
}

export async function getAssetById(id: string, createdByEmail?: string): Promise<AssetDTO | null> {
  await dbConnect();
  const q: any = { _id: id, deletedAt: null };
  if (createdByEmail) q.createdByEmail = createdByEmail;
  const doc = await Asset.findOne(q).lean();
  return doc ? toDTO(doc) : null;
}