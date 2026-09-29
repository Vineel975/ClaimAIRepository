import { ALL_FIELDS } from "@/data/claim";
import type { DocId, FieldStatus, SourceRef } from "@/data/types";

/** An extracted region drawn on a page when "Show extracted regions" is on. */
export interface PageRegion {
  key: string;
  fieldIds: string[];
  labels: string[];
  status: FieldStatus;
  source: SourceRef;
}

const RANK: Record<FieldStatus, number> = { matched: 0, review: 1, missing: 2 };

/** Regions per document, one entry per distinct box (fields sharing a box are merged). */
export function regionsFor(doc: DocId): PageRegion[] {
  const byKey = new Map<string, PageRegion>();
  for (const f of ALL_FIELDS) {
    const s = f.source;
    if (!s || s.doc !== doc) continue;
    const key = `${s.page}:${s.box ? s.box.join(",") : s.anchor}`;
    const hit = byKey.get(key);
    if (hit) {
      hit.fieldIds.push(f.id);
      hit.labels.push(f.label);
      if (RANK[f.status] > RANK[hit.status]) hit.status = f.status;
    } else {
      byKey.set(key, { key, fieldIds: [f.id], labels: [f.label], status: f.status, source: s });
    }
  }
  return [...byKey.values()];
}
