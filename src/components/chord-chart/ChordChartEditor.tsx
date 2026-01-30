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
  const selection = ui.selection;

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

      // 1–5: set beat division when a beat/slot is selected (skip when typing in an input)
      const target = e.target as Node;
      const isInput = target && "closest" in target && (target as Element).closest?.("input, textarea, [contenteditable=true]");
      if (!isInput && selection?.sectionId && selection.measureId && selection.beatId) {
        const division = DIVISION_KEYS[e.key];
        if (division) {
          e.preventDefault();
          setBeatDivision(selection.sectionId, selection.measureId, selection.beatId, division);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, setSelection, setBeatDivision, selection]);

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
