import React from "react";
import { useChartStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChordInput } from "./ChordInput";
import { TIME_SIGNATURES, DIVISIONS, ARTICULATIONS, DYNAMICS } from "@/lib/constants";
import { PanelLeftClose, PanelLeftOpen, Music, MousePointer2, Keyboard } from "lucide-react";

export function PropertiesPanel() {
  const { ui, chart, updateMeta, updateSection, updateMeasure, updateBeat, setBeatDivision, updateSlot } =
    useChartStore();
  const { selection } = ui;
  const [collapsed, setCollapsed] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("chart");

  const selectedSection = selection ? chart.sections.find((s) => s.id === selection.sectionId) : null;
  const selectedMeasure =
    selectedSection && selection?.measureId
      ? selectedSection.measures.find((m) => m.id === selection.measureId)
      : null;
  const selectedBeat =
    selectedMeasure && selection?.beatId ? selectedMeasure.beats.find((b) => b.id === selection.beatId) : null;
  const selectedSlot =
    selectedBeat && selection?.slotId ? selectedBeat.slots.find((s) => s.id === selection.slotId) : null;

  if (collapsed) {
    return (
      <div className="w-10 border-r bg-muted/50 flex flex-col items-center py-2 gap-1" role="complementary" aria-label="Properties panel (collapsed)">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCollapsed(false)} aria-label="Open properties panel">
                <PanelLeftOpen className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Open panel</TooltipContent>
          </Tooltip>
          <Separator className="w-6 my-1" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTab === "chart" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => { setActiveTab("chart"); setCollapsed(false); }}
                aria-label="Chart properties"
              >
                <Music className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Chart</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTab === "selection" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => { setActiveTab("selection"); setCollapsed(false); }}
                aria-label="Selection properties"
              >
                <MousePointer2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Selection</TooltipContent>
          </Tooltip>
          <Separator className="w-6 my-1" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 cursor-default" aria-label="Keyboard shortcuts">
                <Keyboard className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="p-3">
              <p className="text-xs font-semibold mb-2">Keyboard Shortcuts</p>
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
                <kbd className="font-mono bg-muted px-1 rounded">1–5</kbd><span>Beat division</span>
                <kbd className="font-mono bg-muted px-1 rounded">.</kbd><span>Staccato</span>
                <kbd className="font-mono bg-muted px-1 rounded">,</kbd><span>Marcato</span>
                <kbd className="font-mono bg-muted px-1 rounded">;</kbd><span>Accent</span>
                <kbd className="font-mono bg-muted px-1 rounded">'</kbd><span>Legato</span>
                <kbd className="font-mono bg-muted px-1 rounded">⌘Z</kbd><span>Undo</span>
                <kbd className="font-mono bg-muted px-1 rounded">⌘Y</kbd><span>Redo</span>
                <kbd className="font-mono bg-muted px-1 rounded">Esc</kbd><span>Deselect</span>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className="w-72 border-r bg-muted/50 flex flex-col" role="complementary" aria-label="Properties panel">
      <div className="p-3 border-b flex items-center justify-between">
        <h2 className="font-semibold">Properties</h2>
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCollapsed(true)} aria-label="Close properties panel">
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Close panel</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <ScrollArea className="flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-3">
          <TabsList className="w-full">
            <TabsTrigger value="chart" className="flex-1">Chart</TabsTrigger>
            <TabsTrigger value="selection" className="flex-1">Selection</TabsTrigger>
          </TabsList>
          <TabsContent value="chart" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="chart-title">Title</Label>
              <Input id="chart-title" value={chart.meta.title} onChange={(e) => updateMeta({ title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chart-composer">Composer</Label>
              <Input id="chart-composer" value={chart.meta.composer} onChange={(e) => updateMeta({ composer: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="chart-key">Key</Label>
                <Input id="chart-key" value={chart.meta.key} onChange={(e) => updateMeta({ key: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chart-tempo">Tempo</Label>
                <Input id="chart-tempo" type="number" value={chart.meta.tempo} onChange={(e) => updateMeta({ tempo: parseInt(e.target.value) || 120 })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="chart-tempo-text">Tempo Text</Label>
              <Input id="chart-tempo-text" value={chart.meta.tempoText} onChange={(e) => updateMeta({ tempoText: e.target.value })} placeholder="e.g., Moderato" />
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Keyboard className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Keyboard Shortcuts</span>
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <kbd className="font-mono bg-muted px-1 rounded text-foreground">1–5</kbd><span>Beat division</span>
                <kbd className="font-mono bg-muted px-1 rounded text-foreground">.</kbd><span>Staccato</span>
                <kbd className="font-mono bg-muted px-1 rounded text-foreground">,</kbd><span>Marcato</span>
                <kbd className="font-mono bg-muted px-1 rounded text-foreground">;</kbd><span>Accent</span>
                <kbd className="font-mono bg-muted px-1 rounded text-foreground">'</kbd><span>Legato</span>
                <kbd className="font-mono bg-muted px-1 rounded text-foreground">⌘Z / ⌘Y</kbd><span>Undo / Redo</span>
                <kbd className="font-mono bg-muted px-1 rounded text-foreground">Esc</kbd><span>Deselect</span>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="selection" className="space-y-4 mt-4">
            {!selection && <p className="text-sm text-muted-foreground">Select a measure, beat, or slot to edit.</p>}
            {selectedSection && (
              <div className="space-y-4 border-b pb-4">
                <h3 className="text-sm font-medium">Section</h3>
                <div className="space-y-2">
                  <Label>Time Signature</Label>
                  <Select
                    value={`${selectedSection.timeSignature.beats}/${selectedSection.timeSignature.beatUnit}`}
                    onValueChange={(v) => {
                      const [beats, beatUnit] = v.split("/").map(Number);
                      updateSection(selectedSection.id, { timeSignature: { beats, beatUnit } });
                    }}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TIME_SIGNATURES.map((ts) => <SelectItem key={ts.label} value={ts.label}>{ts.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            {selectedMeasure && selection?.sectionId && (
              <div className="space-y-4 border-b pb-4">
                <h3 className="text-sm font-medium">Measure</h3>
                <div className="space-y-2">
                  <Label>Instruction</Label>
                  <Input value={selectedMeasure.instruction ?? ""} onChange={(e) => updateMeasure(selection.sectionId, selectedMeasure.id, { instruction: e.target.value || null })} placeholder="e.g., Guitar solo" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Start Barline</Label>
                    <Select value={selectedMeasure.barlineStart} onValueChange={(v: "single" | "double" | "repeatStart") => updateMeasure(selection.sectionId, selectedMeasure.id, { barlineStart: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="double">Double</SelectItem>
                        <SelectItem value="repeatStart">Repeat Start</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>End Barline</Label>
                    <Select value={selectedMeasure.barlineEnd} onValueChange={(v: "single" | "double" | "final" | "repeatEnd") => updateMeasure(selection.sectionId, selectedMeasure.id, { barlineEnd: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="double">Double</SelectItem>
                        <SelectItem value="final">Final</SelectItem>
                        <SelectItem value="repeatEnd">Repeat End</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Ending</Label>
                  <Select value={selectedMeasure.ending?.toString() ?? "none"} onValueChange={(v) => updateMeasure(selection.sectionId, selectedMeasure.id, { ending: v === "none" ? null : parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="1">1st</SelectItem>
                      <SelectItem value="2">2nd</SelectItem>
                      <SelectItem value="3">3rd</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            {selectedBeat && selection?.sectionId && selection?.measureId && (
              <div className="space-y-4 border-b pb-4">
                <h3 className="text-sm font-medium">Beat</h3>
                <div className="space-y-2">
                  <Label>Division</Label>
                  <Select value={selectedBeat.division} onValueChange={(v: keyof typeof DIVISIONS) => setBeatDivision(selection.sectionId, selection.measureId!, selectedBeat.id, v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(DIVISIONS).map(([key, val]) => <SelectItem key={key} value={key}>{val.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Dynamics</Label>
                  <Select value={selectedBeat.dynamics ?? "none"} onValueChange={(v) => updateBeat(selection.sectionId, selection.measureId!, selectedBeat.id, { dynamics: v === "none" ? null : v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {DYNAMICS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Lyrics</Label>
                  <Input value={selectedBeat.lyrics ?? ""} onChange={(e) => updateBeat(selection.sectionId, selection.measureId!, selectedBeat.id, { lyrics: e.target.value || null })} placeholder="Lyrics" />
                </div>
              </div>
            )}
            {selectedSlot && selection?.sectionId && selection?.measureId && selection?.beatId && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Slot</h3>
                <div className="space-y-2">
                  <Label>Chord</Label>
                  <ChordInput
                    currentChord={selectedSlot.chord}
                    currentNashville={selectedSlot.nashvilleChord}
                    onChordChange={(chord) => updateSlot(selection.sectionId, selection.measureId!, selection.beatId!, selectedSlot.id, { chord })}
                    onNashvilleChange={(chord) => updateSlot(selection.sectionId, selection.measureId!, selection.beatId!, selectedSlot.id, { nashvilleChord: chord })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Articulation</Label>
                  <Select value={selectedSlot.slash.articulation} onValueChange={(v: "none" | "accent" | "staccato" | "marcato" | "legato") => updateSlot(selection.sectionId, selection.measureId!, selection.beatId!, selectedSlot.id, { slash: { ...selectedSlot.slash, articulation: v } })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ARTICULATIONS.map((a) => <SelectItem key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  );
}
