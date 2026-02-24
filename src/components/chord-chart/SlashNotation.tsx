import React from "react";

interface SlashNotationProps {
  articulation: string;
  tied?: boolean;
  size?: "sm" | "md" | "lg";
  articulationSize?: "sm" | "md" | "lg" | "xl";
  stem?: boolean;
  stemDirection?: "up" | "down";
}

// Fixed height for all sizes to ensure vertical alignment across beat types
const FIXED_HEIGHT = 72;
const SLASH_CENTER_Y = 50; // Positioned to align with beamed notation

// Unified slash size for consistency across all subdivisions
const SLASH_HEIGHT = 14;
const SLASH_WIDTH = 9;
const SLASH_STROKE = 2.2;

const ARTIC_SIZE_PCT: Record<string, number> = { sm: 0.70, md: 0.75, lg: 0.80, xl: 0.90 };

const sizeMap = {
  sm: { width: 22, slashHeight: SLASH_HEIGHT, slashWidth: SLASH_WIDTH },
  md: { width: 28, slashHeight: SLASH_HEIGHT, slashWidth: SLASH_WIDTH },
  lg: { width: 34, slashHeight: SLASH_HEIGHT, slashWidth: SLASH_WIDTH },
};

// Horizontal stem offset from notehead center (matches Petaluma SE stem anchor)
const STEM_OFFSET_X = 11;
// Y position of stem tip when stem-up (leaves 27px stem, matching original beamed length)
const STEM_TIP_UP = 16;

export function SlashNotation({
  articulation = "none",
  tied = false,
  size = "md",
  articulationSize = "lg",
  stem = false,
  stemDirection = "up",
}: SlashNotationProps) {
  const { width, slashHeight, slashWidth } = sizeMap[size];
  const strokeW = Math.max(1.5, width / 12);
  const dotR = Math.max(2, width / 10);
  const ARTIC_HALF = (SLASH_HEIGHT * (ARTIC_SIZE_PCT[articulationSize] ?? 0.80)) / 2;

  // Notehead glyph sizing: SMuFL noteheadSlashVerticalEnds (U+E100)
  // Petaluma is a 2048-UPM font; notehead is ~0.225× fontSize tall
  // so to hit SLASH_HEIGHT≈14px we need fontSize ≈ 62px
  const glyphFontSize = size === "lg" ? 70 : size === "md" ? 62 : 54;
  const glyphHalfH = slashHeight / 2;

  // Notehead top / bottom reference points
  const slashCenterY = SLASH_CENTER_Y;
  const slashTopY = slashCenterY - glyphHalfH;    // ≈ 43
  const slashBottomY = slashCenterY + glyphHalfH;  // ≈ 57

  // Stem endpoints
  const stemTipUp = STEM_TIP_UP;
  const stemTipDown = slashBottomY + 24; // 24px below notehead bottom (overflows via overflow:visible)

  // Above mark: above stem tip (when stem-up) or above notehead top (no stem / stem-down)
  const aboveRef = (stem && stemDirection === "up") ? stemTipUp : slashTopY;
  // Center: bottom of mark = aboveRef - 3px gap; clamped to avoid clipping SVG top
  const aboveSlashY = Math.max(ARTIC_HALF + 2, aboveRef - 3 - ARTIC_HALF);

  // Below mark: always just below notehead bottom
  const belowSlashY = slashBottomY + 5;

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
      {/* Quarter note stem */}
      {stem && stemDirection === "up" && (
        <line
          x1={cx + STEM_OFFSET_X}
          y1={slashTopY}
          x2={cx + STEM_OFFSET_X}
          y2={stemTipUp}
          stroke="currentColor"
          strokeWidth={1.2}
          strokeLinecap="butt"
        />
      )}
      {stem && stemDirection === "down" && (
        <line
          x1={cx - STEM_OFFSET_X}
          y1={slashBottomY}
          x2={cx - STEM_OFFSET_X}
          y2={stemTipDown}
          stroke="currentColor"
          strokeWidth={1.2}
          strokeLinecap="butt"
        />
      )}
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
