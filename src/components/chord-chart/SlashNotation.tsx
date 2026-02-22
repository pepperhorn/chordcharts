import React from "react";

interface SlashNotationProps {
  articulation: "none" | "accent" | "staccato" | "marcato" | "legato";
  tied?: boolean;
  size?: "sm" | "md" | "lg";
}

// Fixed height for all sizes to ensure vertical alignment across beat types
const FIXED_HEIGHT = 72;
const SLASH_CENTER_Y = 50; // Positioned to align with beamed notation

// Unified slash size for consistency across all subdivisions
const SLASH_HEIGHT = 14;
const SLASH_WIDTH = 9;
const SLASH_STROKE = 2.2;

const sizeMap = {
  sm: { width: 22, slashHeight: SLASH_HEIGHT, slashWidth: SLASH_WIDTH },
  md: { width: 28, slashHeight: SLASH_HEIGHT, slashWidth: SLASH_WIDTH },
  lg: { width: 34, slashHeight: SLASH_HEIGHT, slashWidth: SLASH_WIDTH },
};

export function SlashNotation({
  articulation = "none",
  tied = false,
  size = "md",
}: SlashNotationProps) {
  const { width, slashHeight, slashWidth } = sizeMap[size];
  const strokeW = Math.max(1.5, width / 12);
  const dotR = Math.max(2, width / 10);

  // Notehead glyph sizing: SMuFL noteheadSlashVerticalEnds (U+E100)
  const glyphFontSize = size === "lg" ? 30 : size === "md" ? 26 : 22;
  const glyphHalfH = slashHeight / 2;

  // Articulation positions relative to notehead center
  const slashCenterY = SLASH_CENTER_Y;
  const slashY2 = slashCenterY - glyphHalfH; // estimated notehead top
  const slashY1 = slashCenterY + glyphHalfH; // estimated notehead bottom

  // Articulation positions
  const aboveSlashY = slashY2 - 8;
  const belowSlashY = slashY1 + 5;

  return (
    <svg
      width={width}
      height={FIXED_HEIGHT}
      viewBox={`0 0 ${width} ${FIXED_HEIGHT}`}
      className="slash-notation flex-shrink-0"
      style={{ display: 'block' }}
      role="img"
      aria-label={`Rhythm slash${articulation !== "none" ? ` with ${articulation}` : ""}${tied ? ", tied" : ""}`}
    >
      {/* Slash notehead – SMuFL noteheadSlashVerticalEnds U+E100 */}
      <text
        x={width / 2}
        y={slashCenterY + 6}
        textAnchor="middle"
        fontFamily="Petaluma"
        fontSize={glyphFontSize}
        fill="currentColor"
      >{'\uE100'}</text>
      {tied && (
        <path
          d={`M ${width} ${slashCenterY + 4} Q ${width + 8} ${slashCenterY + 10} ${width + 16} ${slashCenterY + 4}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeW}
        />
      )}
      {/* Accent: horizontal > above the slash */}
      {articulation === "accent" && (
        <path
          d={`M ${width * 0.1} ${aboveSlashY - 3.5} L ${width * 0.9} ${aboveSlashY} L ${width * 0.1} ${aboveSlashY + 3.5}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {/* Staccato: dot above */}
      {articulation === "staccato" && (
        <circle cx={width / 2} cy={aboveSlashY} r={dotR} fill="currentColor" />
      )}
      {/* Marcato: tall narrow ^ always above */}
      {articulation === "marcato" && (
        <path
          d={`M ${width * 0.15} ${aboveSlashY + 4} L ${width * 0.5} ${aboveSlashY - 5} L ${width * 0.85} ${aboveSlashY + 4}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {/* Legato: horizontal bar below the slash */}
      {articulation === "legato" && (
        <line
          x1={width * 0.1}
          y1={belowSlashY}
          x2={width * 0.9}
          y2={belowSlashY}
          stroke="currentColor"
          strokeWidth={strokeW}
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
