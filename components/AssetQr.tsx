"use client";

import QRCode from "react-qr-code";
import { useMemo } from "react";

/**
 * Renders a QR code that links to /assets/:id on the current origin.
 * SVG output — crisp at any size.
 */
export default function AssetQr({
  id,
  size = 56,
  className,
  title = "Scan to open asset",
}: {
  id: string;
  size?: number;
  className?: string;
  title?: string;
}) {
  // Build a stable link to this asset
  const value = useMemo(() => {
    if (typeof window !== "undefined") return `${window.location.origin}/assets/${id}`;
    return `/assets/${id}`;
  }, [id]);

  return (
    <div className={className} title={title} aria-label={title}>
      <QRCode value={value} size={size} style={{ width: size, height: size }} />
    </div>
  );
}