import React from "react";
import { useChartStore } from "@/lib/store";
import type { Beat } from "@/lib/schema";
import { SlashNotation } from "./SlashNotation";
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

  const handleSlotClick = (slotId: string) => {
    setSelection({
      type: "slot",
      sectionId,
      measureId,
      beatId: beat.id,
      slotId,
    });
  };

  return (
    <div
      className={cn(
        "flex-1 flex flex-col items-center justify-center min-w-[30px] py-1",
        "border-r border-dashed border-border/50 last:border-r-0",
        isSelected && "bg-primary/10 rounded"
      )}
      role="group"
      aria-label={`Beat ${beatIndex + 1}, ${beat.division} division`}
    >
      <div
        className={cn(
          "flex w-full items-center justify-center gap-0.5",
          beat.division === "quarter" && "flex-col",
          beat.division !== "quarter" && "flex-row"
        )}
      >
        {beat.slots.map((slot, slotIndex) => (
          <div
            key={slot.id}
            className={cn(
              "flex flex-col items-center cursor-pointer p-0.5 rounded",
              "hover:bg-muted transition-colors",
              ui.selection?.slotId === slot.id && "bg-primary/20 ring-1 ring-primary"
            )}
            onClick={() => handleSlotClick(slot.id)}
            tabIndex={0}
            role="button"
            aria-label={`Slot ${slotIndex + 1}: ${slot.chord ? `${slot.chord.root} ${slot.chord.quality}` : "empty"}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleSlotClick(slot.id);
            }}
          >
            {(slot.chord || slot.nashvilleChord) && (
              <ChordSymbol
                chord={slot.chord}
                nashvilleChord={slot.nashvilleChord}
                notationType={useChartStore.getState().chart.meta.notationType}
              />
            )}
            {ui.showSlashes && !slot.slash.rest && (
              <SlashNotation
                articulation={slot.slash.articulation}
                tied={slot.slash.tied}
                size={
                  beat.division === "quarter"
                    ? "lg"
                    : beat.division === "sixteenth" || beat.division === "sixteenthTriplet"
                      ? "sm"
                      : "md"
                }
              />
            )}
            {slot.slash.rest && (
              <span className="text-muted-foreground" aria-label="Rest">
                𝄽
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
