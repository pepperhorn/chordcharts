import React from "react";
import { useChartStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
    exportJSON,
    importJSON,
  } = useChartStore();

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
      <div className="flex items-center gap-2 p-2 border-b bg-background" role="toolbar" aria-label="Chart editor toolbar">
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo()} aria-label="Undo">
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo()} aria-label="Redo">
                <Redo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
          </Tooltip>
        </div>
        <Separator orientation="vertical" className="h-6" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" onClick={() => addSection()} aria-label="Add new section">
              <Plus className="h-4 w-4 mr-1" />
              Section
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add new section</TooltipContent>
        </Tooltip>
        <Separator orientation="vertical" className="h-6" />
        <Select value={chart.meta.notationType} onValueChange={(v: "standard" | "nashville") => updateMeta({ notationType: v })}>
          <SelectTrigger className="w-32" aria-label="Notation type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="nashville">Nashville</SelectItem>
          </SelectContent>
        </Select>
        <Select value={String(chart.meta.measuresPerLine)} onValueChange={(v) => updateMeta({ measuresPerLine: parseInt(v) })}>
          <SelectTrigger className="w-24" aria-label="Measures per line">
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
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
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
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setZoom(ui.zoom - 10)} disabled={ui.zoom <= 50} aria-label="Zoom out">
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom out</TooltipContent>
          </Tooltip>
          <span className="text-sm w-12 text-center" aria-label={`Zoom level: ${ui.zoom}%`}>
            {ui.zoom}%
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setZoom(ui.zoom + 10)} disabled={ui.zoom >= 200} aria-label="Zoom in">
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom in</TooltipContent>
          </Tooltip>
        </div>
        <div className="flex-1" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={handleImport} aria-label="Import chart">
              <Upload className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Import JSON</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={handleExport} aria-label="Export chart">
              <Download className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export JSON</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
