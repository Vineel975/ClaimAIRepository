"use client";

import { memo } from "react";
import { HoverCard } from "radix-ui";
import { AlertTriangle, Calculator, CheckCircle2, FileText, Lock, ServerCog, ShieldCheck, Table2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { pct } from "@/lib/format";
import type { DocId, ExtractedField } from "@/data/types";
import { SourcePreview } from "./SourcePreview";

const STATUS = {
  matched: { Icon: CheckCircle2, cls: "text-emerald-600", label: "Matched" },
  review: { Icon: AlertTriangle, cls: "text-amber-500", label: "Review required" },
  missing: { Icon: XCircle, cls: "text-red-600", label: "Missing" },
} as const;

const DOC_CHIP: Record<DocId, { Icon: typeof FileText; short: string }> = {
  bill: { Icon: FileText, short: "Bill" },
  tariff: { Icon: Table2, short: "Tariff" },
  policy: { Icon: ShieldCheck, short: "Policy" },
};

export function ConfidenceBadge({ value }: { value: number }) {
  const tone = value >= 0.93 ? "bg-emerald-50 text-emerald-700 ring-emerald-600/15" : value >= 0.85 ? "bg-sky-50 text-sky-700 ring-sky-600/15" : "bg-amber-50 text-amber-700 ring-amber-600/20";
  return (
    <span className={cn("rounded px-1.5 text-[10.5px] leading-[18px] font-semibold tabular-nums ring-1 ring-inset", tone)} title="AI extraction confidence">
      {pct(value)}
    </span>
  );
}

interface FieldRowProps {
  field: ExtractedField;
  selected: boolean;
  onSelect: (field: ExtractedField) => void;
  onHover: (field: ExtractedField | null) => void;
}

function FieldRowInner({ field, selected, onSelect, onHover }: FieldRowProps) {
  const st = STATUS[field.status];
  const src = field.source;
  const chip = src ? DOC_CHIP[src.doc] : null;
  const clickable = !!src;

  const row = (
    <div
      id={`field-${field.id}`}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-pressed={clickable ? selected : undefined}
      aria-label={clickable ? `${field.label}: ${field.value}. Show in document` : undefined}
      onClick={clickable ? () => onSelect(field) : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(field);
              }
            }
          : undefined
      }
      onMouseEnter={clickable ? () => onHover(field) : undefined}
      onMouseLeave={clickable ? () => onHover(null) : undefined}
      className={cn(
        "group grid scroll-mt-24 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 rounded-md px-3 py-2.5 transition-colors outline-none",
        clickable && "cursor-pointer hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#1e3a8a]/40",
        selected && "bg-amber-50/80 ring-1 ring-amber-300 hover:bg-amber-50",
      )}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <st.Icon className={cn("size-3.5 shrink-0", st.cls)} aria-label={st.label} />
          <span className="text-xs font-medium text-slate-500">{field.label}</span>
        </div>
        <p
          className={cn(
            "mt-0.5 pl-5 text-sm break-words text-slate-900",
            field.emphasis && "text-[15px] font-semibold tabular-nums",
            field.status === "missing" && "text-red-700",
          )}
        >
          {field.value}
          {field.masked && <Lock className="ml-1.5 inline size-3 -translate-y-px text-slate-400" aria-label="Masked for demo" />}
        </p>
        {field.detail && <p className="mt-0.5 pl-5 text-xs text-slate-500">{field.detail}</p>}
        {field.note && (field.status !== "matched" || selected) && (
          <p
            className={cn(
              "animate-fade-up mt-1.5 ml-5 rounded-md px-2 py-1 text-xs leading-snug",
              field.status === "review" && "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
              field.status === "missing" && "bg-red-50 text-red-700 ring-1 ring-red-200",
              field.status === "matched" && "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
            )}
          >
            {field.note}
          </p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1.5 pt-0.5">
        {field.confidence !== undefined ? (
          <ConfidenceBadge value={field.confidence} />
        ) : field.status === "missing" ? (
          <span className="rounded bg-red-50 px-1.5 text-[10.5px] leading-[18px] font-semibold text-red-700 ring-1 ring-red-600/15 ring-inset">Not found</span>
        ) : field.origin === "computed" ? (
          <span className="flex items-center gap-1 text-[10.5px] font-medium text-slate-500">
            <Calculator className="size-3" /> Computed
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10.5px] font-medium text-slate-500">
            <ServerCog className="size-3" /> System
          </span>
        )}
        {src && chip && (
          <span
            className={cn(
              "flex items-center gap-1 rounded border px-1.5 text-[10.5px] leading-[18px] font-medium tabular-nums transition-colors",
              selected ? "border-amber-300 bg-white text-amber-700" : "border-slate-200 bg-white text-slate-500 group-hover:border-[#1e3a8a]/30 group-hover:text-[#1e3a8a]",
            )}
          >
            <chip.Icon className="size-3" />
            {chip.short} p{src.page}
          </span>
        )}
      </div>
    </div>
  );

  if (!src) return row;
  return (
    <HoverCard.Root openDelay={450} closeDelay={80}>
      <HoverCard.Trigger asChild>{row}</HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          side="right"
          align="start"
          sideOffset={12}
          collisionPadding={12}
          className="animate-fade-up z-50 rounded-lg border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/10"
        >
          <p className="mb-2 text-xs font-semibold text-slate-700">Source · {field.label}</p>
          <SourcePreview source={src} />
          <p className="mt-2 text-[11px] text-slate-400">Click to open in the viewer</p>
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}

export const FieldRow = memo(FieldRowInner);
