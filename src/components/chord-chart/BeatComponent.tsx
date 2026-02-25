import React, { useRef, useState, useLayoutEffect } from "react";
import { useChartStore } from "@/lib/store";
import type { Beat } from "@/lib/schema";
import { SlashNotation } from "./SlashNotation";
import { BeamedSlashGroup, QuarterTripletGroup } from "./BeamedSlashGroup";
import { ChordSymbol } from "./ChordSymbol";
import { cn, rhythmicSlotMin } from "@/lib/utils";

interface BeatComponentProps {
  beat: Beat;
  sectionId: string;
  measureId: string;
  beatIndex: number;
  isDisabled?: boolean;
  showRhythm?: boolean;
  chordRhythmGap?: number;
}

export function BeatComponent({
  beat,
  sectionId,
  measureId,
  beatIndex,
  isDisabled = false,
  showRhythm = true,
  chordRhythmGap = 0,
}: BeatComponentProps) {
  const { ui, setSelection } = useChartStore();
  const articulationSize = ui.articulationSize;
  const isSelected = ui.selection?.beatId === beat.id;
  const n = beat.slots.length;
  const slotMinPx = rhythmicSlotMin(beat.division);

  const handleSlotClick = (e: React.MouseEvent, slotId: string) => {
    e.stopPropagation();
    setSelection({ type: "slot", sectionId, measureId, beatId: beat.id, slotId });
  };

  const handleSlotKeyDown = (e: React.KeyboardEvent, slotId: string) => {
    if (e.key === "Enter" || e.key === " ") handleSlotClick(e as unknown as React.MouseEvent, slotId);
  };

  // Clicking the rhythm row (slash noteheads / beamed group) selects the beat, not the slot.
  // This keeps the chord input unfocused so stem shortcuts (Shift+B, X) work immediately.
  const handleBeatSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelection({ type: "beat", sectionId, measureId, beatId: beat.id });
  };

  const isBeamed = beat.division === "eighth" || beat.division === "eighthTriplet" ||
                   beat.division === "sixteenth" || beat.division === "sixteenthTriplet";
  const isQuarterTriplet = beat.division === "quarterTriplet";
  const slashSize =
    beat.division === "quarter" || beat.division === "half" || beat.division === "whole"
      ? "lg"
      : beat.division === "sixteenth" || beat.division === "sixteenthTriplet"
        ? "sm"
        : "md";

  // Only enforce proportional minimum width for sub-eighth divisions.
  // Quarter/eighth beats rely on natural flex sizing so 4/line remains achievable.
  const isSimple = beat.division === "quarter" || beat.division === "eighth";
  const gridMinWidth = isSimple ? undefined : n * slotMinPx;

  // Measure rendered chord widths so the widest chord always fits its equal column.
  // ChordSymbol uses whitespace-nowrap, so its outer span's offsetWidth is the full
  // text width regardless of the column constraint it's sitting in.
  // We expand the entire beat (not individual columns) so equal 1fr columns are
  // preserved and BeamedSlashGroup notehead percentages stay correct.
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const beatRef = useRef<HTMLDivElement>(null);
  const [contentMinWidth, setContentMinWidth] = useState(0);
  const [beatWidth, setBeatWidth] = useState(0);
  useLayoutEffect(() => {
    if (beatRef.current) {
      setBeatWidth(beatRef.current.offsetWidth);
    }
    let maxW = 0;
    for (let i = 0; i < n; i++) {
      const el = slotRefs.current[i];
      if (!el) continue;
      const span = el.querySelector("span") as HTMLElement | null;
      if (span) maxW = Math.max(maxW, span.offsetWidth);
    }
    setContentMinWidth(maxW > 0 ? maxW * n : 0);
  }, [beat.slots, n]);

  const effectiveMinWidth = Math.max(gridMinWidth ?? 0, contentMinWidth) || undefined;

  const notationType = useChartStore.getState().chart.meta.notationType;

  return (
    <div
      ref={beatRef}
      className={cn(
        "beat",
        "flex flex-col",
        "border-r border-dashed border-border/50 last:border-r-0",
        isSelected && "beat--selected bg-[#c3eff7]",
        isDisabled && "beat--disabled opacity-30 pointer-events-none"
      )}
      role="group"
      aria-label={`Beat ${beatIndex + 1}, ${beat.division} division`}
    >
      {ui.showSlashes ? (
        /*
         * Single grid – chord cells in row 1, rhythm cells in row 2.
         * Using plain 1fr columns so every column is always equal-width.
         * BeamedSlashGroup positions noteheads at (i+0.5)/n × 100%, which
         * matches the centre of each 1fr column exactly.
         * Every cell has an explicit gridRow + gridColumn to avoid any
         * auto-placement ambiguity.
         */
        <div
          className="beat__grid grid w-full"
          style={{
            gridTemplateColumns: `repeat(${n}, 1fr)`,
            gridTemplateRows: "minmax(2rem, auto) 72px",
            ...(chordRhythmGap > 0 ? { rowGap: chordRhythmGap } : {}),
            ...(effectiveMinWidth ? { minWidth: effectiveMinWidth } : {}),
          }}
        >
          {/* Row 1 – chord symbols */}
          {beat.slots.map((slot, i) => (
            <div
              key={slot.id}
              ref={el => { slotRefs.current[i] = el; }}
              style={{ gridRow: 1, gridColumn: i + 1 }}
              className={cn(
                "beat__chord-slot",
                "flex justify-center items-end cursor-pointer px-1 py-0.5",
                "hover:bg-muted/50 transition-colors",
                ui.selection?.slotId === slot.id && "beat__chord-slot--selected bg-[#c3eff7]"
              )}
              onClick={(e) => handleSlotClick(e, slot.id)}
              tabIndex={0}
              role="button"
              aria-label={`Slot ${i + 1}: ${slot.chord ? `${slot.chord.root} ${slot.chord.quality}` : "empty"}`}
              onKeyDown={(e) => handleSlotKeyDown(e, slot.id)}
            >
              {(slot.chord || slot.nashvilleChord) && (
                <ChordSymbol
                  chord={slot.chord}
                  nashvilleChord={slot.nashvilleChord}
                  notationType={notationType}
                />
              )}
            </div>
          ))}

          {/* Row 2 – rhythm notation (suppressed for whole-rest measures) */}
          {showRhythm ? (
            <>
              {/* Row 2 – individual slash noteheads (quarter, half, whole) */}
              {!isBeamed && !isQuarterTriplet && beat.slots.map((slot, i) => (
                <div
                  key={`r-${slot.id}`}
                  style={{ gridRow: 2, gridColumn: i + 1 }}
                  className={cn(
                    "beat__rhythm-slot",
                    "flex items-center justify-center cursor-pointer p-0.5",
                    "hover:bg-muted/50 transition-colors",
                    (ui.selection?.slotId === slot.id || (isSelected && !ui.selection?.slotId)) && "beat__rhythm-slot--selected bg-[#c3eff7]"
                  )}
                  onClick={handleBeatSelect}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleBeatSelect(e as unknown as React.MouseEvent); }}
                >
                  {!slot.slash.rest ? (
                    <SlashNotation
                      articulation={slot.slash.articulation}
                      tied={slot.slash.tied}
                      size={slashSize}
                      articulationSize={articulationSize}
                      stem={beat.division === "half" ? true : slot.slash.stem}
                      stemDirection={slot.slash.stemDirection}
                      beatWidth={slot.slash.tied && beatWidth > 0 ? beatWidth : undefined}
                      noteType={beat.division === "half" ? "half" : beat.division === "whole" ? "whole" : "quarter"}
                    />
                  ) : (
                    <span className="beat__rest font-petaluma text-muted-foreground text-2xl" aria-label="Rest">
                      {beat.division === "whole"
                        ? String.fromCodePoint(0x1D13B)
                        : beat.division === "half"
                          ? String.fromCodePoint(0x1D13C)
                          : '𝄽'}
                    </span>
                  )}
                </div>
              ))}

              {/* Row 2 – quarter triplet group */}
              {isQuarterTriplet && (
                <div
                  style={{ gridRow: 2, gridColumn: "1 / -1" }}
                  className="beat__beamed-group w-full cursor-pointer"
                  onClick={handleBeatSelect}
                >
                  <QuarterTripletGroup
                    slots={beat.slots.map((s) => s.slash)}
                    size="md"
                    selectedIndex={beat.slots.findIndex((s) => s.id === ui.selection?.slotId)}
                    articulationSize={articulationSize}
                  />
                </div>
              )}

              {/* Row 2 – beamed group spanning all columns */}
              {isBeamed && (
                <div
                  style={{ gridRow: 2, gridColumn: "1 / -1" }}
                  className="beat__beamed-group w-full cursor-pointer"
                  onClick={handleBeatSelect}
                >
                  <BeamedSlashGroup
                    slots={beat.slots.map((s) => s.slash)}
                    size={slashSize === "sm" ? "sm" : "md"}
                    selectedIndex={beat.slots.findIndex((s) => s.id === ui.selection?.slotId)}
                    articulationSize={articulationSize}
                  />
                </div>
              )}
            </>
          ) : (
            /* Placeholder preserves 72px row height when rhythm is suppressed */
            <div style={{ gridRow: 2, gridColumn: "1 / -1" }} />
          )}
        </div>
      ) : (
        /* Chords-only mode – single equal-column row */
        <div
          className="beat__chord-grid grid w-full items-center justify-items-center min-h-[72px] px-0.5"
          style={{ gridTemplateColumns: `repeat(${n}, 1fr)`, ...(effectiveMinWidth ? { minWidth: effectiveMinWidth } : {}) }}
        >
          {beat.slots.map((slot, i) => (
            <div
              key={slot.id}
              ref={el => { slotRefs.current[i] = el; }}
              style={{ gridColumn: i + 1 }}
              className={cn(
                "beat__chord-slot",
                "flex justify-center items-center cursor-pointer px-1 py-1",
                "hover:bg-muted/50 transition-colors",
                ui.selection?.slotId === slot.id && "beat__chord-slot--selected bg-[#c3eff7]"
              )}
              onClick={(e) => handleSlotClick(e, slot.id)}
              tabIndex={0}
              role="button"
              aria-label={`Slot ${i + 1}: ${slot.chord ? `${slot.chord.root} ${slot.chord.quality}` : "empty"}`}
              onKeyDown={(e) => handleSlotKeyDown(e, slot.id)}
            >
              {(slot.chord || slot.nashvilleChord) && (
                <ChordSymbol
                  chord={slot.chord}
                  nashvilleChord={slot.nashvilleChord}
                  notationType={notationType}
                  className="text-xl"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
