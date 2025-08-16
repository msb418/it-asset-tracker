"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ConfirmDialog";

type Props = {
  id: string;
  name?: string;
  redirectTo?: string; // e.g. "/assets" (default)
  size?: "sm" | "md";
};

export default function DeleteAssetButton({ id, name, redirectTo = "/assets", size = "md" }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function doDelete() {
    setBusy(true);
    try {
      const res = await fetch(`/api/assets/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `Delete failed (${res.status})`);
      }
      // go back to list (or refresh if you stay on same page)
      router.push(redirectTo);
      router.refresh();
    } catch (e: any) {
      alert(e?.message || "Failed to delete asset.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className={size === "sm" ? "btn-danger btn-sm" : "btn-danger"}
        onClick={() => setOpen(true)}
        disabled={busy}
      >
        {busy ? "Deleting..." : "Delete"}
      </button>

      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Delete asset?"
        description={`This will permanently delete${name ? ` “${name}”` : " this asset"}. This action cannot be undone.`}
        confirmText={busy ? "Deleting..." : "Delete"}
        danger
        onConfirm={doDelete}
      />
    </>
  );
}