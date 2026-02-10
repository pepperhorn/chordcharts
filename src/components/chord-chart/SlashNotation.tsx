import React from "react";

interface SlashNotationProps {
  articulation: "none" | "accent" | "staccato" | "marcato" | "tenuto" | "fermata";
  tie?: "none" | "start" | "stop" | "continue";
  size?: "sm" | "md" | "lg";
}

// Fixed height for all sizes to ensure vertical alignment across beat types
const FIXED_HEIGHT = 52;
const SLASH_CENTER_Y = 34; // Positioned to align with beamed notation

// Unified slash size for consistency across all subdivisions
const SLASH_HEIGHT = 14;
const SLASH_WIDTH = 9;
const SLASH_STROKE = 2.2;

const sizeMap = {
  sm: { width: 14, slashHeight: SLASH_HEIGHT, slashWidth: SLASH_WIDTH },
  md: { width: 16, slashHeight: SLASH_HEIGHT, slashWidth: SLASH_WIDTH },
  lg: { width: 22, slashHeight: SLASH_HEIGHT, slashWidth: SLASH_WIDTH },
};

export function SlashNotation({
  articulation = "none",
  tie = "none",
  size = "md",
}: SlashNotationProps) {
  const { width, slashHeight, slashWidth } = sizeMap[size];
  const strokeW = Math.max(1.5, width / 12);
  const dotR = Math.max(2, width / 10);

  // Slash position - centered at fixed Y for alignment
  const slashCenterY = SLASH_CENTER_Y;
  const slashX1 = (width - slashWidth) / 2;
  const slashX2 = slashX1 + slashWidth;
  const slashY1 = slashCenterY + slashHeight / 2;
  const slashY2 = slashCenterY - slashHeight / 2;

  // Articulation positioned above the slash
  const aboveSlashY = slashY2 - 8;

  return (
    <svg
      width={width}
      height={FIXED_HEIGHT}
      viewBox={`0 0 ${width} ${FIXED_HEIGHT}`}
      className="slash-notation flex-shrink-0"
      style={{ display: 'block' }}
      role="img"
      aria-label={`Rhythm slash${articulation !== "none" ? ` with ${articulation}` : ""}${tie !== "none" ? `, ${tie} tie` : ""}`}
    >
      {/* Slash notehead drawn as a thick diagonal line */}
      <line
        x1={slashX1}
        y1={slashY1}
        x2={slashX2}
        y2={slashY2}
        stroke="currentColor"
        strokeWidth={SLASH_STROKE}
        strokeLinecap="round"
      />
      {(tie === "start" || tie === "continue") && (
        <path
          d={`M ${width} ${slashCenterY + 4} Q ${width + 8} ${slashCenterY + 10} ${width + 16} ${slashCenterY + 4}`}
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
      {articulation === "tenuto" && (
        <line
          x1={width * 0.25}
          y1={aboveSlashY}
          x2={width * 0.75}
          y2={aboveSlashY}
          stroke="currentColor"
          strokeWidth={strokeW}
          strokeLinecap="round"
        />
      )}
      {articulation === "fermata" && (
        <g>
          <path
            d={`M ${width * 0.2} ${aboveSlashY} Q ${width / 2} ${aboveSlashY - 6} ${width * 0.8} ${aboveSlashY}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeW * 0.8}
          />
          <circle cx={width / 2} cy={aboveSlashY + 2} r={dotR * 0.7} fill="currentColor" />
        </g>
      )}
    </svg>
  );
}
