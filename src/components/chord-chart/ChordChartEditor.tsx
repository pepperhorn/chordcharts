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
  const { importJSON, setSelection, ui, undo, redo, setBeatDivision, updateSlot } = useChartStore();

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

      // 1–5: subdivision when no letter has been typed; otherwise chord input (e.g. A5, Bm7#5)
      const division = DIVISION_KEYS[e.key];
      if (division) {
        if (isChordInput) {
          const value = (target as HTMLInputElement).value ?? "";
          const hasLetter = /[a-zA-Z]/.test(value);
          if (!hasLetter) {
            const { ui: currentUi } = useChartStore.getState();
            const sel = currentUi.selection;
            if (sel?.sectionId && sel.measureId && sel.beatId) {
              e.preventDefault();
              setBeatDivision(sel.sectionId, sel.measureId, sel.beatId, division);
            }
          }
        } else if (!isOtherInput) {
          const { ui: currentUi } = useChartStore.getState();
          const sel = currentUi.selection;
          if (sel?.sectionId && sel.measureId && sel.beatId) {
            e.preventDefault();
            setBeatDivision(sel.sectionId, sel.measureId, sel.beatId, division);
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
        if (sel?.sectionId && sel.measureId && sel.beatId && sel.slotId) {
          e.preventDefault();
          const section = currentChart.sections.find((s) => s.id === sel.sectionId);
          const measure = section?.measures.find((m) => m.id === sel.measureId);
          const beat = measure?.beats.find((b) => b.id === sel.beatId);
          const slot = beat?.slots.find((s) => s.id === sel.slotId);
          if (slot) {
            updateSlot(sel.sectionId, sel.measureId, sel.beatId, sel.slotId, {
              slash: { ...slot.slash, articulation: toggleArticulation(slot.slash.articulation, articulationKey) },
            });
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, setSelection, setBeatDivision, updateSlot]);

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
