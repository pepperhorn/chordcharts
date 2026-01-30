import React from "react";
import { useChartStore } from "@/lib/store";
import { useKeyboardNavigation } from "@/lib/useKeyboardNavigation";
import { DIVISIONS } from "@/lib/constants";
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

interface ChordChartEditorProps {
  className?: string;
  initialChart?: string;
}

export function ChordChartEditor({ className, initialChart }: ChordChartEditorProps) {
  const { importJSON, setSelection, ui, undo, redo, setBeatDivision } = useChartStore();

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

      // 1–5: subdivision when no letter has been typed; otherwise chord input (e.g. A5, Bm7#5)
      const division = DIVISION_KEYS[e.key];
      if (division) {
        const target = e.target as HTMLElement | null;
        const isChordInput = target?.getAttribute?.("data-toolbar-chord-input") != null;
        const isOtherInput = target && "closest" in target && (target as Element).closest?.("input, textarea, [contenteditable=true]");

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
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, setSelection, setBeatDivision]);

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
