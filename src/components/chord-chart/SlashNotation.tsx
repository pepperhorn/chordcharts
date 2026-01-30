import React from "react";

/** SMuFL slash notehead (Petaluma): U+E100 Slash with vertical ends */
const SLASH_NOTEHEAD = "\uE100";

interface SlashNotationProps {
  articulation: "none" | "accent" | "staccato" | "marcato";
  tied?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { width: 12, height: 20, fontSize: 18 },
  md: { width: 16, height: 28, fontSize: 24 },
  lg: { width: 32, height: 48, fontSize: 44 },
};

export function SlashNotation({
  articulation = "none",
  tied = false,
  size = "md",
}: SlashNotationProps) {
  const { width, height, fontSize } = sizeMap[size];
  // Quarter note: stem on right (stems down) → accent/staccato above notehead
  const stemsDown = true;
  const needsSpaceAbove =
    (stemsDown && (articulation === "accent" || articulation === "staccato")) ||
    articulation === "marcato";
  const articulationSpace = size === "lg" ? 14 : size === "md" ? 10 : 8;
  const totalHeight = height + (needsSpaceAbove ? articulationSpace : 0);
  const slashY = height - 2 + (needsSpaceAbove ? articulationSpace : 0);
  const strokeW = Math.max(1.5, width / 12);
  const dotR = Math.max(2, width / 10);
  // Articulation y: above the slash (in the reserved space), drawn after slash so visible
  const aboveSlashY = articulationSpace * 0.5;

  return (
    <svg
      width={width}
      height={totalHeight}
      viewBox={`0 0 ${width} ${totalHeight}`}
      className="flex-shrink-0"
      role="img"
      aria-label={`Rhythm slash${articulation !== "none" ? ` with ${articulation}` : ""}${tied ? ", tied" : ""}`}
    >
      <defs>
        <style>{`svg .petaluma-slash { font-family: "Petaluma", sans-serif; fill: currentColor; }`}</style>
      </defs>
      {/* Slash first so articulations draw on top and are visible */}
      <text
        x={width / 2}
        y={slashY}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={fontSize}
        className="petaluma-slash"
      >
        {SLASH_NOTEHEAD}
      </text>
      {tied && (
        <path
          d={`M ${width} ${height * 0.7 + (needsSpaceAbove ? articulationSpace : 0)} Q ${width + 8} ${height * 0.9 + (needsSpaceAbove ? articulationSpace : 0)} ${width + 16} ${height * 0.7 + (needsSpaceAbove ? articulationSpace : 0)}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeW}
        />
      )}
      {/* Articulations above notehead (stems down): accent, staccato; marcato always above subdivision */}
      {articulation === "accent" && (
        <path
          d={`M ${width * 0.2} ${aboveSlashY + strokeW} L ${width * 0.5} ${aboveSlashY - strokeW} L ${width * 0.8} ${aboveSlashY + strokeW}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {articulation === "staccato" && (
        <circle cx={width / 2} cy={aboveSlashY} r={dotR} fill="currentColor" />
      )}
      {articulation === "marcato" && (
        <path
          d={`M ${width * 0.3} ${aboveSlashY - 2} L ${width / 2} ${aboveSlashY + 3} L ${width * 0.7} ${aboveSlashY - 2}`}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={strokeW * 0.3}
        />
      )}
    </svg>
  );
}
