/**
 * Shared typography + surface tokens for the analysis pane.
 *
 * WHY THIS FILE EXISTS
 * Header styling had drifted: section titles were set three different ways across
 * the tabs (CardTitle defaults, `text-lg font-semibold text-gray-900`, and inline
 * uppercase spans), sub-headers used four different colours, and ALL-CAPS was doing
 * the job that size and weight should do. The result read as competing levels rather
 * than a nest.
 *
 * Import these instead of writing class strings inline, so a change lands everywhere.
 *
 * THE SCALE - strictly descending, which is the whole point:
 *   SECTION_TITLE   18px / bold      / near-black
 *   SUBHEAD         14px / semibold  / slate-700
 *   SUBSUBHEAD      12px / medium    / slate-500
 *
 * Sentence case throughout. Capitals were carrying hierarchy; size and weight carry
 * it now, and sentence case is easier to scan in a clinical screen a doctor reads
 * for hours.
 */

/** Top-level section: Patient information, Medical admissibility, Financial summary, Approvals. */
export const SECTION_TITLE = "text-lg font-bold tracking-tight text-slate-900";

/** Second level: Hospital estimate, Tariff extraction, Benefit plan summary, ... */
export const SUBHEAD = "text-sm font-semibold tracking-tight text-slate-700";

/** Third level: the coloured cards inside Benefit plan summary (Co-pay, Exclusions, ...). */
export const SUBSUBHEAD = "text-xs font-medium text-slate-500";

/**
 * Third level, tinted. The benefit-plan cards keep their colour because the colour
 * is meaningful there - amber = money owed by the member, red = not covered - but
 * the SIZE and WEIGHT still come from the scale above, so they sit below SUBHEAD.
 */
export const SUBSUBHEAD_TINTED = "text-xs font-semibold";

/** Card surface: white, quiet border. Replaces the tinted panels on the info panes. */
export const PANEL = "rounded-lg border border-slate-200 bg-white";

/**
 * Body copy inside a panel.
 *
 * Deliberately JUST text-sm, matching the Processing doctor notes box in
 * result-view.tsx - the reference for body text across the pane. Everything else is
 * INHERITED on purpose.
 *
 * I previously added font-sans + leading-relaxed + text-slate-900 here trying to make
 * three boxes agree. That was the cause of the mismatch, not the cure: the reference
 * box inherits its family, line-height and colour, so pinning those made every other
 * box differ FROM it. Do not add them back.
 */
export const PANEL_TEXT = "text-sm";

/** Muted label text inside a panel (field captions). */
export const PANEL_LABEL = "text-xs font-medium text-slate-500";

/**
 * The claim summary panel at the top of Patient information.
 *
 * Label and value are the SAME SIZE deliberately. They were 12px label against 14px
 * value, which made every row's baseline jump. Size is not the differentiator here -
 * colour and weight are - and a fixed label width lines the values into a column
 * instead of starting them at four different x positions.
 *
 * There were four label treatments in as many rows: grey caption, grey caption with a
 * blue link value, and two bold-black inline labels. One treatment now.
 *
 * EMPHASIS: the LABEL carries the weight, not the value. That is the opposite of the
 * usual convention, and deliberate here - this panel is scanned to find a named field
 * ("what was the bill?"), so the labels are the navigation and should be findable.
 * Both stay dark enough to read comfortably; the difference is weight, not contrast.
 */
/*
 * No fixed width. A w-36/w-40 column had to be sized for the LONGEST label, which
 * left a visible trough after every shorter one - and widening it to protect
 * "Patient relationship" (which is not on every claim) made the common rows worse.
 *
 * The row is a 2-column grid instead: the label column takes exactly the width of the
 * widest label PRESENT on that claim (max-content), so the values still line up in a
 * column, and the gutter is a real 1.5rem rather than leftover space.
 */
/* Goes on the PANEL, not the row: one shared grid is what makes the labels line up.
 * A grid per row would size each row's label column independently. */
/*
 * The claim summary rows are a plain STACK, each row carrying its own label and value
 * inline - not a 2-column grid.
 *
 * A grid was tried and broke: it requires every row to be an exact label+value PAIR,
 * and three rows in that panel (Benefit Plan Name, Insurer, Policy No) are single
 * elements. Each took one cell, which shifted the columns for everything after it and
 * stretched the rows to full height.
 *
 * The trade is that values no longer align in a column. That is worth it: this layout
 * cannot desynchronise, cannot overflow, and does not care how many rows are present
 * on a given claim.
 */
export const SUMMARY_LABEL = "text-sm font-semibold";
export const SUMMARY_VALUE = "text-sm font-normal";

/**
 * Section heading INSIDE a tab - Diagnosis, Medical coding, Doctor notes,
 * Presenting complaint, Claim history. One level below SECTION_TITLE and one above
 * SUBHEAD. These four were written out longhand at each site and were already
 * identical; putting them on a token is what stops them drifting apart again.
 */
export const SUBHEAD_LG = "text-base font-semibold text-slate-700";