"use client";

import { Check, CircleDot, FileStack, Gauge, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { inr } from "@/lib/format";
import { ALL_FIELDS, CLAIM } from "@/data/claim";
import type { FieldStatus } from "@/data/types";
import { PANEL, SUBHEAD } from "./tokens";

const STAGES = ["Intake", "Extraction", "Validation", "Review", "Settlement"];
const CURRENT_STAGE = 3;

/** Claim processing status: where the claim is and what the engine recommends. */
export function StatusCard() {
  return (
    <div className={cn(PANEL, "overflow-hidden")}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-emerald-50/80 via-white to-white px-4 py-3.5">
        <div>
          <p className="text-xs font-medium text-emerald-700">AI recommendation</p>
          <p className="mt-0.5 text-lg font-bold tracking-tight text-slate-900">
            Approve <span className="tabular-nums">{inr(CLAIM.approved)}</span>
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Claimed <span className="tabular-nums">{inr(CLAIM.claimed)}</span> · deduction{" "}
            <span className="tabular-nums">{inr(CLAIM.claimed - CLAIM.approved)}</span> above PPN package
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
          <span className="size-1.5 rounded-full bg-amber-500" />
          Awaiting adjudicator
        </span>
      </div>
      <ol className="flex items-center gap-1 px-4 py-3" aria-label="Claim processing stages">
        {STAGES.map((s, i) => {
          const done = i < CURRENT_STAGE;
          const current = i === CURRENT_STAGE;
          return (
            <li key={s} className="flex min-w-0 flex-1 items-center gap-1.5" aria-current={current ? "step" : undefined}>
              <span
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-bold",
                  done && "bg-[#1e3a8a] text-white",
                  current && "bg-white text-[#1e3a8a] ring-2 ring-[#1e3a8a]",
                  !done && !current && "bg-slate-100 text-slate-400",
                )}
              >
                {done ? <Check className="size-3" strokeWidth={3} /> : current ? <CircleDot className="size-3" /> : i + 1}
              </span>
              <span className={cn("truncate text-[11px] font-medium", done || current ? "text-slate-700" : "text-slate-400", !current && "max-sm:hidden")}>{s}</span>
              {i < STAGES.length - 1 && <span className={cn("h-px min-w-2 flex-1", done ? "bg-[#1e3a8a]/40" : "bg-slate-200")} />}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Ring({ value }: { value: number }) {
  const r = 20, c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 48 48" className="size-12 -rotate-90" aria-hidden>
      <circle cx="24" cy="24" r={r} fill="none" stroke="#e2e8f0" strokeWidth="5" />
      <circle cx="24" cy="24" r={r} fill="none" stroke="#059669" strokeWidth="5" strokeLinecap="round" strokeDasharray={`${c * value} ${c}`} />
    </svg>
  );
}

export function ExtractionSummary() {
  const withConf = ALL_FIELDS.filter((f) => f.confidence !== undefined);
  const avg = withConf.reduce((a, f) => a + (f.confidence ?? 0), 0) / withConf.length;
  return (
    <div className={cn(PANEL, "p-4")}>
      <h3 className={SUBHEAD}>Extraction summary</h3>
      <div className="mt-3 flex items-center gap-3">
        <div className="relative">
          <Ring value={avg} />
          <span className="absolute inset-0 grid place-items-center text-[11px] font-bold text-slate-900 tabular-nums">{Math.round(avg * 100)}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">AI confidence {Math.round(avg * 100)}%</p>
          <p className="text-xs text-slate-500">Average across {withConf.length} extracted fields</p>
        </div>
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-xs">
        <div>
          <dt className="flex items-center gap-1 text-slate-500">
            <FileStack className="size-3" /> Documents
          </dt>
          <dd className="mt-0.5 font-semibold text-slate-900 tabular-nums">3 · 18 pages</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1 text-slate-500">
            <Timer className="size-3" /> Processing
          </dt>
          <dd className="mt-0.5 font-semibold text-slate-900 tabular-nums">{CLAIM.processingSeconds}s</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1 text-slate-500">
            <Gauge className="size-3" /> Status
          </dt>
          <dd className="mt-0.5 flex items-center gap-1 font-semibold text-emerald-700">
            <Check className="size-3" strokeWidth={3} /> Complete
          </dd>
        </div>
      </dl>
    </div>
  );
}

export type StatusFilter = "all" | FieldStatus;

const FILTERS: { id: StatusFilter; label: string; dot: string; ring: string }[] = [
  { id: "matched", label: "Matched", dot: "bg-emerald-500", ring: "ring-emerald-300 bg-emerald-50" },
  { id: "review", label: "Review", dot: "bg-amber-400", ring: "ring-amber-300 bg-amber-50" },
  { id: "missing", label: "Missing", dot: "bg-red-500", ring: "ring-red-300 bg-red-50" },
];

export function ValidationSummary({ filter, onFilter }: { filter: StatusFilter; onFilter: (f: StatusFilter) => void }) {
  const counts = { matched: 0, review: 0, missing: 0 };
  for (const f of ALL_FIELDS) counts[f.status] += 1;
  const total = ALL_FIELDS.length;
  return (
    <div className={cn(PANEL, "p-4")}>
      <div className="flex items-baseline justify-between">
        <h3 className={SUBHEAD}>AI validation</h3>
        <button type="button" onClick={() => onFilter("all")} className={cn("text-xs font-medium", filter === "all" ? "text-slate-400" : "text-[#1e3a8a] hover:underline")} disabled={filter === "all"}>
          Show all {total}
        </button>
      </div>
      <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden>
        <span className="bg-emerald-500" style={{ width: `${(counts.matched / total) * 100}%` }} />
        <span className="bg-amber-400" style={{ width: `${(counts.review / total) * 100}%` }} />
        <span className="bg-red-500" style={{ width: `${(counts.missing / total) * 100}%` }} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2" role="group" aria-label="Filter fields by validation status">
        {FILTERS.map((f) => {
          const on = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={on}
              onClick={() => onFilter(on ? "all" : f.id)}
              className={cn(
                "rounded-md px-2.5 py-2 text-left ring-1 transition-colors focus-visible:ring-2 focus-visible:ring-[#1e3a8a]/40 focus-visible:outline-none",
                on ? f.ring : "ring-slate-200 hover:bg-slate-50",
              )}
            >
              <span className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className={cn("size-2 rounded-full", f.dot)} />
                {f.label}
              </span>
              <span className="mt-0.5 block text-lg font-bold text-slate-900 tabular-nums">{counts[f.id as FieldStatus]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
