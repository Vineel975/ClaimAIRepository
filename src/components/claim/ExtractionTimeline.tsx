"use client";

import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { PROCESSING_REMARKS, TIMELINE } from "@/data/claim";
import type { SourceRef } from "@/data/types";
import { PANEL, SUBHEAD } from "./tokens";

export function ExtractionTimeline({ onShow }: { onShow: (label: string, source: SourceRef) => void }) {
  return (
    <div className={cn(PANEL, "p-4")}>
      <h3 className={SUBHEAD}>Extraction timeline</h3>
      <ol className="mt-3">
        {TIMELINE.map((s, i) => {
          const last = i === TIMELINE.length - 1;
          return (
            <li key={s.title} className="relative flex gap-3 pb-3.5 last:pb-0">
              {!last && <span className="absolute top-5 bottom-0 left-[9px] w-px bg-slate-200" aria-hidden />}
              <span className={cn("relative z-10 grid size-5 shrink-0 place-items-center rounded-full", last ? "bg-emerald-600 text-white" : "bg-[#1e3a8a] text-white")}>
                <Check className="size-3" strokeWidth={3} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-slate-900">{s.title}</p>
                  <span className="shrink-0 font-mono text-[11px] text-slate-400 tabular-nums">{s.at}</span>
                </div>
                <p className="text-xs text-slate-500">{s.detail}</p>
                {s.source && (
                  <button type="button" onClick={() => onShow(s.title, s.source!)} className="mt-1 text-xs font-medium text-[#1e3a8a] hover:underline">
                    Show in document
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function ProcessingRemarks() {
  return (
    <div className={cn(PANEL, "p-4")}>
      <h3 className={cn(SUBHEAD, "flex items-center gap-1.5")}>
        <Sparkles className="size-3.5 text-[#1e3a8a]" /> Processing remarks
      </h3>
      <ul className="mt-2.5 space-y-2">
        {PROCESSING_REMARKS.map((r) => (
          <li key={r} className="flex gap-2 text-sm leading-snug text-slate-700">
            <span className="mt-[7px] size-1 shrink-0 rounded-full bg-slate-400" />
            {r}
          </li>
        ))}
      </ul>
    </div>
  );
}
