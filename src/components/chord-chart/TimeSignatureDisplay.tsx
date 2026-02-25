import React from "react";
import type { TimeSignature } from "@/lib/schema";

interface TimeSignatureDisplayProps {
  timeSignature: TimeSignature;
}

// Convert a number to SMuFL time signature glyphs (U+E080 = 0, U+E081 = 1, …)
function toTimeSigGlyphs(n: number): string {
  return String(n)
    .split("")
    .map((d) => String.fromCodePoint(0xe080 + parseInt(d, 10)))
    .join("");
}

export function TimeSignatureDisplay({ timeSignature }: TimeSignatureDisplayProps) {
  return (
    <div
      className="time-signature flex flex-col items-center justify-end px-2 font-petaluma"
      style={{ fontSize: 32, lineHeight: 1 }}
      role="img"
      aria-label={`Time signature: ${timeSignature.beats} over ${timeSignature.beatUnit}`}
    >
      <span className="time-signature__beats">{toTimeSigGlyphs(timeSignature.beats)}</span>
      <span className="time-signature__unit">{toTimeSigGlyphs(timeSignature.beatUnit)}</span>
    </div>
  );
}
