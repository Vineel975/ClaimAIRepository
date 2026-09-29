import type { DocumentSpec } from "./types";

// Page images are produced by scripts/enhance.py (flat-field clean-up of the
// scans) and scripts/redact.py (patient identifiers blacked out for the demo).
export const DOCUMENTS: DocumentSpec[] = [
  {
    id: "bill",
    label: "Hospital Bill",
    caption: "Cashless claim bundle · Susrut Eye Foundation",
    kind: "image",
    pages: [
    { src: "docs/b-1.webp", thumb: "docs/b-1-thumb.webp", width: 1400, height: 1998, label: "Claim form" },
    { src: "docs/b-2.webp", thumb: "docs/b-2-thumb.webp", width: 1400, height: 2002, label: "Claim form" },
    { src: "docs/b-3.webp", thumb: "docs/b-3-thumb.webp", width: 1400, height: 1979, label: "Claim form" },
    { src: "docs/b-4.webp", thumb: "docs/b-4-thumb.webp", width: 1400, height: 1984, label: "Declarations" },
    { src: "docs/b-5.webp", thumb: "docs/b-5-thumb.webp", width: 1400, height: 1977, label: "PPN declaration" },
    { src: "docs/b-6.webp", thumb: "docs/b-6-thumb.webp", width: 1400, height: 1983, label: "Policy schedule" },
    { src: "docs/b-7.webp", thumb: "docs/b-7-thumb.webp", width: 1400, height: 1977, label: "KYC" },
    { src: "docs/b-8.webp", thumb: "docs/b-8-thumb.webp", width: 1400, height: 1984, label: "Prescription" },
    { src: "docs/b-9.webp", thumb: "docs/b-9-thumb.webp", width: 1600, height: 1108, label: "IOL biometry" },
    ],
  },
  {
    id: "tariff",
    label: "Tariff",
    caption: "GIPSA PPN rate list 2022–2025 · Susrut Eye Foundation",
    kind: "image",
    pages: [
    { src: "docs/t-1.webp", thumb: "docs/t-1-thumb.webp", width: 1400, height: 2030, label: "Rate header & inclusions" },
    { src: "docs/t-2.webp", thumb: "docs/t-2-thumb.webp", width: 1400, height: 2030, label: "ENT, surgery, obs & gyn" },
    { src: "docs/t-3.webp", thumb: "docs/t-3-thumb.webp", width: 1400, height: 2032, label: "Ophthalmology & ortho" },
    { src: "docs/t-4.webp", thumb: "docs/t-4-thumb.webp", width: 1400, height: 2027, label: "Ortho, urology" },
    { src: "docs/t-5.webp", thumb: "docs/t-5-thumb.webp", width: 1400, height: 2028, label: "Urology, neuro & package notes" },
    { src: "docs/t-6.webp", thumb: "docs/t-6-thumb.webp", width: 1400, height: 2035, label: "Notes & signatories" },
    ],
  },
  {
    id: "policy",
    label: "Policy",
    caption: "Policy wording · illustrative specimen",
    kind: "html",
    pages: [
      { src: "", thumb: "", width: 794, height: 1123, label: "Schedule & definitions" },
      { src: "", thumb: "", width: 794, height: 1123, label: "Coverage & limits" },
      { src: "", thumb: "", width: 794, height: 1123, label: "Waiting periods, exclusions, claims" },
    ],
  },
];

export const DOC_BY_ID = Object.fromEntries(DOCUMENTS.map((d) => [d.id, d])) as Record<
  DocumentSpec["id"],
  DocumentSpec
>;
