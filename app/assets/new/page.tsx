"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewAssetPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;

    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") || "").trim(),
      assetType: String(form.get("assetType") || "Laptop"),
      status: String(form.get("status") || "In Stock"),
      serialNumber: String(form.get("serialNumber") || "").trim(),
      description: String(form.get("description") || "").trim() || undefined,
      notes: String(form.get("notes") || "").trim() || undefined,
      purchaseDate: String(form.get("purchaseDate") || "").trim() || undefined,
      warrantyExpiry: String(form.get("warrantyExpiry") || "").trim() || undefined,
      location: String(form.get("location") || "").trim() || undefined,
      assignedTo: String(form.get("assignedTo") || "").trim() || undefined,
    };

    try {
      setSaving(true);
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        alert(txt || "Failed to create asset");
        return;
      }
      router.push("/assets");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to create asset");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">New Asset</h1>

      <form onSubmit={onSubmit} className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="flex flex-col">
            <label htmlFor="name" className="label">Name</label>
            <input id="name" name="name" className="input" required placeholder="e.g., HP-4723327" />
          </div>

          {/* Type */}
          <div className="flex flex-col">
            <label htmlFor="assetType" className="label">Type</label>
            <select id="assetType" name="assetType" className="input default:cursor-pointer">
              <option>Laptop</option>
              <option>Desktop</option>
              <option>Server</option>
              <option>Monitor</option>
              <option>Phone</option>
              <option>Tablet</option>
              <option>Accessory</option>
            </select>
          </div>

          {/* Serial Number */}
          <div className="flex flex-col">
            <label htmlFor="serialNumber" className="label">Serial Number</label>
            <input id="serialNumber" name="serialNumber" className="input" placeholder="ABC123..." />
          </div>

          {/* Status */}
          <div className="flex flex-col">
            <label htmlFor="status" className="label">Status</label>
            <select id="status" name="status" className="input default:cursor-pointer">
              <option>In Stock</option>
              <option>Assigned</option>
              <option>In Repair</option>
              <option>Retired</option>
            </select>
          </div>

          {/* Description */}
          <div className="flex flex-col md:col-span-2">
            <label htmlFor="description" className="label">Description</label>
            <textarea id="description" name="description" className="input" rows={3} placeholder="Brief description of the asset" />
          </div>

          {/* Notes (NEW) */}
          <div className="flex flex-col md:col-span-2">
            <label htmlFor="notes" className="label">Notes</label>
            <textarea
              id="notes"
              name="notes"
              className="input"
              rows={3}
              placeholder="Any extra info (condition, accessories, license keys, etc.)"
            />
          </div>

          {/* Purchase Date */}
          <div className="flex flex-col">
            <label htmlFor="purchaseDate" className="label">Purchase Date</label>
            <input id="purchaseDate" name="purchaseDate" type="date" className="input" />
          </div>

          {/* Warranty Expiry */}
          <div className="flex flex-col">
            <label htmlFor="warrantyExpiry" className="label">Warranty Expiry</label>
            <input id="warrantyExpiry" name="warrantyExpiry" type="date" className="input" />
          </div>

          {/* Location */}
          <div className="flex flex-col">
            <label htmlFor="location" className="label">Location</label>
            <input id="location" name="location" className="input" placeholder="e.g., Finance Dept" />
          </div>

          {/* Assigned To */}
          <div className="flex flex-col">
            <label htmlFor="assignedTo" className="label">Assigned To</label>
            <input id="assignedTo" name="assignedTo" className="input" placeholder="Person or team" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Create"}
          </button>
          <a href="/assets" className="btn-ghost">Cancel</a>
        </div>
      </form>
    </div>
  );
}