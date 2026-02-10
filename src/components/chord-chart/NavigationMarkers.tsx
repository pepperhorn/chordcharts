import React from "react";
import type { Navigation } from "@/lib/schema";
import { cn } from "@/lib/utils";

interface NavigationMarkerProps {
  type: Navigation["type"];
  className?: string;
}

const MARKERS: Record<Navigation["type"], { symbol: string; label: string }> = {
  segno: { symbol: "𝄋", label: "Segno" },
  coda: { symbol: "𝄌", label: "Coda" },
  dsCoda: { symbol: "D.S. al Coda", label: "Dal Segno al Coda" },
  dsSegno: { symbol: "D.S.", label: "Dal Segno" },
  dcCoda: { symbol: "D.C. al Coda", label: "Da Capo al Coda" },
  dcFine: { symbol: "D.C. al Fine", label: "Da Capo al Fine" },
  fine: { symbol: "Fine", label: "Fine" },
  toCoda: { symbol: "To Coda 𝄌", label: "To Coda" },
  dsAlFine: { symbol: "D.S. al Fine", label: "Dal Segno al Fine" },
};

export function NavigationMarker({ type, className }: NavigationMarkerProps) {
  const marker = MARKERS[type];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 text-sm font-medium border rounded bg-background",
        className
      )}
      role="img"
      aria-label={marker.label}
    >
      {marker.symbol}
    </span>
  );
}

interface SectionNavigationProps {
  navigation: Navigation | null;
  position: "start" | "end";
}

const START_TYPES: Navigation["type"][] = ["segno", "coda"];
const END_TYPES: Navigation["type"][] = ["dsCoda", "dsSegno", "dcCoda", "dcFine", "fine", "toCoda", "dsAlFine"];

export function SectionNavigation({ navigation, position }: SectionNavigationProps) {
  if (!navigation) return null;
  const relevant = position === "start" ? START_TYPES : END_TYPES;
  if (!relevant.includes(navigation.type)) return null;
  return <NavigationMarker type={navigation.type} />;
}
