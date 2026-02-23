import React from "react";
import { useChartStore } from "@/lib/store";
import type { Section } from "@/lib/schema";
import { MeasureComponent } from "./MeasureComponent";
import { SectionHeader } from "./SectionHeader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, measureMinWidth, isMeasureSimple } from "@/lib/utils";

interface ChartCanvasProps {
  className?: string;
}

/**
 * Renders the flex-wrapped measures for a single section and detects which
 * measures visually start a new line, so that only those receive a start barline.
 * Uses a ResizeObserver on the flex container and compares offsetTop values
 * (layout-flow positions, unaffected by CSS transform zoom).
 */
function SectionMeasures({ section, effectiveN }: { section: Section; effectiveN: number }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  // Start with the first measure pre-marked; ResizeObserver corrects the rest after layout.
  const [lineStartIds, setLineStartIds] = React.useState<ReadonlySet<string>>(
    () => new Set(section.measures.length > 0 ? [section.measures[0].id] : [])
  );

  React.useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const compute = () => {
      const children = Array.from(container.children) as HTMLElement[];
      const starts = new Set<string>();
      let prevTop = -Infinity;
      children.forEach((el) => {
        // offsetTop is layout-flow position — not affected by ancestor CSS transforms.
        if (el.offsetTop > prevTop + 1) {
          const id = el.dataset.measureId;
          if (id) starts.add(id);
          prevTop = el.offsetTop;
        }
      });
      setLineStartIds((prev) => {
        if (prev.size === starts.size && [...prev].every((id) => starts.has(id))) return prev;
        return starts;
      });
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(container);
    return () => ro.disconnect();
  }, []); // ResizeObserver handles all layout changes (resize, panel, measure count, effectiveN)

  return (
    <div ref={containerRef} className="chart-canvas__measures flex flex-wrap gap-1">
      {section.measures.map((measure, measureIndex) => {
        const minWidth = isMeasureSimple(measure) ? undefined : measureMinWidth(measure);
        return (
          <div
            key={measure.id}
            data-measure-id={measure.id}
            className="chart-canvas__measure-wrapper"
            style={{
              flexBasis: `calc(${100 / effectiveN}% - ${(effectiveN - 1) * 4 / effectiveN}px)`,
              flexGrow: 1,
              flexShrink: 0,
              minWidth,
            }}
          >
            <MeasureComponent
              measure={measure}
              sectionId={section.id}
              measureIndex={measureIndex}
              timeSignature={section.timeSignature}
              showTimeSignature={measureIndex === 0}
              isFirstInLine={lineStartIds.has(measure.id)}
            />
          </div>
        );
      })}
    </div>
  );
}

/** Tracks whether the viewport is >= lg (1024px). */
function useIsLargeViewport() {
  const [isLarge, setIsLarge] = React.useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches
  );
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent) => setIsLarge(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isLarge;
}

export function ChartCanvas({ className }: ChartCanvasProps) {
  const { chart, ui, reorderSections } = useChartStore();
  const { measuresPerLine } = chart.meta;
  const isLarge = useIsLargeViewport();
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
        className="space-y-8 w-full min-w-0"
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
            <SectionMeasures
              section={section}
              effectiveN={isLarge ? Math.min(measuresPerLine, 4) : 2}
            />
          </section>
        ))}
      </div>
    </ScrollArea>
  );
}
