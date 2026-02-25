import { useCallback, useEffect } from "react";
import { useChartStore } from "./store";

export function useKeyboardNavigation() {
  const chart = useChartStore((s) => s.chart);
  const ui = useChartStore((s) => s.ui);
  const setSelection = useChartStore((s) => s.setSelection);
  const selection = ui.selection;

  const findSelectionIndices = useCallback(() => {
    if (!selection) return null;
    const sectionIndex = chart.sections.findIndex((s) => s.id === selection.sectionId);
    if (sectionIndex === -1) return null;
    const section = chart.sections[sectionIndex];
    const measureIndex = selection.measureId !== undefined ? section.measures.findIndex((m) => m.id === selection.measureId) : -1;
    const measure = measureIndex >= 0 ? section.measures[measureIndex] : null;
    const beatIndex = selection.beatId && measure ? measure.beats.findIndex((b) => b.id === selection.beatId) : -1;
    const beat = beatIndex >= 0 && measure ? measure.beats[beatIndex] : null;
    const slotIndex = selection.slotId && beat ? beat.slots.findIndex((s) => s.id === selection.slotId) : -1;
    return { sectionIndex, measureIndex, beatIndex, slotIndex };
  }, [chart, selection]);

  const navigateToSlot = useCallback((sectionIdx: number, measureIdx: number, beatIdx: number, slotIdx: number) => {
    const section = chart.sections[sectionIdx];
    if (!section) return;
    const measure = section.measures[measureIdx];
    if (!measure) return;
    const beat = measure.beats[beatIdx];
    if (!beat) return;
    const slot = beat.slots[slotIdx];
    if (!slot) return;
    setSelection({ type: "slot", sectionId: section.id, measureId: measure.id, beatId: beat.id, slotId: slot.id });
  }, [chart, setSelection]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!selection) return;
    const indices = findSelectionIndices();
    if (!indices) return;
    const { sectionIndex, measureIndex, beatIndex, slotIndex } = indices;
    const section = chart.sections[sectionIndex];
    const measure = measureIndex >= 0 ? section.measures[measureIndex] : null;
    const beat = beatIndex >= 0 && measure ? measure.beats[beatIndex] : null;

    // Skip beats that are consumed/disabled by special divisions:
    // - quarterTriplet consumes the next beat
    // - whole consumes all beats after beat 0
    const isConsumedBeat = (m: typeof measure, idx: number) => {
      if (!m || idx <= 0) return false;
      if (m.beats[0]?.division === "whole" && idx > 0) return true;
      if (m.beats[idx - 1]?.division === "quarterTriplet") return true;
      return false;
    };

    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        if (selection.type === "slot" && beat && slotIndex < beat.slots.length - 1) {
          navigateToSlot(sectionIndex, measureIndex, beatIndex, slotIndex + 1);
        } else if (measure && beatIndex < measure.beats.length - 1) {
          // Skip consumed beats
          let nextBeat = beatIndex + 1;
          while (nextBeat < measure.beats.length && isConsumedBeat(measure, nextBeat)) nextBeat++;
          if (nextBeat < measure.beats.length) {
            navigateToSlot(sectionIndex, measureIndex, nextBeat, 0);
          } else if (section && measureIndex < section.measures.length - 1) {
            navigateToSlot(sectionIndex, measureIndex + 1, 0, 0);
          }
        } else if (section && measureIndex < section.measures.length - 1) {
          navigateToSlot(sectionIndex, measureIndex + 1, 0, 0);
        }
        break;
      case "ArrowLeft":
        e.preventDefault();
        if (selection.type === "slot" && slotIndex > 0) {
          navigateToSlot(sectionIndex, measureIndex, beatIndex, slotIndex - 1);
        } else if (beatIndex > 0 && measure) {
          // Skip consumed beats
          let prevBeatIdx = beatIndex - 1;
          while (prevBeatIdx > 0 && isConsumedBeat(measure, prevBeatIdx)) prevBeatIdx--;
          const prevBeat = measure.beats[prevBeatIdx];
          navigateToSlot(sectionIndex, measureIndex, prevBeatIdx, prevBeat.slots.length - 1);
        } else if (measureIndex > 0) {
          const prevMeasure = section.measures[measureIndex - 1];
          // Find last non-consumed beat
          let lastBeatIdx = prevMeasure.beats.length - 1;
          while (lastBeatIdx > 0 && isConsumedBeat(prevMeasure, lastBeatIdx)) lastBeatIdx--;
          const lastBeat = prevMeasure.beats[lastBeatIdx];
          navigateToSlot(sectionIndex, measureIndex - 1, lastBeatIdx, lastBeat.slots.length - 1);
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (sectionIndex > 0) {
          const prevSection = chart.sections[sectionIndex - 1];
          const targetMeasure = Math.min(measureIndex, prevSection.measures.length - 1);
          navigateToSlot(sectionIndex - 1, targetMeasure, 0, 0);
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (sectionIndex < chart.sections.length - 1) {
          const nextSection = chart.sections[sectionIndex + 1];
          const targetMeasure = Math.min(measureIndex, nextSection.measures.length - 1);
          navigateToSlot(sectionIndex + 1, targetMeasure, 0, 0);
        }
        break;
    }
  }, [chart, selection, findSelectionIndices, navigateToSlot]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
