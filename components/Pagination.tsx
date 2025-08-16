"use client";

import { useState } from "react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ConfirmDialog";

type Row = {
  _id: string;
  name: string;
  assetType?: string;
  serialNumber?: string;
  status?: string;
  assignedTo?: string;
};

type PaginationProps = {
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

function Pagination({ page, total, pageSize, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null; // hide when only one page

  return (
    <div className="flex justify-center items-center mt-4 gap-4">
      <button
        className="btn-ghost px-4 py-2"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        Prev
      </button>
      <span className="text-slate-300">Page {page} of {totalPages}</span>
      <button
        className="btn-ghost px-4 py-2"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next
      </button>
    </div>
  );
}

export default function AssetsTable({
  rows,
  page,
  total,
  pageSize,
}: {
  rows: Row[];
  page: number;
  total: number;
  pageSize: number;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function toggle(id: string, checked: boolean) {
    setSelected((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  }
  function toggleAll(checked: boolean) {
    setSelected(checked ? rows.map((r) => r._id) : []);
  }

  async function bulkDelete() {
    try {
      const res = await fetch("/api/assets/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selected, action: "delete" }),
      });
      if (!res.ok) throw new Error();
      toast.success("Moved to Trash");
      setSelected([]);
      location.reload();
    } catch {
      toast.error("Failed to delete");
    }
  }

  const allChecked = selected.length > 0 && selected.length === rows.length;

  return (
    <div className="card p-4 overflow-auto">
      <div className="flex items-center justify-between pb-3">
        <div className="text-sm text-slate-300">
          {selected.length > 0 ? `${selected.length} selected` : `${rows.length} total`}
        </div>
        <div className="flex gap-2">
          <button
            disabled={selected.length === 0}
            onClick={() => setConfirmOpen(true)}
            className="btn-ghost disabled:opacity-50"
          >
            Delete selected
          </button>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={allChecked}
                onChange={(e) => toggleAll(e.target.checked)}
              />
            </th>
            <th>Name</th>
            <th>Type</th>
            <th>Serial</th>
            <th>Status</th>
            <th>Assigned</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => {
            const checked = selected.includes(a._id);
            return (
              <tr key={a._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => toggle(a._id, e.target.checked)}
                  />
                </td>
                <td>{a.name}</td>
                <td>{a.assetType || "-"}</td>
                <td>{a.serialNumber || "-"}</td>
                <td>{a.status || "-"}</td>
                <td>{a.assignedTo || "-"}</td>
                <td className="text-right">
                  <a href={`/assets/${a._id}`} className="btn-ghost mr-2">
                    View
                  </a>
                  <a href={`/assets/${a._id}/edit`} className="btn-ghost">
                    Edit
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Entries-per-page selector (centered under table) */}
      <div className="flex justify-center mt-4">
        <label className="sr-only" htmlFor="pageSizeSelect">Entries per page</label>
        <select
          id="pageSizeSelect"
          className="w-auto"
          value={String(pageSize)}
          onChange={(e) => {
            const params = new URLSearchParams(window.location.search);
            params.set("pageSize", e.target.value);
            params.set("page", "1"); // reset to first page
            window.location.search = params.toString();
          }}
        >
          <option value="10">10 / page</option>
          <option value="25">25 / page</option>
          <option value="50">50 / page</option>
        </select>
      </div>

      {/* Prev/Next centered under selector; auto-disabled; hidden if only 1 page */}
      <Pagination
        page={page}
        total={total}
        pageSize={pageSize}
        onPageChange={(newPage) => {
          const params = new URLSearchParams(window.location.search);
          params.set("page", String(newPage));
          window.location.search = params.toString();
        }}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={bulkDelete}
        title="Delete selected assets?"
        description="They will move to Trash and can be restored later."
        confirmText="Move to Trash"
        danger
      />
    </div>
  );
}