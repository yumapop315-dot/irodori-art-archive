"use client";

// ヘッダーは backdrop-blur を持つため、その中の position:fixed は
// ビューポートではなく「ヘッダーの矩形」を基準にしてしまう（CSSの仕様）。
// 全画面のオーバーレイはこれで body 直下に逃がすこと。
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export default function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}
