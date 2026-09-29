import type { SourceRef } from "./types";

/** A request to show one piece of evidence in the viewer. `key` changes on every click. */
export interface HighlightRequest {
  fieldId: string | null;
  label: string;
  value?: string;
  source: SourceRef;
  key: number;
}
