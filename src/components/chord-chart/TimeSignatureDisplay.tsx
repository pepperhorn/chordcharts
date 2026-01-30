import React from "react";
import type { TimeSignature } from "@/lib/schema";

interface TimeSignatureDisplayProps {
  timeSignature: TimeSignature;
}

export function TimeSignatureDisplay({ timeSignature }: TimeSignatureDisplayProps) {
  return (
    <div
      className="flex flex-col items-center justify-center px-2 font-petaluma font-bold text-lg"
      role="img"
      aria-label={`Time signature: ${timeSignature.beats} over ${timeSignature.beatUnit}`}
    >
      <span>{timeSignature.beats}</span>
      <span>{timeSignature.beatUnit}</span>
    </div>
  );
}
