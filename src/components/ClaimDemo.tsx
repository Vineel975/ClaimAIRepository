"use client";

import { useCallback, useRef, useState, type CSSProperties } from "react";
import { GripVertical } from "lucide-react";
import { ALL_FIELDS } from "@/data/claim";
import type { DocId, ExtractedField, SourceRef } from "@/data/types";
import type { HighlightRequest } from "@/data/highlight";
import { AppHeader, ClaimHeader } from "./claim/Headers";
import { ExtractionPanel } from "./claim/ExtractionPanel";
import { DocumentViewer } from "./viewer/DocumentViewer";

/**
 * Claim AI demo screen: extracted fields on the left, source documents on the
 * right, linked both ways. Clicking a field opens its document, scrolls to the
 * evidence and highlights it; clicking an outlined region on a page selects the
 * field it produced.
 */
export function ClaimDemo() {
  const [activeDoc, setActiveDoc] = useState<DocId>("bill");
  const [highlight, setHighlight] = useState<HighlightRequest | null>(null);
  const [ghost, setGhost] = useState<SourceRef | null>(null);
  const [leftPct, setLeftPct] = useState(40);
  const leftScroll = useRef<HTMLDivElement>(null);
  const layout = useRef<HTMLDivElement>(null);

  const show = useCallback((fieldId: string | null, label: string, source: SourceRef, value?: string) => {
    setActiveDoc(source.doc);
    setGhost(null);
    setHighlight({ fieldId, label, value, source, key: Date.now() });
  }, []);

  const onSelect = useCallback((f: ExtractedField) => f.source && show(f.id, f.label, f.source, f.value), [show]);
  const onHover = useCallback((f: ExtractedField | null) => setGhost(f?.source ?? null), []);

  const onRegionClick = useCallback(
    (fieldId: string) => {
      const f = ALL_FIELDS.find((x) => x.id === fieldId);
      if (!f?.source) return;
      show(f.id, f.label, f.source, f.value);
      document.getElementById(`field-${f.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    },
    [show],
  );

  const startDrag = (e: React.PointerEvent) => {
    const box = layout.current?.getBoundingClientRect();
    if (!box) return;
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => setLeftPct(Math.min(60, Math.max(28, ((ev.clientX - box.left) / box.width) * 100)));
    const up = () => {
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointerup", up);
    };
    target.addEventListener("pointermove", move);
    target.addEventListener("pointerup", up);
  };

  return (
    <div className="flex h-dvh min-h-[640px] flex-col bg-white text-slate-900">
      <AppHeader />
      <ClaimHeader />
      <main
        ref={layout}
        className="flex min-h-0 flex-1 flex-col max-lg:overflow-y-auto lg:flex-row"
        style={{ "--left": `${leftPct}%` } as CSSProperties}
      >
        <aside className="h-[70vh] min-h-0 min-w-0 shrink-0 border-slate-200/80 bg-gradient-to-b from-slate-50 to-white max-lg:border-b lg:h-auto lg:w-[var(--left)]" aria-label="Extracted claim fields">
          <ExtractionPanel
            selectedFieldId={highlight?.fieldId ?? null}
            onSelect={onSelect}
            onHover={onHover}
            onShowSource={(label, source) => show(null, label, source)}
            scrollRef={leftScroll}
          />
        </aside>
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize panels"
          aria-valuenow={Math.round(leftPct)}
          aria-valuemin={28}
          aria-valuemax={60}
          tabIndex={0}
          onPointerDown={startDrag}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setLeftPct((p) => Math.max(28, p - 2));
            if (e.key === "ArrowRight") setLeftPct((p) => Math.min(60, p + 2));
          }}
          className="group relative hidden w-px shrink-0 cursor-col-resize bg-slate-200 focus-visible:bg-[#1e3a8a] focus-visible:outline-none lg:block"
        >
          <span className="absolute inset-y-0 -left-1.5 w-3" />
          <span className="absolute top-1/2 left-1/2 grid h-7 w-3.5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-sm border border-slate-200 bg-white text-slate-400 shadow-sm group-hover:text-slate-700">
            <GripVertical className="size-3" />
          </span>
        </div>
        <div className="h-[85vh] min-h-0 min-w-0 flex-1 lg:h-auto">
          <DocumentViewer activeDoc={activeDoc} onDocChange={setActiveDoc} highlight={highlight} ghost={ghost} onRegionClick={onRegionClick} />
        </div>
      </main>
    </div>
  );
}
