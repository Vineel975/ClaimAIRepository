import type { ReactNode } from "react";

/*
 * Illustrative policy wording for the demo. It is written in the style of an
 * Indian retail indemnity policy so the Policy tab reads like a real document,
 * but it is a specimen, not any insurer's filed wording.
 *
 * Elements that Claim AI cites carry `data-anchor`; the viewer measures them to
 * place highlights, exactly as it uses boxes on the scanned pages.
 */

const PAGE_COUNT = 3;

function Clause({ anchor, n, title, children }: { anchor?: string; n: string; title: string; children: ReactNode }) {
  return (
    <div data-anchor={anchor} className="rounded-[3px] py-1.5">
      <p className="text-[12.5px] leading-[1.55] text-slate-800">
        <span className="font-semibold text-slate-900">
          {n} {title}.
        </span>{" "}
        {children}
      </p>
    </div>
  );
}

function SectionHead({ n, children }: { n: string; children: ReactNode }) {
  return (
    <h3 className="mt-5 mb-1.5 flex items-baseline gap-2 border-b border-slate-300 pb-1 text-[13px] font-bold tracking-wide text-[#1e3a8a] uppercase">
      <span>Section {n}</span>
      <span className="text-slate-400">·</span>
      <span>{children}</span>
    </h3>
  );
}

function Frame({ page, children }: { page: number; children: ReactNode }) {
  return (
    <div className="relative flex h-full w-full flex-col bg-white px-[64px] pt-[48px] pb-[40px] text-slate-800" style={{ fontFamily: '"Source Serif 4", Georgia, "Times New Roman", serif' }}>
      <header className="flex items-end justify-between border-b-2 border-[#1e3a8a] pb-3">
        <div>
          <p className="font-sans text-[10px] font-semibold tracking-[0.18em] text-slate-500 uppercase">Health insurance · Policy wording</p>
          <p className="mt-1 text-[19px] font-semibold text-slate-900">Individual Mediclaim Policy</p>
        </div>
        <div className="text-right font-sans text-[10px] leading-4 text-slate-500">
          <p>UIN: SPEC-HLT-IND-2025-V04</p>
          <p>Specimen wording · for demonstration</p>
        </div>
      </header>
      <div className="flex-1 pt-2">{children}</div>
      <footer className="flex items-center justify-between border-t border-slate-200 pt-2 font-sans text-[10px] text-slate-400">
        <span>Illustrative specimen prepared for the Claim AI demo. Not an insurer&apos;s filed wording.</span>
        <span>
          Page {page} of {PAGE_COUNT}
        </span>
      </footer>
    </div>
  );
}

