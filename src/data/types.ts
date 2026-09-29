/** Which document a piece of evidence lives in. Mirrors the viewer tabs. */
export type DocId = "bill" | "tariff" | "policy";

/** Normalised rectangle on an UPRIGHT page: [x0, y0, x1, y1], each 0..1. */
export type Box = [number, number, number, number];

/**
 * Where a value came from. Image pages (scanned bill, tariff) carry a box; the
 * policy is live HTML, so it carries an anchor id and the viewer measures the
 * element to get its box at render time.
 */
export interface SourceRef {
  doc: DocId;
  /** 1-based page number within the document. */
  page: number;
  box?: Box;
  anchor?: string;
}

export type FieldStatus = "matched" | "review" | "missing";

export interface ExtractedField {
  id: string;
  label: string;
  value: string;
  /** Secondary line under the value (e.g. breakdown, ICD code). */
  detail?: string;
  status: FieldStatus;
  /** Model confidence 0..1. Omitted for computed or system values. */
  confidence?: number;
  source?: SourceRef;
  /** Why the field is review/missing, or what it was matched against. */
  note?: string;
  /** Where the value was produced when it has no page source. */
  origin?: "computed" | "system";
  /** Value is masked for the public demo. */
  masked?: boolean;
  emphasis?: boolean;
}

export interface FieldSection {
  id: string;
  title: string;
  fields: ExtractedField[];
}

export interface DocPage {
  src: string;
  thumb: string;
  width: number;
  height: number;
  label?: string;
}

export interface DocumentSpec {
  id: DocId;
  label: string;
  /** Short caption shown in the viewer header. */
  caption: string;
  kind: "image" | "html";
  pages: DocPage[];
}

export interface TimelineStep {
  title: string;
  detail: string;
  at: string;
  source?: SourceRef;
}
