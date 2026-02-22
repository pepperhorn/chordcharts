import React from "react";
import type { TimeSignature } from "@/lib/schema";

interface TimeSignatureDisplayProps {
  timeSignature: TimeSignature;
}

export function TimeSignatureDisplay({ timeSignature }: TimeSignatureDisplayProps) {
  return (
    <div
      className="time-signature flex flex-col items-center justify-end px-2 font-petaluma-text font-bold text-lg"
      role="img"
      aria-label={`Time signature: ${timeSignature.beats} over ${timeSignature.beatUnit}`}
    >
      <span className="time-signature__beats">{timeSignature.beats}</span>
      <span className="time-signature__unit">{timeSignature.beatUnit}</span>
    </div>
  );
}
