"use client";

import { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, type Ref } from "react";
import { cn } from "@/lib/utils";
import type { Box, DocumentSpec, SourceRef } from "@/data/types";
import type { HighlightRequest } from "@/data/highlight";
import { useElementSize } from "@/hooks/useElementSize";
import { PageView, type ActiveMark } from "./PageView";
import { regionsFor } from "./regions";

export const PAGE_PAD = 28;
export const PAGE_GAP = 22;

export interface PaneViewport {
  scrollTop: number;
  height: number;
  pages: { top: number; height: number }[];
}

export interface DocPaneHandle {
  scrollToPage: (page: number) => void;
  fitPageZoom: () => number;
}

interface DocPaneProps {
  ref?: Ref<DocPaneHandle>;
  doc: DocumentSpec;
  active: boolean;
  zoom: number;
  showRegions: boolean;
  highlight: HighlightRequest | null;
  ghost: SourceRef | null;
  onPageChange: (page: number) => void;
  onViewport: (vp: PaneViewport) => void;
  onRegionClick: (fieldId: string) => void;
  onAnchorsReady?: (anchors: Record<string, { page: number; box: Box }>) => void;
}

/**
 * One document's scroll surface. Every document stays mounted (inactive ones are
 * hidden, not removed) so zoom and scroll position survive tab switches and a
 * highlight can be measured before its tab becomes visible.
 */
