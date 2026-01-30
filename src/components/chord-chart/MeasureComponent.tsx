import React from "react";
import { useChartStore } from "@/lib/store";
import type { Measure, TimeSignature } from "@/lib/schema";
import { BeatComponent } from "./BeatComponent";
import { Barline } from "./Barline";
import { TimeSignatureDisplay } from "./TimeSignatureDisplay";
import { cn } from "@/lib/utils";

interface MeasureComponentProps {
  measure: Measure;
  sectionId: string;
  measureIndex: number;
  timeSignature: TimeSignature;
  showTimeSignature: boolean;
  isFirstInLine: boolean;
  isLastInLine: boolean;
}

export function MeasureComponent(props: MeasureComponentProps) {
  const {
    measure,
    sectionId,
    measureIndex,
    timeSignature,
    showTimeSignature,
    isFirstInLine,
  } = props;
  const { ui, setSelection } = useChartStore();
  const isSelected = ui.selection?.measureId === measure.id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelection({ type: "measure", sectionId, measureId: measure.id });
  };

  return (
    <div
      className={cn(
        "relative flex flex-col border rounded-sm p-1 min-h-[120px] cursor-pointer transition-colors",
        isSelected && "ring-2 ring-primary bg-primary/5",
        "hover:bg-muted/50 focus-within:ring-2 focus-within:ring-primary"
      )}
      onClick={handleClick}
      role="group"
      aria-label={`Measure ${measureIndex + 1}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleClick(e as unknown as React.MouseEvent);
      }}
    >
      {ui.showInstructions && measure.instruction && (
        <div className="text-xs text-muted-foreground italic text-center pb-1" aria-label={`Instruction: ${measure.instruction}`}>
          {measure.instruction}
        </div>
      )}
      {measure.ending && (
        <div className="absolute -top-4 left-0 right-0 flex">
          <span className="text-xs border-l-2 border-t-2 border-r-2 border-foreground px-2">
            {measure.ending}.
          </span>
        </div>
      )}
      <div className="flex items-stretch flex-1">
        {showTimeSignature && isFirstInLine && (
          <TimeSignatureDisplay timeSignature={timeSignature} />
        )}
        <Barline type={measure.barlineStart} position="start" hasRepeat={measure.repeatStart} />
        <div
          className="flex-1 grid items-stretch px-1 min-w-0"
          style={{
            gridTemplateColumns: `repeat(${measure.beats.length}, minmax(80px, min-content))`,
          }}
        >
          {measure.beats.map((beat, beatIndex) => (
            <BeatComponent
              key={beat.id}
              beat={beat}
              sectionId={sectionId}
              measureId={measure.id}
              beatIndex={beatIndex}
            />
          ))}
        </div>
        <Barline type={measure.barlineEnd} position="end" hasRepeat={measure.repeatEnd} />
      </div>
      {ui.showDynamics && (
        <div className="flex gap-0.5 px-1 min-h-[16px]">
          {measure.beats.map((beat) => (
            <div key={`dyn-${beat.id}`} className="flex-1 text-xs text-center text-orange-600 font-medium">
              {beat.dynamics}
            </div>
          ))}
        </div>
      )}
      {ui.showLyrics && (
        <div className="flex gap-0.5 px-1 min-h-[16px]">
          {measure.beats.map((beat) => (
            <div key={`lyr-${beat.id}`} className="flex-1 text-xs text-center text-muted-foreground">
              {beat.lyrics}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
