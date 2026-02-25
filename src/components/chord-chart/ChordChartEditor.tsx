import React from "react";
import { useChartStore } from "@/lib/store";
import { useKeyboardNavigation } from "@/lib/useKeyboardNavigation";
import { DIVISIONS } from "@/lib/constants";
import type { Slash } from "@/lib/schema";
import { Toolbar } from "./Toolbar";
import { ChartCanvas } from "./ChartCanvas";
import { PropertiesPanel } from "./PropertiesPanel";
import { cn } from "@/lib/utils";

const DIVISION_KEYS: Record<string, keyof typeof DIVISIONS> = {
  "1": "quarter",
  "2": "eighth",
  "3": "eighthTriplet",
  "4": "sixteenth",
  "5": "sixteenthTriplet",
  "7": "quarterTriplet",
  "8": "half",
  "9": "whole",
};

const ARTICULATION_KEYS: Record<string, "staccato" | "marcato" | "accent" | "legato"> = {
  ".": "staccato",
  ",": "marcato",
  ";": "accent",
  "'": "legato",
};

/**
 * Toggles a single articulation component on/off within the compound value.
 * Below marks: staccato | legato (mutually exclusive — never both).
 * Above marks: marcato | accent (mutually exclusive).
 * Pressing a mark that conflicts with the current below mark replaces it.
 */
function toggleArticulation(
  current: string,
  key: "staccato" | "marcato" | "accent" | "legato",
): Slash["articulation"] {
  let below: "staccato" | "legato" | null =
    current.includes("staccato") ? "staccato" : current.includes("legato") ? "legato" : null;
  let above: "marcato" | "accent" | null =
    current.includes("marcato") ? "marcato" : current.includes("accent") ? "accent" : null;

  switch (key) {
    case "staccato": below = below === "staccato" ? null : "staccato"; break;
    case "legato":   below = below === "legato"   ? null : "legato";   break;
    case "marcato":  above = above === "marcato"  ? null : "marcato";  break;
    case "accent":   above = above === "accent"   ? null : "accent";   break;
  }

  if (below === "staccato" && above === "marcato") return "staccato-marcato";
  if (below === "staccato" && above === "accent")  return "staccato-accent";
  if (below === "legato"   && above === "marcato") return "legato-marcato";
  if (below === "legato"   && above === "accent")  return "legato-accent";
  if (below === "staccato") return "staccato";
  if (below === "legato")   return "legato";
  if (above === "marcato")  return "marcato";
  if (above === "accent")   return "accent";
  return "none";
}

interface ChordChartEditorProps {
  className?: string;
  initialChart?: string;
}

