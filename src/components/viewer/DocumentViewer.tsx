"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Maximize2,
  MoveHorizontal,
  PanelRight,
  RotateCcw,
  ScanSearch,
  ShieldCheck,
  Table2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { DOCUMENTS, DOC_BY_ID } from "@/data/documents";
import { ALL_FIELDS } from "@/data/claim";
import type { Box, DocId, SourceRef } from "@/data/types";
import type { HighlightRequest } from "@/data/highlight";
import { DocPane, type DocPaneHandle, type PaneViewport } from "./DocPane";
import { Minimap } from "./Minimap";

const ZOOM_STEPS = [0.5, 0.67, 0.8, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];
const DOC_ICON: Record<DocId, typeof FileText> = { bill: FileText, tariff: Table2, policy: ShieldCheck };

interface DocumentViewerProps {
  activeDoc: DocId;
  onDocChange: (doc: DocId) => void;
  highlight: HighlightRequest | null;
  ghost: SourceRef | null;
  onRegionClick: (fieldId: string) => void;
}

function ToolButton({ label, onClick, disabled, pressed, children }: { label: string; onClick: () => void; disabled?: boolean; pressed?: boolean; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          aria-pressed={pressed}
          className={cn("text-slate-600 hover:text-slate-900", pressed && "bg-[#1e3a8a]/10 text-[#1e3a8a] hover:bg-[#1e3a8a]/15 hover:text-[#1e3a8a]")}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}

export function DocumentViewer({ activeDoc, onDocChange, highlight, ghost, onRegionClick }: DocumentViewerProps) {
  const [zooms, setZooms] = useState<Record<DocId, number>>({ bill: 1, tariff: 1, policy: 1 });
  const [pages, setPages] = useState<Record<DocId, number>>({ bill: 1, tariff: 1, policy: 1 });
  const [viewports, setViewports] = useState<Record<DocId, PaneViewport | null>>({ bill: null, tariff: null, policy: null });
  const [policyAnchors, setPolicyAnchors] = useState<Record<string, { page: number; box: Box }>>({});
  const [showRegions, setShowRegions] = useState(true);
  const [showMinimap, setShowMinimap] = useState(true);
  const [pageInput, setPageInput] = useState<string | null>(null);
  const panes = useRef<Partial<Record<DocId, DocPaneHandle | null>>>({});

  const doc = DOC_BY_ID[activeDoc];
  const zoom = zooms[activeDoc];
  const page = pages[activeDoc];

  const setZoom = (z: number) => setZooms((s) => ({ ...s, [activeDoc]: Math.min(3, Math.max(0.25, +z.toFixed(3))) }));
  const stepZoom = (dir: 1 | -1) => {
    const next = dir > 0 ? ZOOM_STEPS.find((s) => s > zoom + 0.001) : [...ZOOM_STEPS].reverse().find((s) => s < zoom - 0.001);
    if (next) setZoom(next);
  };
  const jump = (n: number) => panes.current[activeDoc]?.scrollToPage(Math.min(doc.pages.length, Math.max(1, n)));

  // Stable per-document callbacks so DocPane's effects don't churn.
  const pageSetters = useMemo(
    () =>
      Object.fromEntries(
        DOCUMENTS.map((d) => [d.id, (p: number) => setPages((s) => (s[d.id] === p ? s : { ...s, [d.id]: p }))]),
      ) as Record<DocId, (p: number) => void>,
    [],
  );
  const viewportSetters = useMemo(
    () => Object.fromEntries(DOCUMENTS.map((d) => [d.id, (vp: PaneViewport) => setViewports((s) => ({ ...s, [d.id]: vp }))])) as Record<DocId, (vp: PaneViewport) => void>,
    [],
  );
  const onPolicyAnchors = useCallback((a: Record<string, { page: number; box: Box }>) => setPolicyAnchors(a), []);

  const sourceCounts = useMemo(() => {
    const out: Record<number, number> = {};
    for (const f of ALL_FIELDS) if (f.source?.doc === activeDoc) out[f.source.page] = (out[f.source.page] ?? 0) + 1;
    return out;
  }, [activeDoc]);

  const mark = useMemo(() => {
    if (!highlight || highlight.source.doc !== activeDoc) return null;
    const box = highlight.source.box ?? (highlight.source.anchor ? policyAnchors[highlight.source.anchor]?.box : undefined);
    return box ? { page: highlight.source.page, box } : null;
  }, [highlight, activeDoc, policyAnchors]);

  const fieldCountByDoc = useMemo(() => {
    const out: Record<DocId, number> = { bill: 0, tariff: 0, policy: 0 };
    for (const f of ALL_FIELDS) if (f.source) out[f.source.doc] += 1;
    return out;
  }, []);

  return (
    <TooltipProvider delayDuration={300}>
      <section className="flex h-full min-h-0 flex-col bg-white" aria-label="Source documents">
        {/* Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-slate-200 px-4 pt-3 pb-2.5">
          <Tabs value={activeDoc} onValueChange={(v) => onDocChange(v as DocId)} className="min-w-0">
            <TabsList className="h-10 gap-0.5 p-1">
              {DOCUMENTS.map((d) => {
                const Icon = DOC_ICON[d.id];
                const hasMark = highlight?.source.doc === d.id;
                return (
                  <TabsTrigger key={d.id} value={d.id} className="h-8 gap-2 px-3 text-[13px] data-[state=active]:text-[#1e3a8a]">
                    <Icon aria-hidden />
                    {d.label}
                    <span className="rounded-full bg-slate-900/[0.06] px-1.5 text-[10.5px] leading-[18px] font-semibold text-slate-500 tabular-nums">
                      {d.pages.length}
                    </span>
                    {hasMark && <span className="absolute top-1 right-1 size-1.5 rounded-full bg-amber-500" aria-label="Has active highlight" />}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
          <p className="truncate text-xs text-slate-500">
            {doc.caption} · <span className="tabular-nums">{fieldCountByDoc[activeDoc]}</span> fields sourced
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50/70 px-3 py-1.5">
          <div className="flex items-center gap-1">
            <ToolButton label="Previous page" onClick={() => jump(page - 1)} disabled={page <= 1}>
              <ChevronLeft />
            </ToolButton>
            <label className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="sr-only">Page</span>
              <input
                id={`page-input-${activeDoc}`}
                inputMode="numeric"
                value={pageInput ?? String(page)}
                onFocus={(e) => {
                  setPageInput(String(page));
                  e.currentTarget.select();
                }}
                onChange={(e) => setPageInput(e.target.value.replace(/\D/g, ""))}
                onBlur={() => setPageInput(null)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    jump(parseInt(pageInput ?? "", 10) || page);
                    e.currentTarget.blur();
                  }
                }}
                className="h-7 w-9 rounded-md border border-slate-200 bg-white text-center text-xs font-medium text-slate-900 tabular-nums focus:border-[#1e3a8a]/50 focus:ring-2 focus:ring-[#1e3a8a]/15 focus:outline-none"
                aria-label="Page number"
              />
              <span className="tabular-nums">/ {doc.pages.length}</span>
            </label>
            <ToolButton label="Next page" onClick={() => jump(page + 1)} disabled={page >= doc.pages.length}>
              <ChevronRight />
            </ToolButton>
            <span className="ml-2 hidden truncate text-xs text-slate-500 xl:inline">{doc.pages[page - 1]?.label}</span>
          </div>

          <div className="flex items-center gap-0.5">
            <ToolButton label="Zoom out" onClick={() => stepZoom(-1)} disabled={zoom <= ZOOM_STEPS[0]}>
              <ZoomOut />
            </ToolButton>
            <span className="w-12 text-center text-xs font-medium text-slate-700 tabular-nums" aria-live="polite">
              {Math.round(zoom * 100)}%
            </span>
            <ToolButton label="Zoom in" onClick={() => stepZoom(1)} disabled={zoom >= ZOOM_STEPS[ZOOM_STEPS.length - 1]}>
              <ZoomIn />
            </ToolButton>
            <div className="mx-1 h-5 w-px bg-slate-200" />
            <ToolButton label="Fit width" onClick={() => setZoom(1)} pressed={zoom === 1}>
              <MoveHorizontal />
            </ToolButton>
            <ToolButton label="Fit page" onClick={() => setZoom(panes.current[activeDoc]?.fitPageZoom() ?? 1)}>
              <Maximize2 />
            </ToolButton>
            <ToolButton
              label="Reset zoom"
              onClick={() => {
                setZoom(1);
                jump(1);
              }}
            >
              <RotateCcw />
            </ToolButton>
            <div className="mx-1 h-5 w-px bg-slate-200" />
            <ToolButton label={showRegions ? "Hide extracted regions" : "Show extracted regions"} onClick={() => setShowRegions((v) => !v)} pressed={showRegions}>
              <ScanSearch />
            </ToolButton>
            <ToolButton label={showMinimap ? "Hide page map" : "Show page map"} onClick={() => setShowMinimap((v) => !v)} pressed={showMinimap}>
              <PanelRight />
            </ToolButton>
          </div>
        </div>

        {/* Panes + minimap */}
        <div className="flex min-h-0 flex-1">
          <div className="relative min-w-0 flex-1">
            {DOCUMENTS.map((d) => (
              <DocPane
                key={d.id}
                ref={(h) => {
                  panes.current[d.id] = h;
                }}
                doc={d}
                active={d.id === activeDoc}
                zoom={zooms[d.id]}
                showRegions={showRegions}
                highlight={highlight?.source.doc === d.id ? highlight : null}
                ghost={ghost?.doc === d.id ? ghost : null}
                onPageChange={pageSetters[d.id]}
                onViewport={viewportSetters[d.id]}
                onRegionClick={onRegionClick}
                onAnchorsReady={d.kind === "html" ? onPolicyAnchors : undefined}
              />
            ))}
          </div>
          {showMinimap && (
            <div className="hidden h-full sm:block">
              <Minimap doc={doc} viewport={viewports[activeDoc]} currentPage={page} sourceCounts={sourceCounts} mark={mark} onJump={jump} />
            </div>
          )}
        </div>
      </section>
    </TooltipProvider>
  );
}
