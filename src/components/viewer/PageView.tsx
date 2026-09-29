"use client";

import { memo, useLayoutEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Box, DocPage } from "@/data/types";
import { POLICY_PAGES } from "./PolicyDocument";
import type { PageRegion } from "./regions";

export interface ActiveMark {
  box: Box;
  label: string;
  key: number;
}

interface PageViewProps {
  kind: "image" | "html";
  index: number;
  page: DocPage;
  width: number;
  regions: (PageRegion & { box: Box })[];
  showRegions: boolean;
  active: ActiveMark | null;
  ghost: Box | null;
  onRegionClick: (fieldId: string) => void;
  onAnchors?: (index: number, anchors: Record<string, Box>) => void;
  pageRef?: (el: HTMLDivElement | null) => void;
}

const pctStyle = ([x0, y0, x1, y1]: Box) => ({
  left: `${x0 * 100}%`,
  top: `${y0 * 100}%`,
  width: `${(x1 - x0) * 100}%`,
  height: `${(y1 - y0) * 100}%`,
});

/** A policy page is live HTML laid out at A4 (794px) and scaled to the page width. */
function HtmlPage({ index, page, width, onAnchors }: { index: number; page: DocPage; width: number; onAnchors?: PageViewProps["onAnchors"] }) {
  const inner = useRef<HTMLDivElement>(null);
  const Content = POLICY_PAGES[index];
  useLayoutEffect(() => {
    const root = inner.current;
    if (!root || !onAnchors) return;
    const out: Record<string, Box> = {};
    root.querySelectorAll<HTMLElement>("[data-anchor]").forEach((el) => {
      // offset* are layout pixels in the unscaled 794px page, so they stay valid at every zoom.
      let x = 0, y = 0;
      let n: HTMLElement | null = el;
      while (n && n !== root) {
        x += n.offsetLeft;
        y += n.offsetTop;
        n = n.offsetParent as HTMLElement | null;
      }
      const pad = 6;
      out[el.dataset.anchor!] = [
        Math.max(0, (x - pad) / page.width),
        Math.max(0, (y - pad / 2) / page.height),
        Math.min(1, (x + el.offsetWidth + pad) / page.width),
        Math.min(1, (y + el.offsetHeight + pad / 2) / page.height),
      ];
    });
    onAnchors(index, out);
  }, [index, page.width, page.height, onAnchors]);
  return (
    <div
      ref={inner}
      className="absolute top-0 left-0 origin-top-left"
      style={{ width: page.width, height: page.height, transform: `scale(${width / page.width})` }}
    >
      <Content />
    </div>
  );
}

function PageViewInner({ kind, index, page, width, regions, showRegions, active, ghost, onRegionClick, onAnchors, pageRef }: PageViewProps) {
  const height = (width * page.height) / page.width;
  let body: ReactNode;
  if (kind === "image") {
    body = (
      <img
        src={page.src}
        alt={`${page.label ?? "Page"} (page ${index + 1})`}
        loading={index < 2 ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        className="absolute inset-0 h-full w-full select-none"
      />
    );
  } else {
    body = <HtmlPage index={index} page={page} width={width} onAnchors={onAnchors} />;
  }
  const tagBelow = active ? active.box[1] < 0.06 : false;

  return (
    <div
      ref={pageRef}
      data-page={index + 1}
      className="relative mx-auto overflow-hidden rounded-[3px] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_8px_24px_-6px_rgba(15,23,42,0.18)] ring-1 ring-slate-900/[0.07]"
      style={{ width, height }}
    >
      {kind === "image" && <div className="absolute inset-0 animate-pulse bg-slate-100" aria-hidden />}
      {body}

      {showRegions &&
        regions.map((r) => (
          <button
            key={r.key}
            type="button"
            title={r.labels.join(" · ")}
            onClick={() => onRegionClick(r.fieldIds[0])}
            className={cn(
              "absolute rounded-[3px] border border-dashed transition-colors",
              r.status === "matched" && "border-emerald-600/45 bg-emerald-500/[0.04] hover:bg-emerald-500/[0.12]",
              r.status === "review" && "border-amber-600/60 bg-amber-400/[0.06] hover:bg-amber-400/[0.16]",
              r.status === "missing" && "border-red-600/55 bg-red-500/[0.05] hover:bg-red-500/[0.12]",
            )}
            style={pctStyle(r.box)}
          >
            <span className="sr-only">{r.labels.join(", ")}</span>
          </button>
        ))}

      {ghost && (
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-[3px] border-2 border-dashed border-amber-500/80 bg-amber-300/15 transition-all"
          style={pctStyle(ghost)}
        />
      )}

      {active && (
        <div key={active.key} className="pointer-events-none absolute" style={pctStyle(active.box)}>
          <div className="animate-hl absolute inset-0 rounded-[4px] border-2 border-amber-600 bg-amber-300/25" />
          <span
            className={cn(
              "animate-fade-up absolute left-0 max-w-[260px] truncate rounded-md bg-amber-600 px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap text-white shadow-md",
              tagBelow ? "top-full mt-1.5" : "bottom-full mb-1.5",
            )}
          >
            {active.label}
          </span>
        </div>
      )}
    </div>
  );
}

export const PageView = memo(PageViewInner);
