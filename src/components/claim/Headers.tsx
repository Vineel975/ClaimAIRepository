import { Building2, CalendarDays, Lock, Stethoscope, UserRound } from "lucide-react";
import { inr } from "@/lib/format";
import { CLAIM } from "@/data/claim";

/** Top bar, following the Claim AI navbar: mark, product line, signed-in user. */
export function AppHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
      <div className="flex items-center gap-3">
        {/* 113×96 source shown at 32px tall: 3× density, stays sharp on retina screens. */}
        <img src="zapsight-logo.png" alt="" width={38} height={32} className="h-8 w-auto select-none" draggable={false} />
        <div className="flex items-baseline gap-3">
          <span className="text-[17px] font-bold tracking-tight text-slate-900">Zapsight</span>
          <span className="hidden text-sm tracking-wide text-gray-500 sm:inline">AUTOMATED CLAIM ADJUDICATION</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 md:inline-flex">
          <Lock className="size-3" /> Demo · patient identifiers masked
        </span>
        <div className="flex flex-col items-end leading-tight">
          <span className="text-[11px] text-gray-500">SIGNED IN</span>
          <span className="text-sm font-semibold text-[#1E3A8A]">demo.adjudicator</span>
        </div>
      </div>
    </header>
  );
}

function Meta({ icon: Icon, label, value }: { icon: typeof UserRound; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Icon className="size-4 shrink-0 text-slate-400" aria-hidden />
      <div className="min-w-0 leading-tight">
        <p className="text-[11px] text-slate-500">{label}</p>
        <p className="truncate text-sm font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}

/** Claim summary strip: identity of the claim and the three amounts that matter. */
export function ClaimHeader() {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-x-8 gap-y-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 py-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="font-mono text-[15px] font-semibold tracking-tight text-slate-900">{CLAIM.claimNo}</h1>
          <span className="rounded bg-[#1e3a8a]/10 px-1.5 py-0.5 text-[11px] font-semibold text-[#1e3a8a]">{CLAIM.claimType}</span>
        </div>
        <p className="mt-0.5 text-xs text-slate-500">
          {CLAIM.lineOfBusiness} · received {CLAIM.receivedAt}
        </p>
      </div>
      <div className="grid min-w-0 basis-full grid-cols-2 gap-x-6 gap-y-2 md:basis-0 md:flex-1 md:grid-cols-4">
        <Meta icon={UserRound} label="Patient" value={CLAIM.patient} />
        <Meta icon={Building2} label="Hospital" value="Susrut Eye Foundation" />
        <Meta icon={Stethoscope} label="Procedure" value="LE phaco + IOL" />
        <Meta icon={CalendarDays} label="Admission" value={CLAIM.admission} />
      </div>
      <dl className="flex items-center gap-5">
        {[
          ["Claimed", CLAIM.claimed, "text-slate-900"],
          ["Tariff", CLAIM.tariff, "text-slate-900"],
          ["Recommended", CLAIM.approved, "text-emerald-700"],
        ].map(([l, v, c]) => (
          <div key={l as string} className="text-right leading-tight">
            <dt className="text-[11px] text-slate-500">{l}</dt>
            <dd className={`text-base font-bold tabular-nums ${c}`}>{inr(v as number)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
