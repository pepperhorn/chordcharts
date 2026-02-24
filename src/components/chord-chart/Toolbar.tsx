import React from "react";
import { useChartStore } from "@/lib/store";
import { parseChord } from "@/lib/chordParser";
import type { Slash } from "@/lib/schema";
import { formatChord } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { ARTICULATIONS, ARTICULATION_LABELS, CHORD_QUALITIES } from "@/lib/constants";
import {
  Undo2,
  Redo2,
  Plus,
  ZoomIn,
  ZoomOut,
  Music,
  Type,
  AlignLeft,
  CornerDownRight,
  Download,
  Upload,
  Settings,
} from "lucide-react";

export function Toolbar() {
  const {
    ui,
    chart,
    addSection,
    undo,
    redo,
    canUndo,
    canRedo,
    setZoom,
    toggleShowSlashes,
    toggleShowDynamics,
    toggleShowLyrics,
    toggleShowInstructions,
    updateMeta,
    updateSlot,
    exportJSON,
    importJSON,
    setArticulationSize,
    toggleShowKeyboardShortcuts,
  } = useChartStore();

  const { selection } = ui;
  const selectedSection = selection ? chart.sections.find((s) => s.id === selection.sectionId) : null;
  const selectedMeasure =
    selectedSection && selection?.measureId
      ? selectedSection.measures.find((m) => m.id === selection.measureId)
      : null;
  const selectedBeat =
    selectedMeasure && selection?.beatId ? selectedMeasure.beats.find((b) => b.id === selection.beatId) : null;
  const selectedSlot =
    selectedBeat && selection?.slotId ? selectedBeat.slots.find((s) => s.id === selection.slotId) : null;

  const chordInputRef = React.useRef<HTMLInputElement>(null);
  const [chordInputValue, setChordInputValue] = React.useState("");

  React.useEffect(() => {
    if (selectedSlot && selection?.sectionId && selection?.measureId && selection?.beatId) {
      const isNashville = chart.meta.notationType === "nashville";
      const nextValue = isNashville && selectedSlot.nashvilleChord
        ? `${selectedSlot.nashvilleChord.degree}${selectedSlot.nashvilleChord.quality ? CHORD_QUALITIES.find((q) => q.value === selectedSlot.nashvilleChord!.quality)?.symbol ?? selectedSlot.nashvilleChord.quality : ""}`
        : selectedSlot.chord
          ? formatChord(selectedSlot.chord)
          : "";
      setChordInputValue(nextValue);
      requestAnimationFrame(() => chordInputRef.current?.focus());
    }
  }, [selectedSlot?.id, selection?.sectionId, selection?.measureId, selection?.beatId, selection?.slotId, chart.meta.notationType]);

  const applyChordFromInput = () => {
    if (!selectedSlot || !selection?.sectionId || !selection?.measureId || !selection?.beatId) return;
    const isNashville = chart.meta.notationType === "nashville";
    const result = parseChord(chordInputValue.trim(), isNashville);
    if (!result?.valid) return;
    if (result.chord) {
      updateSlot(selection.sectionId, selection.measureId, selection.beatId, selectedSlot.id, { chord: result.chord, nashvilleChord: null });
    }
    if (result.nashville) {
      updateSlot(selection.sectionId, selection.measureId, selection.beatId, selectedSlot.id, { nashvilleChord: result.nashville, chord: null });
    }
  };

  const handleExport = () => {
    const json = exportJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${chart.meta.title || "chart"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => importJSON(reader.result as string);
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <TooltipProvider>
      <div className="toolbar flex items-center gap-2 p-2 border-b bg-muted/30" role="toolbar" aria-label="Chart editor toolbar">
        <div className="toolbar__history flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="toolbar__undo-btn" variant="ghost" size="icon" onClick={undo} disabled={!canUndo()} aria-label="Undo">
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="toolbar__redo-btn" variant="ghost" size="icon" onClick={redo} disabled={!canRedo()} aria-label="Redo">
                <Redo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
          </Tooltip>
        </div>
        <Separator orientation="vertical" className="toolbar__separator h-6" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button className="toolbar__add-section-btn" variant="outline" size="sm" onClick={() => addSection()} aria-label="Add new section">
              <Plus className="h-4 w-4 mr-1" />
              Section
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add new section</TooltipContent>
        </Tooltip>
        <Separator orientation="vertical" className="toolbar__separator h-6" />
        <Select value={chart.meta.notationType} onValueChange={(v: "standard" | "nashville") => updateMeta({ notationType: v })}>
          <SelectTrigger className="toolbar__notation-type-select w-32" aria-label="Notation type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="nashville">Nashville</SelectItem>
          </SelectContent>
        </Select>
        <Select value={String(chart.meta.measuresPerLine)} onValueChange={(v) => updateMeta({ measuresPerLine: parseInt(v) })}>
          <SelectTrigger className="toolbar__measures-per-line-select w-24" aria-label="Measures per line">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[2, 3, 4, 5, 6, 8].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n} / line
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Separator orientation="vertical" className="toolbar__separator h-6" />
        <div className="toolbar__visibility-toggles flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="toolbar__toggle-slashes-btn"
                variant={ui.showSlashes ? "default" : "ghost"}
                size="icon"
                onClick={toggleShowSlashes}
                aria-label={ui.showSlashes ? "Hide slashes" : "Show slashes"}
                aria-pressed={ui.showSlashes}
              >
                <Music className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle rhythm slashes</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="toolbar__toggle-dynamics-btn"
                variant={ui.showDynamics ? "default" : "ghost"}
                size="icon"
                onClick={toggleShowDynamics}
                aria-label={ui.showDynamics ? "Hide dynamics" : "Show dynamics"}
                aria-pressed={ui.showDynamics}
              >
                <Type className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle dynamics</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="toolbar__toggle-lyrics-btn"
                variant={ui.showLyrics ? "default" : "ghost"}
                size="icon"
                onClick={toggleShowLyrics}
                aria-label={ui.showLyrics ? "Hide lyrics" : "Show lyrics"}
                aria-pressed={ui.showLyrics}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle lyrics</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="toolbar__toggle-instructions-btn"
                variant={ui.showInstructions ? "default" : "ghost"}
                size="icon"
                onClick={toggleShowInstructions}
                aria-label={ui.showInstructions ? "Hide instructions" : "Show instructions"}
                aria-pressed={ui.showInstructions}
              >
                <CornerDownRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle instructions</TooltipContent>
          </Tooltip>
        </div>
        {selectedSlot && selection?.sectionId && selection?.measureId && selection?.beatId && (
          <>
            <Separator orientation="vertical" className="toolbar__separator h-6" />
            <div className="toolbar__slot-editor flex items-center gap-2" role="group" aria-label="Selected slot">
              <span className="toolbar__chord-label text-sm text-muted-foreground whitespace-nowrap">Chord</span>
              <Input
                ref={chordInputRef}
                type="text"
                value={chordInputValue}
                onChange={(e) => setChordInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (['.', ',', ';', "'", 'x'].includes(e.key)) {
                    e.preventDefault();
                    return;
                  }
                  // Shift+B: toggle stem — prevent typing "B" and delegate to store
                  if (e.key === "B" && e.shiftKey) {
                    e.preventDefault();
                    const { chart: currentChart, ui: currentUi } = useChartStore.getState();
                    const sel = currentUi.selection;
                    if (sel?.sectionId && sel.measureId && sel.beatId) {
                      const beat = currentChart.sections
                        .find((s) => s.id === sel.sectionId)?.measures
                        .find((m) => m.id === sel.measureId)?.beats
                        .find((b) => b.id === sel.beatId);
                      if (beat?.division === "quarter") {
                        const slot = beat.slots[0];
                        if (slot) {
                          updateSlot(sel.sectionId, sel.measureId, sel.beatId, slot.id, {
                            slash: { ...slot.slash, stem: !slot.slash.stem },
                          });
                        }
                      }
                    }
                    return;
                  }
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyChordFromInput();
                  }
                }}
                placeholder={chart.meta.notationType === "nashville" ? "e.g. 4m7" : "e.g. Am7"}
                className="toolbar__chord-input w-24 font-petaluma text-sm h-8"
                aria-label="Type chord for selected slot (press Enter to apply)"
                data-toolbar-chord-input
              />
              <span className="toolbar__articulation-label text-sm text-muted-foreground whitespace-nowrap">Artic.</span>
              <Select
                value={selectedSlot.slash.articulation}
                onValueChange={(v) => {
                  const newArtic = v as Slash["articulation"];
                  const isQuarter = selectedBeat?.division === "quarter";
                  updateSlot(selection.sectionId!, selection.measureId!, selection.beatId!, selectedSlot.id, {
                    slash: {
                      ...selectedSlot.slash,
                      articulation: newArtic,
                      ...(isQuarter && newArtic !== "none" ? { stem: true } : {}),
                    },
                  });
                }}
              >
                <SelectTrigger className="toolbar__articulation-select w-24 h-8" aria-label="Articulation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ARTICULATIONS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {ARTICULATION_LABELS[a] ?? a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
        <Separator orientation="vertical" className="toolbar__separator h-6" />
        <div className="toolbar__zoom flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="toolbar__zoom-out-btn" variant="ghost" size="icon" onClick={() => setZoom(ui.zoom - 10)} disabled={ui.zoom <= 50} aria-label="Zoom out">
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom out</TooltipContent>
          </Tooltip>
          <span className="toolbar__zoom-level text-sm w-12 text-center" aria-label={`Zoom level: ${ui.zoom}%`}>
            {ui.zoom}%
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="toolbar__zoom-in-btn" variant="ghost" size="icon" onClick={() => setZoom(ui.zoom + 10)} disabled={ui.zoom >= 200} aria-label="Zoom in">
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom in</TooltipContent>
          </Tooltip>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className="toolbar__division-shortcuts flex items-center gap-1.5 px-1 text-muted-foreground"
              aria-label="Division shortcuts: 1 Quarter, 2 Eighth, 3 Triplet, 4 Sixteenth, 5 Sixteenth triplet"
            >
              {[
                { key: "1", note: "♩" },
                { key: "2", note: "♪" },
                { key: "3", note: "♪₃" },
                { key: "4", note: "♬" },
                { key: "5", note: "♬₃" },
              ].map(({ key: k, note }) => (
                <span key={k} className="toolbar__division-shortcut flex items-center gap-0.5">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    className="toolbar__division-key-icon inline-block flex-shrink-0"
                    aria-hidden
                  >
                    <rect
                      x="1"
                      y="1"
                      width="16"
                      height="16"
                      rx="3"
                      ry="3"
                      fill="currentColor"
                      opacity="0.1"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeOpacity="0.5"
                    />
                    <text
                      x="9"
                      y="12.5"
                      textAnchor="middle"
                      className="text-[10px] font-semibold fill-current"
                    >
                      {k}
                    </text>
                  </svg>
                  <span className="toolbar__division-note font-petaluma text-sm leading-none" aria-hidden>
                    {note}
                  </span>
                </span>
              ))}
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            With a beat selected, press 1–5 to set subdivision (slash count).
          </TooltipContent>
        </Tooltip>
        <div className="toolbar__spacer flex-1" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button className="toolbar__import-btn" variant="outline" size="icon" onClick={handleImport} aria-label="Import chart">
              <Upload className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Import JSON</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button className="toolbar__export-btn" variant="outline" size="icon" onClick={handleExport} aria-label="Export chart">
              <Download className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export JSON</TooltipContent>
        </Tooltip>
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button className="toolbar__settings-btn" variant="outline" size="icon" aria-label="Settings">
                  <Settings className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>Settings</TooltipContent>
          </Tooltip>
          <PopoverContent className="w-56" align="end">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Articulation Size</Label>
                <Select value={ui.articulationSize} onValueChange={(v: "sm" | "md" | "lg" | "xl") => setArticulationSize(v)}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm">Small (70%)</SelectItem>
                    <SelectItem value="md">Medium (75%)</SelectItem>
                    <SelectItem value="lg">Large (80%)</SelectItem>
                    <SelectItem value="xl">Extra Large (90%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Keyboard Shortcuts</Label>
                <Button
                  variant={ui.showKeyboardShortcuts ? "default" : "ghost"}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={toggleShowKeyboardShortcuts}
                >
                  {ui.showKeyboardShortcuts ? "Shown" : "Hidden"}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </TooltipProvider>
  );
}
