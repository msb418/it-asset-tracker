// components/AssetsTable.tsx
"use client";

import Link from "next/link";
import { useMemo, useState, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ConfirmDialog from "./ConfirmDialog";
import AssetQr from "./AssetQr"; // <-- render QR locally

type Row = {
  _id: string;
  name: string;
  type?: string;
  assetType?: string;
  serialNumber?: string;
  status: string;
  assignedTo?: string;
  createdAt?: string | Date;
};

type Props = {
  rows: Row[];
  page: number;
  total: number;
  pageSize: number;
};

function StatusBadge({ s }: { s: string }) {
  const cls: Record<string, string> = {
    "In Stock": "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20",
    Assigned: "bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/20",
    Repair: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/20",
    Retired: "bg-slate-500/15 text-slate-300 ring-1 ring-slate-500/20",
  };
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs ${cls[s] ?? "bg-slate-500/15 text-slate-300 ring-1 ring-white/10"}`}>
      {s}
    </span>
  );
}

// helper: pull the QR that's already rendered in the row (canvas/img/svg -> data URL)
function getQrDataUrlFromRow(rowId: string): string {
  const host = document.getElementById(`qr-${rowId}`);
  if (!host) return "";

  // Prefer canvas (sharpest for what AssetQr renders)
  const canvas = host.querySelector("canvas") as HTMLCanvasElement | null;
  if (canvas) {
    try {
      return canvas.toDataURL("image/png");
    } catch {}
  }

  // Fallback: <img src=...>
  const img = host.querySelector("img") as HTMLImageElement | null;
  if (img?.src) return img.src;

  // Fallback: inline <svg>
  const svg = host.querySelector("svg") as SVGElement | null;
  if (svg) {
    const xml = new XMLSerializer().serializeToString(svg);
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
  }

  return "";
}

export default function AssetsTable({ rows, page, total, pageSize }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const selectedIds = useMemo(
    () => rows.filter((r) => checked[r._id]).map((r) => r._id),
    [rows, checked]
  );
  const allChecked = useMemo(
    () => rows.length > 0 && rows.every((r) => checked[r._id]),
    [rows, checked]
  );

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState<"single" | "bulk">("single");
  const [confirmSingleId, setConfirmSingleId] = useState<string | null>(null);

  // --- Header click sorting helpers ---
  // IMPORTANT: Use UI keys here ("type" not "assetType")
  const currentSort = (searchParams.get("sort") ?? "created") as "created" | "name" | "type" | "status";
  const currentOrder = (searchParams.get("order") ?? "desc") as "asc" | "desc";

  // Preferred order for status sorting
  const STATUS_ORDER = ["In Stock", "Assigned", "Repair", "Retired"] as const;

  // When server-side sort doesn't apply status correctly, ensure correct order client-side
  const displayRows = useMemo(() => {
    if (currentSort !== "status") return rows;
    const dir = currentOrder === "asc" ? 1 : -1;
    const idx = (s: string) => {
      const i = STATUS_ORDER.indexOf(s as any);
      return i === -1 ? 99 : i;
    };
    return [...rows].sort((a, b) => {
      const primary = (idx(a.status) - idx(b.status)) * dir;
      if (primary !== 0) return primary;
      // Tie-break by name asc so results are stable
      return a.name.localeCompare(b.name) * (dir === 1 ? 1 : -1);
    });
  }, [rows, currentSort, currentOrder]);

  const setSort = (col: "created" | "name" | "type" | "status") => {
    const params = new URLSearchParams(searchParams ?? "");
    const nextOrder =
      currentSort === col
        ? (currentOrder === "asc" ? "desc" : "asc")
        : col === "created"
        ? "desc"
        : "asc";
    params.set("sort", col);
    params.set("order", nextOrder);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const sortIcon = (col: string) => {
    if (currentSort !== col) return "↕";
    return currentOrder === "asc" ? "▲" : "▼";
  };

  const toggleAll = () => {
    if (allChecked) {
      setChecked({});
    } else {
      const next: Record<string, boolean> = {};
      (currentSort === "status" ? displayRows : rows).forEach((r) => (next[r._id] = true));
      setChecked(next);
    }
  };
  const toggleOne = (id: string) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const fmtDate = (v?: string | Date) => {
    if (!v) return "–";
    const d = typeof v === "string" ? new Date(v) : v;
    if (isNaN(d.getTime())) return "–";
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(d);
  };

  const resolveType = (r: Row) => r.type ?? r.assetType ?? "Unknown";

  // Open a reliable print window that embeds the already-rendered QR as a data URL
  const openPrintWindow = useCallback((row: Row) => {
    const type = resolveType(row);
    const name = row.name ?? "";
    const sn = row.serialNumber ?? "";

    // Grab the QR from the existing table cell
    const qrDataUrl =
      getQrDataUrlFromRow(row._id) ||
      // 1×1 transparent pixel fallback
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";

    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

    const html = `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <title>Print Label - ${esc(name)}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <style>
      :root { color-scheme: light; }
      @page { margin: 8mm; }
      html, body { height: 100%; }
      body {
        margin: 0;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji;
        background: #f8fafc;
        color: #0f172a;
        display: grid;
        place-items: center;
      }
      .wrap { padding: 16px; }
      .label {
        width: 3.5in; height: 2in;
        display: flex; align-items: center; gap: 12px;
        border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px;
        box-sizing: border-box; background: #ffffff; color: #111827;
        box-shadow: 0 10px 25px rgba(0,0,0,.08);
      }
      .qr img { width: 80px; height: 80px; display:block; }
      .meta { min-width: 0; }
      .name { font-weight: 700; font-size: 14px; line-height: 1.2; margin: 0 0 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .line { font-size: 12px; margin: 1px 0; }
      .id { font-size: 10px; color: #64748b; margin-top: 4px; }
      .controls { display:flex; gap:8px; justify-content:center; margin-top: 16px; }
      .btn {
        appearance: none; border: 1px solid #cbd5e1; background:#fff;
        padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 14px;
      }
      .btn:hover { background:#f1f5f9; }
      .btn-primary { background:#111827; color:#fff; border-color:#111827; }
      .btn-primary:hover { background:#0b1220; }
      @media print { .controls { display: none !important; } body { background:#fff; } }
    </style>
  </head>
  <body>
    <main class="wrap">
      <section class="label">
        <div class="qr"><img src="${qrDataUrl}" alt="QR"/></div>
        <div class="meta">
          <div class="name">${esc(name)}</div>
          <div class="line">Type: ${esc(type)}</div>
          ${sn ? `<div class="line">SN: ${esc(sn)}</div>` : ""}
          <div class="id">ID: ${esc(String(row._id))}</div>
        </div>
      </section>
      <div class="controls">
        <button class="btn btn-primary" onclick="window.print()">Print</button>
        <button class="btn" onclick="window.close()">Close</button>
      </div>
    </main>
    <script>
      // focus the window so keyboard shortcuts work
      window.focus();
    </script>
  </body>
  </html>`;

    // Use a Blob URL instead of document.write to avoid blank popups
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "width=520,height=420");
  }, []);

  // Build one label HTML chunk (reused by bulk printer)
  function buildLabelChunk(row: Row, qrDataUrl: string) {
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    const type = (row.type ?? row.assetType ?? "Unknown");
    const name = row.name ?? "";
    const sn = row.serialNumber ?? "";

    return `
      <section class="page">
        <div class="label">
          <div class="qr"><img src="${qrDataUrl}" alt="QR"/></div>
          <div class="meta">
            <div class="name">${esc(name)}</div>
            <div class="line">Type: ${esc(type)}</div>
            ${sn ? `<div class="line">SN: ${esc(sn)}</div>` : ""}
            <div class="id">ID: ${esc(String(row._id))}</div>
          </div>
        </div>
      </section>
    `;
  }

  // Open one window that contains labels for all selected rows
  const openBulkPrintWindow = useCallback((rowsToPrint: Row[]) => {
    if (!rowsToPrint.length) return;

    const parts: string[] = [];
    for (const r of rowsToPrint) {
      const qrDataUrl =
        getQrDataUrlFromRow(r._id) ||
        // 1×1 transparent pixel fallback
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";
      parts.push(buildLabelChunk(r, qrDataUrl));
    }

    const html = `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <title>Print Labels</title>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <style>
      :root { color-scheme: light; }
      @page { margin: 8mm; }
      body { margin:0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji; background:#fff; color:#111827; }
      .toolbar { position: sticky; top:0; background:#fff; border-bottom:1px solid #e5e7eb; padding:8px 12px; display:flex; gap:8px; }
      .toolbar button { padding:6px 10px; border:1px solid #d1d5db; border-radius:6px; background:#f9fafb; cursor:pointer; }
      .wrap { padding:12px; }
      .page { page-break-after: always; }
      .page:last-child { page-break-after: auto; }
      .label {
        width: 3.5in; height: 2in;
        display: flex; align-items: center; gap: 12px;
        border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px;
        box-sizing: border-box;
      }
      .qr img { width: 80px; height: 80px; display:block; }
      .meta { min-width: 0; }
      .name { font-weight: 700; font-size: 14px; line-height: 1.2; margin: 0 0 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .line { font-size: 12px; margin: 1px 0; }
      .id { font-size: 10px; color: #6b7280; margin-top: 4px; }
      @media print { .toolbar { display: none !important; } }
    </style>
  </head>
  <body>
    <div class="toolbar">
      <button onclick="window.print()">Print</button>
      <button onclick="window.close()">Close</button>
    </div>
    <div class="wrap">
      ${parts.join("\n")}
    </div>
  </body>
  </html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "width=640,height=720");
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const goPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams ?? "");
    params.set("page", String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  async function doDelete() {
    try {
      if (confirmMode === "single" && confirmSingleId) {
        const res = await fetch(`/api/assets/${confirmSingleId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("single delete failed");
      } else if (confirmMode === "bulk") {
        if (selectedIds.length === 0) return;
        const res = await fetch("/api/assets/bulk", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedIds }),
        });
        if (!res.ok) throw new Error("bulk delete failed");
      }
      setConfirmOpen(false);
      setConfirmSingleId(null);
      setChecked({});
      router.refresh();
    } catch {
      alert("Failed to delete assets.");
      setConfirmOpen(false);
      setConfirmSingleId(null);
    }
  }

  return (
    <div className="rounded-xl bg-slate-900/40 ring-1 ring-white/10 p-4">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur text-left text-slate-300">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={allChecked}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-4 py-3">
                <button className="inline-flex items-center gap-1" onClick={() => setSort("name")} aria-label="Sort by name">
                  Name <span className="opacity-70">{sortIcon("name")}</span>
                </button>
              </th>
              <th className="px-4 py-3">
                <button className="inline-flex items-center gap-1" onClick={() => setSort("type")} aria-label="Sort by type">
                  Type <span className="opacity-70">{sortIcon("type")}</span>
                </button>
              </th>
              <th className="px-4 py-3">Serial</th>
              <th className="px-4 py-3">QR</th>
              <th className="px-4 py-3">
                <button className="inline-flex items-center gap-1" onClick={() => setSort("created")} aria-label="Sort by created">
                  Created <span className="opacity-70">{sortIcon("created")}</span>
                </button>
              </th>
              <th className="px-4 py-3">
                <button className="inline-flex items-center gap-1" onClick={() => setSort("status")} aria-label="Sort by status">
                  Status <span className="opacity-70">{sortIcon("status")}</span>
                </button>
              </th>
              <th className="px-4 py-3">Assigned</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-100">
            {displayRows.map((r) => (
              <tr key={r._id} className="group hover:bg-slate-800/40">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label={`Select ${r.name}`}
                    checked={!!checked[r._id]}
                    onChange={() => toggleOne(r._id)}
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{r.name}</td>
                <td className="px-4 py-3 whitespace-nowrap">{resolveType(r)}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {r.serialNumber || "–"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div
                    id={`qr-${r._id}`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded bg-white"
                  >
                    <button
                      type="button"
                      aria-label="Print label"
                      className="h-full w-full inline-flex items-center justify-center"
                      onClick={() => openPrintWindow(r)}
                      title="Print label"
                    >
                      <AssetQr id={r._id} size={40} />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{fmtDate(r.createdAt)}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <StatusBadge s={r.status} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {r.assignedTo || "–"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2 opacity-100 group-hover:opacity-100 md:opacity-0 transition-opacity">
                    <Link href={`/assets/${r._id}`} className="btn btn-ghost" aria-label={`View ${r.name}`}>
                      View
                    </Link>
                    <Link
                      href={`/assets/${r._id}/edit`}
                      className="btn btn-ghost"
                      aria-label={`Edit ${r.name}`}
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="btn btn-danger"
                      aria-label={`Delete ${r.name}`}
                      onClick={() => {
                        setConfirmMode("single");
                        setConfirmSingleId(r._id);
                        setConfirmOpen(true);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-slate-400">
                  No assets found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <button
            type="button"
            className="btn btn-danger disabled:opacity-50"
            disabled={selectedIds.length === 0}
            onClick={() => {
              setConfirmMode("bulk");
              setConfirmSingleId(null);
              setConfirmOpen(true);
            }}
          >
            Delete selected
          </button>
          <button
            type="button"
            className="btn btn-ghost ml-2 disabled:opacity-50"
            disabled={selectedIds.length === 0}
            onClick={() => {
              const rowsToPrint = rows.filter(r => selectedIds.includes(r._id));
              openBulkPrintWindow(rowsToPrint);
            }}
          >
            Print selected
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="btn btn-ghost"
            disabled={page <= 1}
            onClick={() => goPage(page - 1)}
          >
            Prev
          </button>
          <span className="text-slate-300">
            Page {page} of {Math.max(1, Math.ceil(total / pageSize))}
          </span>
          <button
            className="btn btn-ghost"
            disabled={page >= Math.max(1, Math.ceil(total / pageSize))}
            onClick={() => goPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={confirmMode === "single" ? "Delete asset?" : "Delete selected assets?"}
        description={
          confirmMode === "single"
            ? "This will permanently delete this asset. This action cannot be undone."
            : "This will permanently delete the selected assets. This action cannot be undone."
        }
        confirmText="Delete"
        danger
        onConfirm={() => { doDelete(); }}
      />
    </div>
  );
}