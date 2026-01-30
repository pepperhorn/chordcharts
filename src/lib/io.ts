import { ChordChartSchema, type ChordChart } from "./schema";
import { getQualitySymbol } from "./utils";

export function exportToJSON(chart: ChordChart): string {
  return JSON.stringify(chart, null, 2);
}

export function importFromJSON(json: string): ChordChart {
  const parsed = JSON.parse(json);
  return ChordChartSchema.parse(parsed);
}

export function exportToMarkdown(chart: ChordChart): string {
  const lines: string[] = [];
  lines.push("---");
  lines.push(`title: ${chart.meta.title}`);
  lines.push(`composer: ${chart.meta.composer}`);
  lines.push(`key: ${chart.meta.key}`);
  lines.push(`tempo: ${chart.meta.tempo}`);
  if (chart.meta.tempoText) lines.push(`tempoText: ${chart.meta.tempoText}`);
  lines.push(`notationType: ${chart.meta.notationType}`);
  lines.push("---");
  lines.push("");

  for (const section of chart.sections) {
    lines.push(`## ${section.name}`);
    lines.push("");
    lines.push(`Time: ${section.timeSignature.beats}/${section.timeSignature.beatUnit}`);
    lines.push("");

    const measureLines: string[] = [];
    const dynamicLines: string[] = [];
    const lyricLines: string[] = [];

    for (const measure of section.measures) {
      if (measure.instruction) lines.push(`> ${measure.instruction}`);
      const chords: string[] = [];
      const dynamics: string[] = [];
      const lyrics: string[] = [];
      for (const beat of measure.beats) {
        const slot = beat.slots[0];
        if (chart.meta.notationType === "nashville" && slot.nashvilleChord) {
          chords.push(slot.nashvilleChord.degree + (slot.nashvilleChord.quality ?? ""));
        } else if (slot.chord) {
          chords.push(slot.chord.root + getQualitySymbol(slot.chord.quality));
        } else {
          chords.push("-");
        }
        dynamics.push(beat.dynamics ?? "");
        lyrics.push(beat.lyrics ?? "");
      }
      const startBar = measure.barlineStart === "repeatStart" ? "|:" : "|";
      const endBar =
        measure.barlineEnd === "repeatEnd" ? ":|" : measure.barlineEnd === "final" ? "|]" : measure.barlineEnd === "double" ? "||" : "|";
      measureLines.push(`${startBar} ${chords.join(" | ")} ${endBar}`);
      dynamicLines.push(`| ${dynamics.join(" | ")} |`);
      lyricLines.push(`| ${lyrics.join(" | ")} |`);
    }

    const perLine = chart.meta.measuresPerLine;
    for (let i = 0; i < measureLines.length; i += perLine) {
      lines.push(measureLines.slice(i, i + perLine).join(" "));
      const dynLine = dynamicLines.slice(i, i + perLine).join(" ");
      if (dynLine.replace(/[|\s-]/g, "").length > 0) lines.push(dynLine);
      const lyrLine = lyricLines.slice(i, i + perLine).join(" ");
      if (lyrLine.replace(/[|\s-]/g, "").length > 0) lines.push(lyrLine);
      lines.push("");
    }
  }
  return lines.join("\n");
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function uploadFile(accept: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error("No file selected"));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    };
    input.click();
  });
}
