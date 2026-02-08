import React from "react";
import { useChartStore } from "@/lib/store";
import { MeasureComponent } from "./MeasureComponent";
import { SectionHeader } from "./SectionHeader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChartCanvasProps {
  className?: string;
}

export function ChartCanvas({ className }: ChartCanvasProps) {
  const { chart, ui, reorderSections } = useChartStore();
  const { measuresPerLine } = chart.meta;
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, sectionIndex: number) => {
    setDraggedIndex(sectionIndex);
    e.dataTransfer.setData("text/plain", String(sectionIndex));
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setDragImage((e.target as HTMLElement).closest("section") ?? e.target as HTMLElement, 0, 0);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, sectionIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedIndex !== null) setDragOverIndex(sectionIndex);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (!Number.isNaN(fromIndex) && fromIndex !== toIndex) {
      reorderSections(fromIndex, toIndex);
    }
    setDraggedIndex(null);
  };

  return (
    <ScrollArea className={cn("flex-1 p-4", className)}>
      <div
        className="space-y-8"
        style={{ transform: `scale(${ui.zoom / 100})`, transformOrigin: "top left" }}
        role="region"
        aria-label="Chord chart canvas"
      >
        {chart.sections.map((section, sectionIndex) => (
          <section
            key={section.id}
            className={cn(
              "space-y-2 transition-colors",
              draggedIndex === sectionIndex && "opacity-50",
              dragOverIndex === sectionIndex && "ring-2 ring-primary ring-inset rounded"
            )}
            aria-label={`Section: ${section.name}. Drag to reorder.`}
            draggable
            onDragStart={(e) => handleDragStart(e, sectionIndex)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, sectionIndex)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, sectionIndex)}
          >
            <SectionHeader section={section} index={sectionIndex} />
            <div
              className="chart-canvas__measures grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${Math.min(measuresPerLine, 4)}, minmax(min-content, 1fr))`,
              }}
            >
              {section.measures.map((measure, measureIndex) => (
                <MeasureComponent
                  key={measure.id}
                  measure={measure}
                  sectionId={section.id}
                  measureIndex={measureIndex}
                  timeSignature={section.timeSignature}
                  showTimeSignature={measureIndex === 0}
                  isFirstInLine={measureIndex % measuresPerLine === 0}
                  isLastInLine={(measureIndex + 1) % measuresPerLine === 0}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </ScrollArea>
  );
}
