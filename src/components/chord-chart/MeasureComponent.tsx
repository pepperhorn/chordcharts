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

  // Compute visible beats: skip the beat immediately following a quarterTriplet (it is "consumed")
  const visibleBeats = measure.beats.reduce<{ beat: typeof measure.beats[0]; originalIndex: number }[]>(
    (acc, beat, i) => {
      if (i > 0 && measure.beats[i - 1].division === "quarterTriplet") return acc;
      acc.push({ beat, originalIndex: i });
      return acc;
    },
    []
  );

  // Whole-note slash: beat[0] is "whole" → beats 1+ are disabled
  const isWholeMeasure = measure.beats[0]?.division === "whole";

  // Dynamic grid columns: quarterTriplet beats get 2fr, all others get 1fr
  const gridCols = visibleBeats
    .map(({ beat }) => beat.division === "quarterTriplet" ? "minmax(min-content, 2fr)" : "minmax(min-content, 1fr)")
    .join(" ");

  // Extra gap between chord row and rhythm row when stem-up triplets overflow above the box
  const hasStemUpTriplet = visibleBeats.some(({ beat }) => {
    const isTriplet = beat.division === "eighthTriplet" || beat.division === "sixteenthTriplet" || beat.division === "quarterTriplet";
    const stemDir = beat.slots[0]?.slash.stemDirection ?? "down";
    return isTriplet && stemDir === "up";
  });
  const chordRhythmGap = hasStemUpTriplet ? 15 : 0;
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
        isSelected && "measure--selected ring-2 ring-inset ring-primary bg-primary/5",
        "hover:bg-muted/50 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary"
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
        {/* Time signature */}
        {showTimeSignature && (
          <div className="measure__time-signature flex flex-col">
            {ui.showSlashes && <div className="measure__time-signature-spacer min-h-[2rem] flex-1" />}
            <div className={cn("measure__time-signature-display flex min-h-[72px]", ui.showSlashes ? "items-end" : "items-center")}>
              <TimeSignatureDisplay timeSignature={timeSignature} />
            </div>
          </div>
        )}
        {/* Start barline: only on wrapped lines that lack a time signature */}
        {isFirstInLine && !showTimeSignature && (
          <div className="measure__barline measure__barline--start flex flex-col">
            {ui.showSlashes && <div className="measure__barline-spacer min-h-[2rem] flex-1" />}
            <div className={cn("measure__barline-display flex min-h-[72px]", ui.showSlashes ? "items-end" : "items-center")}>
              <Barline type={measure.barlineStart} position="start" hasRepeat={measure.repeatStart} />
            </div>
          </div>
        )}
        <div
          className="measure__beats flex-1 grid items-center px-1 relative"
          style={{ gridTemplateColumns: gridCols }}
        >
          {visibleBeats.map(({ beat, originalIndex }) => (
            <BeatComponent
              key={beat.id}
              beat={beat}
              sectionId={sectionId}
              measureId={measure.id}
              beatIndex={originalIndex}
              isDisabled={isWholeMeasure && originalIndex > 0}
              showRhythm={!measure.wholeRest}
              chordRhythmGap={chordRhythmGap}
            />
          ))}
          {/* Whole-rest overlay: centered rest symbol spanning the full rhythm row */}
          {measure.wholeRest && ui.showSlashes && (
            <div
              className="absolute left-0 right-0 bottom-0 flex justify-center items-center pointer-events-none"
              style={{ height: 72 }}
              aria-label="Whole rest"
            >
              <span className="font-petaluma" style={{ fontSize: 40, lineHeight: 1 }}>
                {String.fromCodePoint(0x1D13B)}
              </span>
            </div>
          )}
        </div>
        {/* End barline */}
        <div className="measure__barline measure__barline--end flex flex-col">
          {ui.showSlashes && <div className="measure__barline-spacer min-h-[2rem] flex-1" />}
          <div className={cn("measure__barline-display flex min-h-[72px]", ui.showSlashes ? "items-end" : "items-center")}>
            <Barline type={measure.barlineEnd} position="end" hasRepeat={measure.repeatEnd} />
          </div>
        </div>
      </div>
      {ui.showDynamics && (
        <div className="measure__dynamics-row flex gap-0.5 px-1 min-h-[16px]">
          {visibleBeats.map(({ beat }) => (
            <div
              key={`dyn-${beat.id}`}
              className={cn("measure__dynamic text-xs text-center text-orange-600 font-medium", beat.division === "quarterTriplet" ? "flex-[2]" : "flex-1")}
            >
              {beat.dynamics}
            </div>
          ))}
        </div>
      )}
      {ui.showLyrics && (
        <div className="measure__lyrics-row flex gap-0.5 px-1 min-h-[16px]">
          {visibleBeats.map(({ beat }) => (
            <div
              key={`lyr-${beat.id}`}
              className={cn("measure__lyric text-xs text-center text-muted-foreground", beat.division === "quarterTriplet" ? "flex-[2]" : "flex-1")}
            >
              {beat.lyrics}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
