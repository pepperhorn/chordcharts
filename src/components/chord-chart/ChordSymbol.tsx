import React from "react";
import type { Chord, NashvilleChord } from "@/lib/schema";
import { formatChord, getQualitySymbol } from "@/lib/utils";
import { cn } from "@/lib/utils";

function formatNashvilleChord(chord: NashvilleChord): string {
  const qualityStr = chord.quality ?? "";
  const bassStr = chord.bass ? `/${chord.bass}` : "";
  return `${chord.degree}${qualityStr}${bassStr}`;
}

interface ChordSymbolProps {
  chord: Chord | null;
  nashvilleChord: NashvilleChord | null;
  notationType: "standard" | "nashville";
  className?: string;
}

export function ChordSymbol({
  chord,
  nashvilleChord,
  notationType,
  className,
}: ChordSymbolProps) {
  const displayChord = notationType === "nashville" ? nashvilleChord : chord;
  if (!displayChord) return null;

  const formattedChord =
    notationType === "nashville"
      ? formatNashvilleChord(nashvilleChord!)
      : formatChord(chord!);

  // Render extensions (2nd+ partials) at 2px smaller per standard engraving practice
  if (notationType === "standard" && chord?.extensions?.length) {
    const primary = `${chord.root}${getQualitySymbol(chord.quality)}`;
    const extensions = chord.extensions.join("");
    const bass = chord.bass ? `/${chord.bass}` : "";
    return (
      <span
        className={cn("font-petaluma-script font-semibold text-xl whitespace-nowrap", className)}
        aria-label={`Chord: ${formattedChord}`}
      >
        {primary}
        <span className="text-base">{extensions}</span>
        {bass}
      </span>
    );
  }

  return (
    <span
      className={cn("font-petaluma-script font-semibold text-xl whitespace-nowrap", className)}
      aria-label={`Chord: ${formattedChord}`}
    >
      {formattedChord}
    </span>
  );
}
