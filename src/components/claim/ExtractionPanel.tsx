"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { tabsListVariants } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { SECTIONS } from "@/data/claim";
import type { ExtractedField, SourceRef } from "@/data/types";
import { FieldRow } from "./FieldRow";
import { ExtractionSummary, StatusCard, ValidationSummary, type StatusFilter } from "./Overview";
import { ExtractionTimeline, ProcessingRemarks } from "./ExtractionTimeline";
import { PANEL, SECTION_TITLE } from "./tokens";

const NAV = [{ id: "overview", label: "Overview" }, ...SECTIONS.map((s) => ({ id: s.id, label: s.title.replace(" information", "") }))];

interface ExtractionPanelProps {
  selectedFieldId: string | null;
  onSelect: (field: ExtractedField) => void;
  onHover: (field: ExtractedField | null) => void;
  onShowSource: (label: string, source: SourceRef) => void;
  scrollRef: RefObject<HTMLDivElement | null>;
}

export function ExtractionPanel({ selectedFieldId, onSelect, onHover, onShowSource, scrollRef }: ExtractionPanelProps) {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [activeNav, setActiveNav] = useState("overview");
  const lock = useRef(0);

  // Scroll-spy: the section whose heading is nearest above the fold is active.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      if (Date.now() < lock.current) return;
      const top = el.getBoundingClientRect().top + 72;
      let current = "overview";
      for (const n of NAV) {
        const s = document.getElementById(`section-${n.id}`);
        if (s && s.getBoundingClientRect().top <= top) current = n.id;
      }
      setActiveNav(current);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollRef]);

  const goTo = (id: string) => {
    setActiveNav(id);
    lock.current = Date.now() + 700;
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 px-3 py-2 backdrop-blur">
        <div className={cn(tabsListVariants({ variant: "default" }), "grid w-full grid-cols-5")} role="tablist" aria-label="Claim sections">
          {NAV.map((n) => (
            <button
              key={n.id}
              type="button"
              role="tab"
              aria-selected={activeNav === n.id}
              onClick={() => goTo(n.id)}
              className={cn(
                "inline-flex h-[calc(100%-1px)] items-center justify-center rounded-md border border-transparent px-1.5 text-[13px] font-medium whitespace-nowrap text-foreground/60 transition-all hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
                activeNav === n.id && "bg-background text-foreground shadow-sm",
              )}
            >
              {n.label}
            </button>
          ))}
        </div>
      </div>

      <div ref={scrollRef} className="scrollbar-thin flex-1 overflow-y-auto scroll-smooth px-3 pt-3 pb-10">
        <section id="section-overview" className="scroll-mt-16 space-y-3">
          <StatusCard />
          <div className="grid gap-3 xl:grid-cols-2">
            <ExtractionSummary />
            <ValidationSummary filter={filter} onFilter={setFilter} />
          </div>
        </section>

        {SECTIONS.map((section) => {
          const fields = filter === "all" ? section.fields : section.fields.filter((f) => f.status === filter);
          const flagged = section.fields.filter((f) => f.status !== "matched").length;
          return (
            <section key={section.id} id={`section-${section.id}`} className="mt-6 scroll-mt-16" aria-labelledby={`h-${section.id}`}>
              <div className="mb-2 flex items-center justify-between px-1">
                <h2 id={`h-${section.id}`} className={SECTION_TITLE}>
                  {section.title}
                </h2>
                <span className="text-xs text-slate-500 tabular-nums">
                  {section.fields.length} fields
                  {flagged > 0 && <span className="ml-1.5 rounded-full bg-amber-50 px-1.5 py-0.5 font-medium text-amber-700 ring-1 ring-amber-200">{flagged} flagged</span>}
                </span>
              </div>
              <div className={cn(PANEL, "divide-y divide-slate-100 p-1")}>
                {fields.length ? (
                  fields.map((f) => <FieldRow key={f.id} field={f} selected={selectedFieldId === f.id} onSelect={onSelect} onHover={onHover} />)
                ) : (
                  <p className="px-3 py-4 text-sm text-slate-500">No {filter} fields in this section.</p>
                )}
              </div>
            </section>
          );
        })}

        <section className="mt-6 space-y-3">
          <ProcessingRemarks />
          <ExtractionTimeline onShow={onShowSource} />
        </section>
      </div>
    </div>
  );
}