export function ChordChartEditor({ className, initialChart }: ChordChartEditorProps) {
  const { importJSON, setSelection, ui, undo, redo, setBeatDivision, updateSlot, updateBeat } = useChartStore();

  // Enable arrow key navigation through chart elements
  useKeyboardNavigation();

  React.useEffect(() => {
    if (initialChart) importJSON(initialChart);
  }, [initialChart, importJSON]);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", ui.theme);
  }, [ui.theme]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      if (e.key === "Escape") setSelection(null);

      const target = e.target as HTMLElement | null;
      const isChordInput = target?.getAttribute?.("data-toolbar-chord-input") != null;
      const isOtherInput = !isChordInput && target && "closest" in target && (target as Element).closest?.("input, textarea, [contenteditable=true]");

      // 1–5, 7–9: subdivision when no letter has been typed; otherwise chord input (e.g. A5, Bm7#5)
      // Key 9 (whole) always targets beat[0]. Keys 1–8 on beats 1+ when beat[0] is whole → unlock beat[0].
      const division = DIVISION_KEYS[e.key];
      if (division) {
        const shouldAct = isChordInput
          ? !/[a-zA-Z]/.test((target as HTMLInputElement).value ?? "")
          : !isOtherInput;
        if (shouldAct) {
          const { ui: currentUi, chart: currentChart } = useChartStore.getState();
          const sel = currentUi.selection;
          if (sel?.sectionId && sel.measureId && sel.beatId) {
            const section = currentChart.sections.find((s) => s.id === sel.sectionId);
            const measure = section?.measures.find((m) => m.id === sel.measureId);
            if (measure) {
              e.preventDefault();
              const beat0 = measure.beats[0];
              const selectedBeatIndex = measure.beats.findIndex((b) => b.id === sel.beatId);
              if (division === "whole") {
                // Whole always targets beat[0] regardless of selection
                setBeatDivision(sel.sectionId, sel.measureId, beat0.id, "whole");
              } else if (beat0.division === "whole" && selectedBeatIndex > 0) {
                // Beats 1+ are locked while beat[0] is whole; any division key unlocks (reverts to quarter)
                setBeatDivision(sel.sectionId, sel.measureId, beat0.id, "quarter");
              } else {
                setBeatDivision(sel.sectionId, sel.measureId, sel.beatId, division);
              }
            }
          }
        }
      }

      // . , ; ' — articulation shortcuts (slot must be selected, not in a generic input)
      // isChordInput is excluded from the guard: the toolbar chord input auto-focuses on slot
      // selection, so these keys arrive there. They are already filtered from the input itself
      // (e.preventDefault in onKeyDown) so it is safe to apply the articulation anyway.
      const articulationKey = ARTICULATION_KEYS[e.key];
      if (articulationKey && !isOtherInput) {
        const { ui: currentUi, chart: currentChart } = useChartStore.getState();
        const sel = currentUi.selection;
        if (sel?.sectionId && sel.measureId && sel.beatId) {
          const section = currentChart.sections.find((s) => s.id === sel.sectionId);
          const measure = section?.measures.find((m) => m.id === sel.measureId);
          const beat = measure?.beats.find((b) => b.id === sel.beatId);
          // Use selected slot if available, otherwise fall back to beat's first slot
          const slot = beat?.slots.find((s) => s.id === sel.slotId) ?? beat?.slots[0];
          if (beat && slot) {
            e.preventDefault();
            const newArtic = toggleArticulation(slot.slash.articulation, articulationKey);
            const isQuarter = beat.division === "quarter";
            updateSlot(sel.sectionId, sel.measureId, sel.beatId, slot.id, {
              slash: {
                ...slot.slash,
                articulation: newArtic,
                ...(isQuarter && newArtic !== "none" ? { stem: true } : {}),
              },
            });
          }
        }
      }

      // 0 — toggle rest on selected slot (same chord-input guard as division keys)
      if (e.key === "0") {
        const shouldAct = isChordInput
          ? !/[a-zA-Z]/.test((target as HTMLInputElement).value ?? "")
          : !isOtherInput;
        if (shouldAct) {
          const { ui: currentUi, chart: currentChart } = useChartStore.getState();
          const sel = currentUi.selection;
          if (sel?.sectionId && sel.measureId && sel.beatId) {
            const section = currentChart.sections.find((s) => s.id === sel.sectionId);
            const measure = section?.measures.find((m) => m.id === sel.measureId);
            const beat = measure?.beats.find((b) => b.id === sel.beatId);
            if (beat) {
              e.preventDefault();
              if (sel.slotId || beat.slots.length === 1) {
                // Specific slot selected, or single-slot beat: toggle that slot
                const slot = (sel.slotId ? beat.slots.find((s) => s.id === sel.slotId) : beat.slots[0]);
                if (slot) {
                  updateSlot(sel.sectionId, sel.measureId, sel.beatId, slot.id, {
                    slash: { ...slot.slash, rest: !slot.slash.rest },
                  });
                }
              } else {
                // Multi-slot beat with no slot selected: toggle all
                const newRest = !beat.slots[0]?.slash.rest;
                updateBeat(sel.sectionId, sel.measureId, sel.beatId, {
                  slots: beat.slots.map(slot => ({
                    ...slot,
                    slash: { ...slot.slash, rest: newRest },
                  })),
                });
              }
            }
          }
        }
      }

      // Ctrl/Cmd+B — toggle stem on selected quarter or half beat
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        const { ui: currentUi, chart: currentChart } = useChartStore.getState();
        const sel = currentUi.selection;
        if (sel?.sectionId && sel.measureId && sel.beatId) {
          const section = currentChart.sections.find((s) => s.id === sel.sectionId);
          const measure = section?.measures.find((m) => m.id === sel.measureId);
          const beat = measure?.beats.find((b) => b.id === sel.beatId);
          if (beat?.division === "quarter" || beat?.division === "half") {
            e.preventDefault();
            const slot = beat.slots[0];
            if (slot) {
              updateSlot(sel.sectionId, sel.measureId, sel.beatId, slot.id, {
                slash: { ...slot.slash, stem: !slot.slash.stem },
              });
            }
          }
        }
      }

      // ] — toggle tie on selected slot
      if (e.key === "]" && !isOtherInput) {
        const { ui: currentUi, chart: currentChart } = useChartStore.getState();
        const sel = currentUi.selection;
        if (sel?.sectionId && sel.measureId && sel.beatId) {
          const section = currentChart.sections.find((s) => s.id === sel.sectionId);
          const measure = section?.measures.find((m) => m.id === sel.measureId);
          const beat = measure?.beats.find((b) => b.id === sel.beatId);
          const slot = beat?.slots.find((s) => s.id === sel.slotId) ?? beat?.slots[0];
          if (beat && slot) {
            e.preventDefault();
            updateSlot(sel.sectionId, sel.measureId, sel.beatId, slot.id, {
              slash: { ...slot.slash, tied: !slot.slash.tied },
            });
          }
        }
      }

      // Ctrl/Cmd+X — flip stem direction on selected beat (all divisions)
      if ((e.ctrlKey || e.metaKey) && e.key === "x") {
        const { ui: currentUi, chart: currentChart } = useChartStore.getState();
        const sel = currentUi.selection;
        if (sel?.sectionId && sel.measureId && sel.beatId) {
          const section = currentChart.sections.find((s) => s.id === sel.sectionId);
          const measure = section?.measures.find((m) => m.id === sel.measureId);
          const beat = measure?.beats.find((b) => b.id === sel.beatId);
          if (beat && beat.division !== "whole") {
            e.preventDefault();
            if (beat.division === "quarter" || beat.division === "half") {
              // Single-slot: flip the selected (or first) slot
              const slot = sel.slotId ? beat.slots.find((s) => s.id === sel.slotId) : beat.slots[0];
              if (slot) {
                updateSlot(sel.sectionId, sel.measureId, sel.beatId, slot.id, {
                  slash: { ...slot.slash, stemDirection: slot.slash.stemDirection === "up" ? "down" : "up" },
                });
              }
            } else {
              // Multi-slot (beamed, quarterTriplet): flip all slots in one history entry
              const newDir = (beat.slots[0]?.slash.stemDirection ?? "down") === "up" ? "down" : "up";
              updateBeat(sel.sectionId, sel.measureId, sel.beatId, {
                slots: beat.slots.map(slot => ({
                  ...slot,
                  slash: { ...slot.slash, stemDirection: newDir },
                })),
              });
            }
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, setSelection, setBeatDivision, updateSlot, updateBeat]);

  return (
    <div
      className={cn("flex flex-col h-full bg-background text-foreground chord-chart-editor", className)}
      role="application"
      aria-label="Chord Chart Editor"
    >
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <PropertiesPanel />
        <ChartCanvas className="flex-1" />
      </div>
    </div>
  );
}