export function DocPane({ ref, doc, active, zoom, showRegions, highlight, ghost, onPageChange, onViewport, onRegionClick, onAnchorsReady }: DocPaneProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const pageEls = useRef<(HTMLDivElement | null)[]>([]);
  const { width: cw, height: ch } = useElementSize(scroller);
  const [anchors, setAnchors] = useState<Record<string, { page: number; box: Box }>>({});

  const baseWidth = Math.max(240, cw - PAGE_PAD * 2);
  const pageWidth = Math.round(baseWidth * zoom);

  const regions = useMemo(() => regionsFor(doc.id), [doc.id]);

  const resolveBox = useCallback(
    (s: SourceRef | null | undefined): Box | null => {
      if (!s || s.doc !== doc.id) return null;
      if (s.box) return s.box;
      if (s.anchor && anchors[s.anchor]) return anchors[s.anchor].box;
      return null;
    },
    [doc.id, anchors],
  );

  const handleAnchors = useCallback((index: number, found: Record<string, Box>) => {
    setAnchors((prev) => {
      const next = { ...prev };
      for (const [k, box] of Object.entries(found)) next[k] = { page: index + 1, box };
      return next;
    });
  }, []);

  useEffect(() => {
    if (onAnchorsReady && Object.keys(anchors).length) onAnchorsReady(anchors);
  }, [anchors, onAnchorsReady]);

  // ---- viewport reporting (current page + minimap) --------------------------------
  const report = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const pages = pageEls.current.map((p) => ({ top: p?.offsetTop ?? 0, height: p?.offsetHeight ?? 0 }));
    onViewport({ scrollTop: el.scrollTop, height: el.clientHeight, pages });
    const probe = el.scrollTop + el.clientHeight * 0.35;
    let current = 1;
    pages.forEach((p, i) => {
      if (p.top <= probe) current = i + 1;
    });
    onPageChange(current);
  }, [onPageChange, onViewport]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          report();
        });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [report]);

  // ---- keep the reading position when zoom or panel width changes ------------------
  const lastRatio = useRef({ y: 0, x: 0.5 });
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const save = () => {
      lastRatio.current = {
        y: (el.scrollTop + el.clientHeight / 2) / Math.max(1, el.scrollHeight),
        x: (el.scrollLeft + el.clientWidth / 2) / Math.max(1, el.scrollWidth),
      };
    };
    el.addEventListener("scroll", save, { passive: true });
    return () => el.removeEventListener("scroll", save);
  }, []);
  const focusBox = useRef<{ page: number; box: Box } | null>(null);
  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const f = focusBox.current;
    const pageEl = f ? pageEls.current[f.page - 1] : null;
    if (f && pageEl) {
      // A highlight is showing: keep it centred through the zoom change.
      const [x0, y0, x1, y1] = f.box;
      el.scrollTop = pageEl.offsetTop + ((y0 + y1) / 2) * pageEl.offsetHeight - el.clientHeight / 2;
      el.scrollLeft = pageEl.offsetLeft + ((x0 + x1) / 2) * pageEl.offsetWidth - el.clientWidth / 2;
    } else if (lastRatio.current.y) {
      el.scrollTop = lastRatio.current.y * el.scrollHeight - el.clientHeight / 2;
      el.scrollLeft = lastRatio.current.x * el.scrollWidth - el.clientWidth / 2;
    }
    report();
  }, [pageWidth, report]);

  // ---- scroll the highlight into view ----------------------------------------------
  const handled = useRef<number>(-1);
  const activeBox = resolveBox(highlight?.source);
  focusBox.current = highlight && activeBox ? { page: highlight.source.page, box: activeBox } : null;
  useEffect(() => {
    if (!highlight || !active || !activeBox || handled.current === highlight.key || cw === 0) return;
    const el = scroller.current;
    const pageEl = pageEls.current[highlight.source.page - 1];
    if (!el || !pageEl) return;
    handled.current = highlight.key;
    const [x0, y0, x1, y1] = activeBox;
    const boxTop = pageEl.offsetTop + y0 * pageEl.offsetHeight;
    const boxH = (y1 - y0) * pageEl.offsetHeight;
    const boxLeft = pageEl.offsetLeft + x0 * pageEl.offsetWidth;
    const boxW = (x1 - x0) * pageEl.offsetWidth;
    const top = boxH > el.clientHeight * 0.7 ? boxTop - 48 : boxTop - (el.clientHeight - boxH) * 0.42;
    const left = el.scrollWidth > el.clientWidth ? boxLeft - (el.clientWidth - boxW) / 2 : 0;
    el.scrollTo({ top: Math.max(0, top), left: Math.max(0, left), behavior: "smooth" });
  }, [highlight, active, activeBox, cw]);

  useImperativeHandle(
    ref,
    () => ({
      scrollToPage: (page: number) => {
        const el = scroller.current;
        const pageEl = pageEls.current[page - 1];
        if (el && pageEl) el.scrollTo({ top: pageEl.offsetTop - PAGE_PAD / 2, behavior: "smooth" });
      },
      fitPageZoom: () => {
        const page = doc.pages[0];
        const fitH = (ch - PAGE_PAD * 2) * (page.width / page.height);
        return Math.max(0.25, Math.min(1, fitH / baseWidth));
      },
    }),
    [doc.pages, ch, baseWidth],
  );

  const ghostBox = resolveBox(ghost);

  return (
    <div
      ref={scroller}
      className={cn(
        "scrollbar-thin absolute inset-0 overflow-auto bg-[linear-gradient(180deg,#eef1f6,#e7ebf2)] transition-opacity duration-200",
        active ? "visible opacity-100" : "invisible opacity-0",
      )}
      aria-hidden={!active}
      inert={!active}
    >
      <div className="flex min-w-full flex-col items-center" style={{ padding: PAGE_PAD, gap: PAGE_GAP, width: pageWidth + PAGE_PAD * 2 }}>
        {doc.pages.map((page, i) => {
          const pageRegions = regions
            .filter((r) => r.source.page === i + 1)
            .map((r) => ({ ...r, box: resolveBox(r.source) }))
            .filter((r): r is typeof r & { box: Box } => !!r.box);
          const mark: ActiveMark | null =
            highlight && activeBox && highlight.source.page === i + 1
              ? { box: activeBox, label: highlight.value ? `${highlight.label} · ${highlight.value}` : highlight.label, key: highlight.key }
              : null;
          const ghostHere = ghost && ghost.page === i + 1 && !(mark && ghost === highlight?.source) ? ghostBox : null;
          return (
            <div key={i} className="flex flex-col items-center gap-2">
              <PageView
                kind={doc.kind}
                index={i}
                page={page}
                width={pageWidth}
                regions={pageRegions}
                showRegions={showRegions}
                active={mark}
                ghost={ghostHere}
                onRegionClick={onRegionClick}
                onAnchors={doc.kind === "html" ? handleAnchors : undefined}
                pageRef={(el) => {
                  pageEls.current[i] = el;
                }}
              />
              <p className="text-[11px] font-medium text-slate-500 tabular-nums">
                Page {i + 1} of {doc.pages.length}
                {page.label ? <span className="text-slate-400"> · {page.label}</span> : null}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
