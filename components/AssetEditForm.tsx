// components/AssetEditForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Initial = {
  id: string;
  name: string;
  type: string;
  status: string;
  serialNumber: string;
  description: string;
  notes: string;
  purchaseDate: string;   // yyyy-mm-dd
  warrantyExpiry: string; // yyyy-mm-dd
  location: string;
  assignedTo: string;
};

export default function AssetEditForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Initial>(initial);

  function set<K extends keyof Initial>(k: K, v: Initial[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const payload = { ...form, assetType: form.type };
      delete (payload as any).type;

      const res = await fetch(`/api/assets/${initial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data?.error ?? "Failed to save asset");
        return;
      }
      router.push(`/assets/${initial.id}`);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm mb-1">Name</label>
        <input
          className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g., HP-4723327"
          required
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Type</label>
        <select
          className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2"
          value={form.type}
          onChange={(e) => set("type", e.target.value)}
        >
          <option>Laptop</option>
          <option>Desktop</option>
          <option>Phone</option>
          <option>Tablet</option>
          <option>Server</option>
          <option>Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm mb-1">Serial Number</label>
        <input
          className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2"
          value={form.serialNumber}
          onChange={(e) => set("serialNumber", e.target.value)}
          placeholder="ABC123..."
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Status</label>
        <select
          className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2"
          value={form.status}
          onChange={(e) => set("status", e.target.value)}
        >
          <option>In Stock</option>
          <option>Assigned</option>
          <option>Repair</option>
          <option>Retired</option>
          <option>Lost</option>
        </select>
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm mb-1">Description</label>
        <textarea
          className="w-full min-h-[96px] rounded-md bg-slate-800 border border-slate-700 px-3 py-2"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Brief description of the asset"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm mb-1">Notes</label>
        <textarea
          className="w-full min-h-[96px] rounded-md bg-slate-800 border border-slate-700 px-3 py-2"
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Any extra info (condition, accessories, license keys, etc.)"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Purchase Date</label>
        <input
          type="date"
          className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2"
          value={form.purchaseDate}
          onChange={(e) => set("purchaseDate", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Warranty Expiry</label>
        <input
          type="date"
          className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2"
          value={form.warrantyExpiry}
          onChange={(e) => set("warrantyExpiry", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Location</label>
        <input
          className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2"
          value={form.location}
          onChange={(e) => set("location", e.target.value)}
          placeholder="e.g., Finance Dept"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Assigned To</label>
        <input
          className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2"
          value={form.assignedTo}
          onChange={(e) => set("assignedTo", e.target.value)}
          placeholder="Person or team"
        />
      </div>

      <div className="md:col-span-2 flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="btn-primary px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>

        <button
          type="button"
          onClick={() => history.back()}
          className="btn-ghost px-4 py-2 rounded-md bg-slate-700/60 hover:bg-slate-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}