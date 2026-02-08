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
        "measure",
        "relative flex flex-col border rounded-sm p-1 min-h-[120px] cursor-pointer transition-colors",
        isSelected && "measure--selected ring-2 ring-primary bg-primary/5",
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
        <div className="measure__instruction text-xs text-muted-foreground italic text-center pb-1" aria-label={`Instruction: ${measure.instruction}`}>
          {measure.instruction}
        </div>
      )}
      {measure.ending && (
        <div className="measure__ending absolute -top-4 left-0 right-0 flex">
          <span className="measure__ending-label text-xs border-l-2 border-t-2 border-r-2 border-foreground px-2">
            {measure.ending}.
          </span>
        </div>
      )}
      <div className="measure__content flex items-stretch flex-1">
        {/* Time signature - aligned with rhythm row */}
        {showTimeSignature && isFirstInLine && (
          <div className="measure__time-signature flex flex-col">
            <div className="measure__time-signature-spacer min-h-[2rem]" />
            <div className="measure__time-signature-display flex items-end min-h-[52px]">
              <TimeSignatureDisplay timeSignature={timeSignature} />
            </div>
          </div>
        )}
        {/* Start barline - aligned with rhythm row */}
        {isFirstInLine && !showTimeSignature && (
          <div className="measure__barline measure__barline--start flex flex-col">
            <div className="measure__barline-spacer min-h-[2rem]" />
            <div className="measure__barline-display flex items-center min-h-[52px]">
              <Barline type={measure.barlineStart} position="start" hasRepeat={measure.repeatStart} />
            </div>
          </div>
        )}
        <div
          className="measure__beats flex-1 grid items-center px-1"
          style={{
            gridTemplateColumns: `repeat(${measure.beats.length}, minmax(min-content, 1fr))`,
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
        {/* End barline - aligned with rhythm row */}
        <div className="measure__barline measure__barline--end flex flex-col">
          <div className="measure__barline-spacer min-h-[2rem]" />
          <div className="measure__barline-display flex items-center min-h-[52px]">
            <Barline type={measure.barlineEnd} position="end" hasRepeat={measure.repeatEnd} />
          </div>
        </div>
      </div>
      {ui.showDynamics && (
        <div className="measure__dynamics-row flex gap-0.5 px-1 min-h-[16px]">
          {measure.beats.map((beat) => (
            <div key={`dyn-${beat.id}`} className="measure__dynamic flex-1 text-xs text-center text-orange-600 font-medium">
              {beat.dynamics}
            </div>
          ))}
        </div>
      )}
      {ui.showLyrics && (
        <div className="measure__lyrics-row flex gap-0.5 px-1 min-h-[16px]">
          {measure.beats.map((beat) => (
            <div key={`lyr-${beat.id}`} className="measure__lyric flex-1 text-xs text-center text-muted-foreground">
              {beat.lyrics}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