function PageOne() {
  return (
    <Frame page={1}>
      <p className="mt-2 text-[12.5px] leading-[1.55]">
        This Policy is a contract of insurance between the Insured Person and the Company. In consideration of the premium
        paid, and subject to the terms, conditions, exclusions and limits of this Policy, the Company will indemnify the
        Insured Person for Medical Expenses necessarily incurred on Hospitalisation or Day Care Treatment during the Policy
        Period.
      </p>

      <SectionHead n="1">Policy schedule summary</SectionHead>
      <table data-anchor="schedule" className="w-full border-collapse font-sans text-[11.5px]">
        <tbody>
          {[
            ["Plan", "Individual Mediclaim · Indemnity"],
            ["Sum Insured", "₹2,00,000 per Policy Year"],
            ["Cumulative Bonus", "5% of Sum Insured per claim-free year, up to 50%"],
            ["Room, boarding & nursing", "1% of Sum Insured per day"],
            ["Intensive care unit", "2% of Sum Insured per day"],
            ["Co-payment", "Nil"],
            ["Claims service", "Third Party Administrator (TPA) · cashless at network providers"],
          ].map(([k, v]) => (
            <tr key={k} className="border-b border-slate-200">
              <td className="w-[42%] bg-slate-50 px-2.5 py-1.5 font-medium text-slate-600">{k}</td>
              <td className="px-2.5 py-1.5 text-slate-900">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <SectionHead n="2">Definitions</SectionHead>
      <Clause n="2.1" title="Hospital">
        Any institution established for in-patient care and Day Care Treatment, registered with the local authorities
        under the Clinical Establishments Act, with qualified nursing staff round the clock, at least 10 in-patient beds,
        a fully equipped operation theatre, and daily records of patients.
      </Clause>
      <Clause anchor="day-care-def" n="2.2" title="Day Care Treatment">
        Medical treatment or a surgical procedure undertaken under general or local anaesthesia in a Hospital or day care
        centre in less than 24 hours because of technological advancement, and which would otherwise have required
        Hospitalisation of more than 24 hours.
      </Clause>
      <Clause anchor="network-def" n="2.3" title="Network Provider / PPN">
        A Hospital enlisted by the Company or its TPA to provide cashless services, including members of the Preferred
        Provider Network (PPN) under agreed package rates.
      </Clause>
      <Clause n="2.4" title="Reasonable and Customary Charges">
        Charges for services or supplies that are standard for the geographical area for the same or similar services,
        considering the nature of the illness or injury.
      </Clause>
      <Clause n="2.5" title="Pre-existing Disease">
        Any condition, ailment, injury or disease diagnosed by a physician, or for which medical advice or treatment was
        received, within 48 months before the first policy issued by the Company.
      </Clause>
    </Frame>
  );
}

function PageTwo() {
  return (
    <Frame page={2}>
      <SectionHead n="3">What is covered</SectionHead>
      <Clause n="3.1" title="In-patient Hospitalisation">
        Medical Expenses for Hospitalisation of at least 24 consecutive hours, including room, nursing, surgeon,
        anaesthetist, medical practitioner and specialist fees, anaesthesia, blood, oxygen, operation theatre charges,
        medicines, drugs, diagnostics and the cost of implants.
      </Clause>
      <Clause anchor="room-rent" n="3.2" title="Room rent and ICU limits">
        Room, boarding and nursing expenses are payable up to 1% of the Sum Insured per day, and intensive care unit
        expenses up to 2% of the Sum Insured per day. For a Sum Insured of ₹2,00,000 this is ₹2,000 and ₹4,000 per day
        respectively.
      </Clause>
      <Clause anchor="proportionate" n="3.3" title="Proportionate deduction">
        If the Insured Person occupies a room category above the eligible limit, all associated Medical Expenses (except
        medicines, implants and diagnostics) shall be payable in the proportion that the eligible room rent bears to the
        room rent actually incurred.
      </Clause>
      <Clause anchor="day-care" n="3.4" title="Day Care Treatment">
        Expenses for the listed Day Care procedures, including cataract surgery, are covered even when Hospitalisation is
        less than 24 hours, subject to the sub-limits in Clause 3.7.
      </Clause>
      <Clause n="3.5" title="Pre- and post-hospitalisation">
        Relevant Medical Expenses incurred up to 30 days before admission and up to 60 days after discharge, provided the
        Hospitalisation claim is admissible.
      </Clause>
      <Clause n="3.6" title="Cumulative bonus">
        For every claim-free Policy Year the Sum Insured is increased by 5%, up to a maximum of 50%. The bonus is reduced
        at the same rate following a claim.
      </Clause>

      <div data-anchor="cataract-limit" className="mt-2 rounded-[3px] py-1.5">
        <p className="text-[12.5px] leading-[1.55] text-slate-800">
          <span className="font-semibold text-slate-900">3.7 Sub-limits.</span> The following limits apply per Policy
          Period, within the Sum Insured:
        </p>
        <table className="mt-2 w-full border-collapse font-sans text-[11.5px]">
          <thead>
            <tr className="bg-[#1e3a8a] text-left text-white">
              <th className="px-2.5 py-1.5 font-semibold">Treatment</th>
              <th className="px-2.5 py-1.5 font-semibold">Limit</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Cataract surgery (per eye)", "25% of Sum Insured or ₹40,000, whichever is lower"],
              ["Intraocular lens", "Payable within the cataract limit; premium lenses as per network package cap"],
              ["Knee or hip replacement", "₹1,00,000 per joint"],
              ["Hernia, hydrocele, piles, fissure", "₹30,000 per procedure"],
              ["Modern treatments (as per IRDAI list)", "50% of Sum Insured"],
            ].map(([k, v], i) => (
              <tr key={k} className={i === 0 ? "border-b border-slate-200 bg-amber-50/60" : "border-b border-slate-200"}>
                <td className="px-2.5 py-1.5 font-medium text-slate-700">{k}</td>
                <td className="px-2.5 py-1.5 text-slate-900">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Clause anchor="copay" n="3.8" title="Co-payment">
        No co-payment applies under this Policy unless shown in the Schedule. Where treatment is taken at a non-network
        Hospital in a zone higher than the Policy zone, a 10% co-payment applies to the admissible claim.
      </Clause>
    </Frame>
  );
}

function PageThree() {
  return (
    <Frame page={3}>
      <SectionHead n="4">Waiting periods</SectionHead>
      <Clause n="4.1" title="Initial waiting period">
        Expenses for any illness contracted within 30 days of the first Policy commencement are excluded, except for
        claims arising from an accident.
      </Clause>
      <Clause anchor="cataract-waiting" n="4.2" title="Specified diseases">
        Cataract, benign prostatic hypertrophy, hernia, hydrocele, joint replacement and the other listed conditions are
        covered after 24 months of continuous coverage with the Company.
      </Clause>
      <Clause n="4.3" title="Pre-existing diseases">
        Covered after 36 months of continuous coverage from the first Policy, provided they were declared at proposal.
      </Clause>

      <SectionHead n="5">Exclusions</SectionHead>
      <div data-anchor="exclusions" className="rounded-[3px] py-1.5">
        <ul className="grid grid-cols-2 gap-x-6 gap-y-1 text-[12px] leading-[1.5]">
          {[
            "Refractive error correction below 7.5 dioptres",
            "Cosmetic or aesthetic treatment",
            "Spectacles, contact lenses and hearing aids",
            "Investigation and evaluation only",
            "Rest cure and rehabilitation",
            "Treatment for obesity and weight control",
            "Injury from hazardous or adventure sports",
            "Non-medical items listed in Annexure I",
            "Unproven or experimental treatment",
            "Treatment outside India",
          ].map((x) => (
            <li key={x} className="flex gap-2">
              <span className="text-slate-400">—</span>
              {x}
            </li>
          ))}
        </ul>
      </div>

      <SectionHead n="6">Claim conditions</SectionHead>
      <Clause anchor="cashless" n="6.1" title="Cashless facility">
        Cashless is available only at Network Providers on pre-authorisation by the TPA. The request must be submitted at
        least 48 hours before a planned admission, or within 24 hours of an emergency admission.
      </Clause>
      <Clause anchor="ppn-rates" n="6.2" title="Network package rates">
        Claims at a PPN Hospital are settled as per the agreed package rate. Amounts billed above the package are not
        payable by the Company and shall not be recovered from the Insured Person, except for non-admissible items or a
        higher room category chosen by the Insured Person.
      </Clause>
      <Clause anchor="claim-docs" n="6.3" title="Documents">
        Claim form signed by the Insured Person and the Hospital, KYC of the proposer, discharge summary, final bill with
        break-up, payment receipts, investigation reports, and for implants the invoice and sticker.
      </Clause>
      <Clause n="6.4" title="Fraud">
        If any claim is fraudulent, or supported by any fraudulent means or device, all benefits under this Policy are
        forfeited.
      </Clause>

      <div className="mt-6 flex items-end justify-between font-sans">
        <div className="text-[10.5px] leading-4 text-slate-500">
          <p>Grievance redressal: TPA helpdesk, then Company grievance cell, then Insurance Ombudsman.</p>
          <p>Free-look period: 30 days from receipt of the Policy.</p>
        </div>
        <div className="text-right">
          <div className="ml-auto h-8 w-36 border-b border-slate-400" />
          <p className="mt-1 text-[10.5px] text-slate-500">Authorised signatory</p>
        </div>
      </div>
    </Frame>
  );
}

export const POLICY_PAGES = [PageOne, PageTwo, PageThree];
