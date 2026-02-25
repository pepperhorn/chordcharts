import React from "react";

interface SlashNotationProps {
  articulation: string;
  tied?: boolean;
  size?: "sm" | "md" | "lg";
  articulationSize?: "sm" | "md" | "lg" | "xl";
  stem?: boolean;
  stemDirection?: "up" | "down";
  beatWidth?: number;
  noteType?: "quarter" | "half" | "whole";
}

// Fixed height for all sizes to ensure vertical alignment across beat types
const FIXED_HEIGHT = 72;
const SLASH_CENTER_Y = 40; // Midline: aligns with beamed notation and time sig gap

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

// Horizontal stem offset from notehead center (matches Petaluma SE/SW stem anchor)
const STEM_OFFSET_X = 11;
// Stem length matches sixteenth beamed notes: stemLength(22) + beamHeight(3) + beamGap(3.5) = 28.5
const QUARTER_STEM_LENGTH = 28.5;

export function SlashNotation({
  articulation = "none",
  tied = false,
  size = "md",
  articulationSize = "lg",
  stem = false,
  stemDirection = "down",
  beatWidth = 0,
  noteType = "quarter",
}: SlashNotationProps) {
  const { width, slashHeight, slashWidth } = sizeMap[size];
  const strokeW = Math.max(1.5, width / 12);
  const ARTIC_HALF = (SLASH_HEIGHT * (ARTIC_SIZE_PCT[articulationSize] ?? 0.80)) / 2;
  const dotR = Math.max(1.5, ARTIC_HALF * 0.35);

  // Notehead glyph sizing: quarter=U+E100 (filled), half=U+E101 (open), whole=U+E102 (open diamond)
  // Petaluma is a 2048-UPM font; notehead is ~0.225× fontSize tall
  // so to hit SLASH_HEIGHT≈14px we need fontSize ≈ 62px
  const glyphFontSize = noteType === "whole" ? 55 : size === "lg" ? 70 : size === "md" ? 62 : 54;
  const glyphChar = noteType === "half" ? '\uE101' : noteType === "whole" ? '\uE102' : '\uE100';
  // Whole notes never have stems regardless of the stem prop
  const effectiveStem = noteType !== "whole" && stem;
  const glyphHalfH = slashHeight / 2;

  // Notehead top / bottom reference points
  const slashCenterY = SLASH_CENTER_Y;
  const slashTopY = slashCenterY - glyphHalfH;    // ≈ 43
  const slashBottomY = slashCenterY + glyphHalfH;  // ≈ 57

  // Stem endpoints — equal length in both directions, matching sixteenth beamed note height
  const stemTipUp = slashTopY - QUARTER_STEM_LENGTH;   // = 4.5
  const stemTipDown = slashBottomY + QUARTER_STEM_LENGTH; // = 75.5

  // Above mark: above stem tip (when stem-up) or above notehead top (no stem / stem-down)
  const aboveRef = (effectiveStem && stemDirection === "up") ? stemTipUp : slashTopY;
  // Center: bottom of mark = aboveRef - 3px gap; clamped to avoid clipping SVG top
  const aboveSlashY = Math.max(ARTIC_HALF + 2, aboveRef - 3 - ARTIC_HALF);

  // Decode compound articulation using string inclusion
  const hasStaccato = articulation.includes("staccato");
  const hasLegato   = articulation.includes("legato");
  const hasMarcato  = articulation.includes("marcato");
  const hasAccent   = articulation.includes("accent");

  // Accent goes below notehead when stem-up, above when stem-down or no stem
  const accentIsBelow = effectiveStem && stemDirection === "up";

  // Stack below items from notehead outward: legato → accent (if stem-up) → staccato
  const belowBase = slashBottomY + 4;
  const itemGap = 3;
  let nextBelowY = belowBase;
  let legatoY = 0;
  let accentBelowCY = 0;
  let staccatoCY = 0;
  if (hasLegato) {
    legatoY = nextBelowY;
    nextBelowY += strokeW / 2 + itemGap;
  }
  if (hasAccent && accentIsBelow) {
    accentBelowCY = nextBelowY + ARTIC_HALF;
    nextBelowY += ARTIC_HALF * 2 + itemGap;
  }
  if (hasStaccato) {
    staccatoCY = nextBelowY + dotR;
  }

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
      {/* Slash notehead – quarter=U+E100 filled, half=U+E101 open, whole=U+E102 open diamond */}
      <text
        x={cx}
        y={slashCenterY}
        textAnchor="middle"
        fontFamily="Petaluma"
        fontSize={glyphFontSize}
        fill="currentColor"
      >{glyphChar}</text>
      {/* Stem (suppressed for whole notes) */}
      {effectiveStem && stemDirection === "up" && (
        <line
          x1={cx + STEM_OFFSET_X + 2}
          y1={slashTopY}
          x2={cx + STEM_OFFSET_X + 2}
          y2={stemTipUp}
          stroke="currentColor"
          strokeWidth={1.2}
          strokeLinecap="butt"
        />
      )}
      {effectiveStem && stemDirection === "down" && (
        <line
          x1={cx - STEM_OFFSET_X - 2}
          y1={slashBottomY}
          x2={cx - STEM_OFFSET_X - 2}
          y2={stemTipDown}
          stroke="currentColor"
          strokeWidth={1.2}
          strokeLinecap="butt"
        />
      )}
      {tied && (() => {
        const tieY = slashCenterY + 4;
        const startX = cx + SLASH_WIDTH / 2;
        const endX = beatWidth > 0 ? cx + beatWidth : startX + 120;
        const bowDir = (stem && stemDirection === "down") ? -1 : 1;
        return (
          <path
            d={`M ${startX} ${tieY} Q ${(startX + endX) / 2} ${tieY + bowDir * 10} ${endX} ${tieY}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeW * 0.75}
            strokeLinecap="round"
          />
        );
      })()}

      {/* === ABOVE MARKS === */}

      {/* Accent: above when stem-down or no stem */}
      {hasAccent && !accentIsBelow && (
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

      {/* === BELOW MARKS (stacked: legato → accent if stem-up → staccato outermost) === */}

      {/* Legato (tenuto): horizontal bar below the notehead */}
      {hasLegato && (
        <line
          x1={cx - ARTIC_HALF}
          y1={legatoY}
          x2={cx + ARTIC_HALF}
          y2={legatoY}
          stroke="currentColor"
          strokeWidth={strokeW}
          strokeLinecap="round"
        />
      )}

      {/* Accent: below when stem-up */}
      {hasAccent && accentIsBelow && (
        <path
          d={`M ${cx - ARTIC_HALF} ${accentBelowCY - ARTIC_HALF} L ${cx + ARTIC_HALF} ${accentBelowCY} L ${cx - ARTIC_HALF} ${accentBelowCY + ARTIC_HALF}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* Staccato: dot, always outermost below */}
      {hasStaccato && (
        <circle cx={cx} cy={staccatoCY} r={dotR} fill="currentColor" />
      )}
    </svg>
  );
}
