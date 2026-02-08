import React from "react";
import { useChartStore } from "@/lib/store";
import type { Beat } from "@/lib/schema";
import { SlashNotation } from "./SlashNotation";
import { BeamedSlashGroup } from "./BeamedSlashGroup";
import { ChordSymbol } from "./ChordSymbol";
import { cn } from "@/lib/utils";

interface BeatComponentProps {
  beat: Beat;
  sectionId: string;
  measureId: string;
  beatIndex: number;
}

export function BeatComponent({
  beat,
  sectionId,
  measureId,
  beatIndex,
}: BeatComponentProps) {
  const { ui, setSelection } = useChartStore();
  const isSelected = ui.selection?.beatId === beat.id;

  const handleSlotClick = (e: React.MouseEvent, slotId: string) => {
    e.stopPropagation();
    setSelection({
      type: "slot",
      sectionId,
      measureId,
      beatId: beat.id,
      slotId,
    });
  };

  const isBeamed = beat.division !== "quarter" && beat.slots.length > 1;
  const slashSize =
    beat.division === "quarter"
      ? "lg"
      : beat.division === "sixteenth" || beat.division === "sixteenthTriplet"
        ? "sm"
        : "md";

  return (
    <div
      className={cn(
        "beat",
        "flex flex-col",
        "border-r border-dashed border-border/50 last:border-r-0",
        isSelected && "beat--selected bg-[#c3eff7]"
      )}
      role="group"
      aria-label={`Beat ${beatIndex + 1}, ${beat.division} division`}
    >
      {/* Chord row - grid auto-sizes to fit chord content */}
      <div
        className="beat__chord-row grid w-full items-end justify-items-center min-h-[2rem] px-0.5 pb-0.5"
        style={{ gridTemplateColumns: `repeat(${beat.slots.length}, minmax(min-content, 1fr))` }}
      >
        {beat.slots.map((slot, slotIndex) => (
          <div
            key={slot.id}
            className={cn(
              "beat__chord-slot",
              "flex items-end justify-center cursor-pointer py-0.5 px-1",
              "hover:bg-muted/50 transition-colors",
              ui.selection?.slotId === slot.id && "beat__chord-slot--selected bg-[#c3eff7]"
            )}
            onClick={(e) => handleSlotClick(e, slot.id)}
            tabIndex={0}
            role="button"
            aria-label={`Slot ${slotIndex + 1}: ${slot.chord ? `${slot.chord.root} ${slot.chord.quality}` : "empty"}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleSlotClick(e as unknown as React.MouseEvent, slot.id);
            }}
          >
            {(slot.chord || slot.nashvilleChord) && (
              <ChordSymbol
                chord={slot.chord}
                nashvilleChord={slot.nashvilleChord}
                notationType={useChartStore.getState().chart.meta.notationType}
              />
            )}
          </div>
        ))}
      </div>
      {/* Rhythm row - uses same grid as chord row for alignment */}
      <div
        className="beat__rhythm-row grid w-full items-center justify-items-center min-h-[52px] flex-shrink-0"
        style={{ gridTemplateColumns: `repeat(${beat.slots.length}, minmax(min-content, 1fr))` }}
      >
        {ui.showSlashes && !isBeamed && beat.slots.map((slot) => (
          <div
            key={slot.id}
            className={cn(
              "beat__rhythm-slot",
              "flex items-center justify-center cursor-pointer p-0.5",
              "hover:bg-muted/50 transition-colors",
              ui.selection?.slotId === slot.id && "beat__rhythm-slot--selected bg-[#c3eff7]"
            )}
            onClick={(e) => handleSlotClick(e, slot.id)}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleSlotClick(e as unknown as React.MouseEvent, slot.id);
            }}
          >
            {!slot.slash.rest ? (
              <SlashNotation
                articulation={slot.slash.articulation}
                tied={slot.slash.tied}
                size={slashSize}
              />
            ) : (
              <span className="beat__rest font-petaluma text-muted-foreground text-2xl" aria-label="Rest">
                𝄽
              </span>
            )}
          </div>
        ))}
        {ui.showSlashes && isBeamed && (
          <div className="beat__beamed-container" style={{ gridColumn: `1 / -1` }}>
            <BeamedSlashGroup
              slots={beat.slots.map((s) => s.slash)}
              size={slashSize === "sm" ? "sm" : "md"}
              selectedIndex={beat.slots.findIndex((s) => s.id === ui.selection?.slotId)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
