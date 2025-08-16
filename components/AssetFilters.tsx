"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, useEffect } from "react";

type Props = {
  /** Show the Status filter dropdown (true by default) */
  enableStatus?: boolean;
  /** Placeholder for the search input */
  placeholder?: string;
};

// debounce helper for search box
function useDebounced<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function AssetFilters({
  enableStatus = true,
  placeholder = "Search name/serial/location/assigned...",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // read existing params; preserve sort/order (set via table headers)
  const status = sp.get("status") ?? "all";
  const qFromUrl = sp.get("q") ?? "";

  // local input state + debounced apply
  const [qLocal, setQLocal] = useState(qFromUrl);
  const qDebounced = useDebounced(qLocal, 400);

  // keep local in sync if URL changes (back/forward etc.)
  useEffect(() => {
    setQLocal(sp.get("q") ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp.get("q")]);

  const toUrl = useCallback(
    (next: Record<string, string | undefined>) => {
      const params = new URLSearchParams(sp?.toString() ?? "");

      for (const [k, v] of Object.entries(next)) {
        if (v === undefined || v === "") params.delete(k);
        else params.set(k, v);
      }

      // any filter change resets pagination
      params.set("page", "1");

      const nextHref = `${pathname}?${params.toString()}`;
      const currentHref = `${pathname}?${sp?.toString() ?? ""}`;
      if (nextHref !== currentHref) router.push(nextHref);
    },
    [router, pathname, sp]
  );

  // apply debounced search
  useEffect(() => {
    if ((sp.get("q") ?? "") !== qDebounced) {
      toUrl({ q: qDebounced || undefined });
    }
  }, [qDebounced, sp, toUrl]);

  const onChangeStatus = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (!enableStatus) return;
      const val = e.target.value;
      toUrl({ status: val === "all" ? undefined : val });
    },
    [enableStatus, toUrl]
  );


  const statusOptions = useMemo(
    () => ["all", "In Stock", "Assigned", "Repair", "Retired"],
    []
  );

  return (
    <div className="card p-4 mb-4 sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 items-center">
        {/* Search */}
        <div className="md:col-span-2">
          <label className="sr-only" htmlFor="asset-search">
            Search
          </label>
          <div className="relative">
            <input
              id="asset-search"
              type="search"
              inputMode="search"
              className="w-full pr-10"
              placeholder={placeholder}
              value={qLocal}
              onChange={(e) => setQLocal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setQLocal("");
              }}
            />
            {qLocal && (
              <button
                type="button"
                aria-label="Clear search"
                className="btn-ghost px-2 absolute right-1 top-1/2 -translate-y-1/2"
                onClick={() => setQLocal("")}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Status (optional) */}
        {enableStatus ? (
          <div>
            <label className="sr-only" htmlFor="status-filter">
              Status
            </label>
            <select
              id="status-filter"
              className="w-full"
              value={status}
              onChange={onChangeStatus}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "All" : s}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="hidden md:block" />
        )}

        {/* Spacer to keep layout similar where sort/order used to be */}
        <div className="hidden md:block" />
      </div>
    </div>
  );
}