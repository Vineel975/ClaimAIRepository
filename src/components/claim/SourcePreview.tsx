"use client";

import { useEffect, useState } from "react";
import { DOC_BY_ID } from "@/data/documents";
import type { SourceRef } from "@/data/types";

const W = 300;
const MAX_H = 170;

/** Human-readable location, e.g. "Hospital Bill · p3 · Claim form". */
export function sourceLabel(s: SourceRef) {
  const d = DOC_BY_ID[s.doc];
  const p = d.pages[s.page - 1];
  return `${d.label} · p${s.page}${p?.label ? ` · ${p.label}` : ""}`;
}

/**
 * A crop of the source page around the evidence, shown on hover. For scanned
 * pages it is a CSS crop of the page image; for the policy it quotes the clause.
 */
export function SourcePreview({ source }: { source: SourceRef }) {
  const doc = DOC_BY_ID[source.doc];
  const page = doc.pages[source.page - 1];
  const [quote, setQuote] = useState<string | null>(null);

  useEffect(() => {
    if (!source.anchor) return;
    const el = document.querySelector<HTMLElement>(`[data-anchor="${source.anchor}"]`);
    const text = el?.innerText.replace(/\s+/g, " ").trim() ?? "";
    setQuote(text.length > 320 ? text.slice(0, 317) + "…" : text);
  }, [source.anchor]);

  let body: React.ReactNode;
  if (source.box && doc.kind === "image") {
    const [x0, y0, x1, y1] = source.box;
    const m = 0.035;
    let cx0 = Math.max(0, x0 - m), cx1 = Math.min(1, x1 + m);
    let cy0 = Math.max(0, y0 - m * 0.6), cy1 = Math.min(1, y1 + m * 0.6);
    // Crop height in rendered px; if too tall, keep the top of the region.
    const scale = W / ((cx1 - cx0) * page.width);
    let h = (cy1 - cy0) * page.height * scale;
    if (h > MAX_H) {
      cy1 = cy0 + MAX_H / (page.height * scale);
      h = MAX_H;
    }
    if (h < 56) {
      // Very thin crop: widen vertically so the line has context.
      const extra = (56 - h) / (page.height * scale) / 2;
      cy0 = Math.max(0, cy0 - extra);
      cy1 = Math.min(1, cy1 + extra);
      h = (cy1 - cy0) * page.height * scale;
    }
    const cw = cx1 - cx0, ch = cy1 - cy0;
    body = (
      <div
        className="relative overflow-hidden rounded-md bg-white ring-1 ring-slate-200"
        style={{
          width: W,
          height: h,
          backgroundImage: `url(${page.src})`,
          backgroundSize: `${100 / cw}% auto`,
          backgroundPosition: `${cw >= 1 ? 0 : (cx0 / (1 - cw)) * 100}% ${ch >= 1 ? 0 : (cy0 / (1 - ch)) * 100}%`,
          backgroundRepeat: "no-repeat",
        }}
      >
        <div
          className="absolute rounded-[3px] border-2 border-amber-500 bg-amber-300/20"
          style={{
            left: `${((x0 - cx0) / cw) * 100}%`,
            top: `${((y0 - cy0) / ch) * 100}%`,
            width: `${((x1 - x0) / cw) * 100}%`,
            height: `${(Math.min(y1, cy1) - y0) / ch * 100}%`,
          }}
        />
      </div>
    );
  } else {
    body = (
      <blockquote className="w-[300px] rounded-md border-l-2 border-[#1e3a8a]/40 bg-slate-50 px-3 py-2 font-serif text-[12px] leading-relaxed text-slate-700">
        {quote ?? "Clause in policy wording"}
      </blockquote>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {body}
      <p className="text-[11px] font-medium text-slate-500">{sourceLabel(source)}</p>
    </div>
  );
}
