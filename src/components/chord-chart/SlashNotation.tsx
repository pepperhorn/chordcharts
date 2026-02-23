import React from "react";

interface SlashNotationProps {
  articulation: string;
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

// 75% of notehead height — the target size for accent, marcato, and legato marks
const ARTIC_HALF = (SLASH_HEIGHT * 0.75) / 2; // 5.25px (marks span 10.5px total)

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
  // Petaluma is a 2048-UPM font; notehead is ~0.225× fontSize tall
  // so to hit SLASH_HEIGHT≈14px we need fontSize ≈ 62px
  const glyphFontSize = size === "lg" ? 70 : size === "md" ? 62 : 54;
  const glyphHalfH = slashHeight / 2;

  // Articulation positions relative to notehead center
  const slashCenterY = SLASH_CENTER_Y;
  const slashY2 = slashCenterY - glyphHalfH; // estimated notehead top
  const slashY1 = slashCenterY + glyphHalfH; // estimated notehead bottom

  // Above mark center (accent, marcato) — clear of notehead top
  const aboveSlashY = slashY2 - 8;
  // Below mark position (staccato, legato) — clear of notehead bottom
  const belowSlashY = slashY1 + 5;

  // Decode compound articulation using string inclusion
  const hasStaccato = articulation.includes("staccato");
  const hasLegato   = articulation.includes("legato");
  const hasMarcato  = articulation.includes("marcato");
  const hasAccent   = articulation.includes("accent");

  const cx = width / 2;

  const articulationLabel = articulation === "none"
    ? ""
    : articulation.replace(/-/g, " and ");

  return (
    <svg
      width={width}
      height={FIXED_HEIGHT}
      viewBox={`0 0 ${width} ${FIXED_HEIGHT}`}
      className="slash-notation flex-shrink-0"
      overflow="visible"
      style={{ display: 'block' }}
      role="img"
      aria-label={`Rhythm slash${articulationLabel ? ` with ${articulationLabel}` : ""}${tied ? ", tied" : ""}`}
    >
      {/* Slash notehead – SMuFL noteheadSlashVerticalEnds U+E100
          Petaluma baseline = notehead center (middle staff line),
          so y={slashCenterY} positions the notehead center correctly. */}
      <text
        x={cx}
        y={slashCenterY}
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

      {/* === ABOVE MARKS === */}

      {/* Accent: > pointing right, centered at aboveSlashY, 75% of notehead height */}
      {hasAccent && (
        <path
          d={`M ${cx - ARTIC_HALF} ${aboveSlashY - ARTIC_HALF} L ${cx + ARTIC_HALF} ${aboveSlashY} L ${cx - ARTIC_HALF} ${aboveSlashY + ARTIC_HALF}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* Marcato: ^ pointing up, centered at aboveSlashY, 75% of notehead height */}
      {hasMarcato && (
        <path
          d={`M ${cx - ARTIC_HALF} ${aboveSlashY + ARTIC_HALF} L ${cx} ${aboveSlashY - ARTIC_HALF} L ${cx + ARTIC_HALF} ${aboveSlashY + ARTIC_HALF}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* === BELOW MARKS === */}

      {/* Staccato: dot below the notehead */}
      {hasStaccato && (
        <circle cx={cx} cy={belowSlashY} r={dotR} fill="currentColor" />
      )}

      {/* Legato (tenuto): horizontal bar below the notehead, 75% of notehead height wide */}
      {hasLegato && (
        <line
          x1={cx - ARTIC_HALF}
          y1={belowSlashY}
          x2={cx + ARTIC_HALF}
          y2={belowSlashY}
          stroke="currentColor"
          strokeWidth={strokeW}
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
