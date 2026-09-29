"use client";

import { cn } from "@/lib/utils";
import type { Box, DocumentSpec } from "@/data/types";
import { POLICY_PAGES } from "./PolicyDocument";
import type { PaneViewport } from "./DocPane";

const THUMB_W = 76;

interface MinimapProps {
  doc: DocumentSpec;
  viewport: PaneViewport | null;
  currentPage: number;
  sourceCounts: Record<number, number>;
  mark: { page: number; box: Box } | null;
  onJump: (page: number) => void;
}

/**
 * Page strip beside the viewer. Each thumbnail shows which part of the page is on
 * screen, how many extracted fields came from it, and where the active highlight is.
 */
export function Minimap({ doc, viewport, currentPage, sourceCounts, mark, onJump }: MinimapProps) {
  return (
    <nav aria-label={`${doc.label} pages`} className="scrollbar-thin flex h-full w-[104px] shrink-0 flex-col items-center gap-3 overflow-y-auto border-l border-slate-200 bg-white/80 px-3 py-4">
      {doc.pages.map((p, i) => {
        const n = i + 1;
        const h = (THUMB_W * p.height) / p.width;
        const vp = viewport?.pages[i];
        let visible: [number, number] | null = null;
        if (viewport && vp && vp.height > 0) {
          const a = Math.max(0, (viewport.scrollTop - vp.top) / vp.height);
          const b = Math.min(1, (viewport.scrollTop + viewport.height - vp.top) / vp.height);
          if (b > a) visible = [a, b];
        }
        const Policy = doc.kind === "html" ? POLICY_PAGES[i] : null;
        const count = sourceCounts[n] ?? 0;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onJump(n)}
            aria-label={`Go to page ${n}`}
            aria-current={currentPage === n ? "page" : undefined}
            className="group flex flex-col items-center gap-1 focus-visible:outline-none"
          >
            <div
              className={cn(
                "relative overflow-hidden rounded-[3px] bg-white shadow-sm ring-1 transition-all",
                currentPage === n ? "ring-2 ring-[#1e3a8a]" : "ring-slate-200 group-hover:ring-slate-400",
                "group-focus-visible:ring-2 group-focus-visible:ring-[#1e3a8a]/60",
              )}
              style={{ width: THUMB_W, height: h }}
            >
              {Policy ? (
                <div className="pointer-events-none absolute top-0 left-0 origin-top-left" style={{ width: p.width, height: p.height, transform: `scale(${THUMB_W / p.width})` }}>
                  <Policy />
                </div>
              ) : (
                <img src={p.thumb} alt="" loading="lazy" className="absolute inset-0 h-full w-full" draggable={false} />
              )}
              {visible && (
                <div
                  className="absolute inset-x-0 border-y border-[#1e3a8a]/50 bg-[#1e3a8a]/[0.08]"
                  style={{ top: `${visible[0] * 100}%`, height: `${(visible[1] - visible[0]) * 100}%` }}
                />
              )}
              {mark && mark.page === n && (
                <div
                  className="absolute rounded-[1px] bg-amber-400/70 ring-1 ring-amber-600"
                  style={{
                    left: `${mark.box[0] * 100}%`,
                    top: `${mark.box[1] * 100}%`,
                    width: `${Math.max(0.08, mark.box[2] - mark.box[0]) * 100}%`,
                    height: `${Math.max(0.02, mark.box[3] - mark.box[1]) * 100}%`,
                  }}
                />
              )}
              {count > 0 && (
                <span className="absolute top-1 right-1 rounded-full bg-[#1e3a8a] px-1.5 text-[9px] leading-[15px] font-semibold text-white tabular-nums shadow-sm" title={`${count} extracted field${count === 1 ? "" : "s"}`}>
                  {count}
                </span>
              )}
            </div>
            <span className={cn("text-[10px] tabular-nums", currentPage === n ? "font-semibold text-[#1e3a8a]" : "text-slate-500")}>{n}</span>
          </button>
        );
      })}
    </nav>
  );
}
