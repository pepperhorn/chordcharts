import React from "react";

interface SlotSlash {
  articulation: "none" | "accent" | "staccato" | "marcato";
  tied: boolean;
  rest: boolean;
}

interface BeamedSlashGroupProps {
  slots: SlotSlash[];
  size?: "sm" | "md";
  selectedIndex?: number;
}

// Fixed height to match SlashNotation for vertical alignment
const FIXED_HEIGHT = 52;
const SLASH_CENTER_Y = 34; // Positioned lower to allow for longer stems

// Unified slash dimensions for consistency across all subdivisions
const SLASH_HEIGHT = 14;
const SLASH_WIDTH = 9;
const SLASH_STROKE = 2.2;

/**
 * Renders standard slash notation with stems and beams.
 * - Eighth notes (2 slots): single beam
 * - Eighth triplets (3 slots): single beam with "3"
 * - Sixteenth notes (4 slots): double beam
 * - Sixteenth triplets (6 slots): two groups of 3, each with double beam and "3"
 */
export function BeamedSlashGroup({ slots, size = "md", selectedIndex = -1 }: BeamedSlashGroupProps) {
  const n = slots.length;

  // Sixteenth triplets: render as two separate groups of 3
  if (n === 6) {
    const group1 = slots.slice(0, 3);
    const group2 = slots.slice(3, 6);
    // Adjust selectedIndex for each group
    const group1Selected = selectedIndex >= 0 && selectedIndex < 3 ? selectedIndex : -1;
    const group2Selected = selectedIndex >= 3 ? selectedIndex - 3 : -1;
    return (
      <div className="beamed-slash-group beamed-slash-group--sixteenth-triplet flex items-center w-full">
        <div className="flex-1"><SixteenthTripletGroup slots={group1} size={size} selectedIndex={group1Selected} /></div>
        <div className="flex-1"><SixteenthTripletGroup slots={group2} size={size} selectedIndex={group2Selected} /></div>
      </div>
    );
  }

  // Use percentage-based positioning (viewBox 0-100 for width)
  const viewBoxWidth = 100;
  const slotWidthPct = viewBoxWidth / n;

  // Use unified slash proportions for consistency (scaled for viewBox)
  const slashHeight = SLASH_HEIGHT;
  const slashWidth = Math.min(SLASH_WIDTH, slotWidthPct * 0.4);
  const slashStrokeWidth = SLASH_STROKE;
  const beamHeight = 3;
  const beamGap = 3.5;
  const stemWidth = 1.2;

  // Triplet indicator for eighth triplets (n=3)
  const isEighthTriplet = n === 3;
  // Sixteenth notes have double beam
  const isSixteenth = n === 4;

  // Calculate slash position (center at SLASH_CENTER_Y)
  const slashTopY = SLASH_CENTER_Y - slashHeight / 2;
  const slashBottomY = SLASH_CENTER_Y + slashHeight / 2;

  // Beam positioned to create consistent ~20px stem height
  const beam1Y = 6 + beamHeight / 2;
  const beam2Y = beam1Y + beamHeight + beamGap;
  // Stem extends from top of first beam down to top of slash
  const stemTop = beam1Y - beamHeight / 2;
  // Triplet indicator: centered on middle slot, positioned above beam with 3px padding
  const middleSlotX = 1.5 * slotWidthPct; // Center of slot index 1 (middle of 3)
  const tripletY = stemTop - 3; // 3px above top of beam

  // Calculate stem X positions using percentage-based slot positions
  const getSlotCenterX = (i: number) => (i + 0.5) * slotWidthPct;
  const getStemX = (i: number) => getSlotCenterX(i) + slashWidth / 2;
  const firstStemX = getStemX(0);
  const lastStemX = getStemX(n - 1);

  // Articulation positions
  const belowSlashY = slashBottomY + 6;

  const divisionClass = isEighthTriplet ? 'eighth-triplet' : isSixteenth ? 'sixteenth' : 'eighth';

  return (
    <svg
      width="100%"
      height={FIXED_HEIGHT}
      viewBox={`0 0 ${viewBoxWidth} ${FIXED_HEIGHT}`}
      preserveAspectRatio="none"
      className={`beamed-slash-group beamed-slash-group--${divisionClass}`}
      role="img"
      aria-label={`Beamed rhythm, ${n} notes per beat${isEighthTriplet ? ", triplet" : ""}`}
      style={{ display: 'block' }}
    >
      {/* Triplet indicator for eighth triplets - centered on middle slot */}
      {isEighthTriplet && (
        <text
          x={middleSlotX}
          y={tripletY}
          textAnchor="middle"
          dominantBaseline="auto"
          fontSize={11}
          fontWeight="bold"
          fontStyle="italic"
          fill="currentColor"
        >
          3
        </text>
      )}
      {/* Primary beam */}
      <line
        x1={firstStemX}
        y1={beam1Y}
        x2={lastStemX}
        y2={beam1Y}
        stroke="currentColor"
        strokeWidth={beamHeight}
        strokeLinecap="butt"
      />
      {/* Secondary beam for sixteenth notes */}
      {isSixteenth && (
        <line
          x1={firstStemX}
          y1={beam2Y}
          x2={lastStemX}
          y2={beam2Y}
          stroke="currentColor"
          strokeWidth={beamHeight}
          strokeLinecap="butt"
        />
      )}
      {slots.map((slot, i) => {
        const cx = getSlotCenterX(i);
        const slashX1 = cx - slashWidth / 2;
        const slashY1 = slashBottomY;
        const slashX2 = cx + slashWidth / 2;
        const slashY2 = slashTopY;
        const stemX = slashX2;
        const isSelected = i === selectedIndex;

        if (slot.rest) {
          return (
            <g key={i} className={isSelected ? 'beamed-slash-group__slot--selected' : ''} aria-label="Rest">
              {isSelected && <rect x={i * slotWidthPct} y={0} width={slotWidthPct} height={FIXED_HEIGHT} fill="#fffcba" fillOpacity={0.5} />}
              <rect x={cx - 4} y={SLASH_CENTER_Y - 2} width={8} height={4} fill="currentColor" />
            </g>
          );
        }

        return (
          <g key={i} className={isSelected ? 'beamed-slash-group__slot--selected' : ''}>
            {isSelected && <rect x={i * slotWidthPct} y={0} width={slotWidthPct} height={FIXED_HEIGHT} fill="#fffcba" fillOpacity={0.5} />}
            <line x1={stemX} y1={stemTop} x2={stemX} y2={slashY2} stroke="currentColor" strokeWidth={stemWidth} strokeLinecap="round" />
            <line x1={slashX1} y1={slashY1} x2={slashX2} y2={slashY2} stroke="currentColor" strokeWidth={slashStrokeWidth} strokeLinecap="round" />
            {slot.articulation === "accent" && (
              <path d={`M ${cx - 4} ${belowSlashY + 5} L ${cx} ${belowSlashY} L ${cx + 4} ${belowSlashY + 5}`} fill="none" stroke="currentColor" strokeWidth={size === "sm" ? 1.2 : 1.5} strokeLinecap="round" strokeLinejoin="round" />
            )}
            {slot.articulation === "staccato" && (
              <circle cx={cx} cy={belowSlashY + 2} r={size === "sm" ? 1.5 : 2} fill="currentColor" />
            )}
            {slot.articulation === "marcato" && (
              <path d={`M ${cx - 3} ${beam1Y - 6} L ${cx} ${beam1Y - 12} L ${cx + 3} ${beam1Y - 6}`} fill="currentColor" stroke="currentColor" strokeWidth="0.5" />
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** Renders a single group of 3 sixteenth notes with double beam and "3" indicator */
function SixteenthTripletGroup({ slots, size = "md", selectedIndex = -1 }: { slots: SlotSlash[]; size?: "sm" | "md"; selectedIndex?: number }) {
  const n = 3;

  // Use percentage-based positioning (viewBox 0-100 for width)
  const viewBoxWidth = 100;
  const slotWidthPct = viewBoxWidth / n;

  // Use unified slash proportions
  const slashHeight = SLASH_HEIGHT;
  const slashWidth = Math.min(SLASH_WIDTH, slotWidthPct * 0.4);
  const slashStrokeWidth = SLASH_STROKE;
  const beamHeight = 3;
  const beamGap = 3.5;
  const stemWidth = 1.2;

  // Position slash center at same Y as other notations
  const slashTopY = SLASH_CENTER_Y - slashHeight / 2;
  const slashBottomY = SLASH_CENTER_Y + slashHeight / 2;

  // Beam positioned to create consistent stem height
  const beam1Y = 6 + beamHeight / 2;
  const beam2Y = beam1Y + beamHeight + beamGap;
  // Stem extends from top of first beam down to top of slash
  const stemTop = beam1Y - beamHeight / 2;
  // Triplet indicator: centered on middle slot, positioned above beam with 3px padding
  const middleSlotX = 1.5 * slotWidthPct; // Center of slot index 1 (middle of 3)
  const tripletY = stemTop - 3; // 3px above top of beam

  const getSlotCenterX = (i: number) => (i + 0.5) * slotWidthPct;
  const getStemX = (i: number) => getSlotCenterX(i) + slashWidth / 2;
  const firstStemX = getStemX(0);
  const lastStemX = getStemX(n - 1);

  const belowSlashY = slashBottomY + 4;

  return (
    <svg
      width="100%"
      height={FIXED_HEIGHT}
      viewBox={`0 0 ${viewBoxWidth} ${FIXED_HEIGHT}`}
      preserveAspectRatio="none"
      className="sixteenth-triplet-group"
      role="img"
      aria-label="Sixteenth triplet group"
      style={{ display: 'block' }}
    >
      {/* Triplet "3" indicator - centered on middle slot */}
      <text
        x={middleSlotX}
        y={tripletY}
        textAnchor="middle"
        dominantBaseline="auto"
        fontSize={11}
        fontWeight="bold"
        fontStyle="italic"
        fill="currentColor"
      >
        3
      </text>
      {/* Double beam */}
      <line x1={firstStemX} y1={beam1Y} x2={lastStemX} y2={beam1Y} stroke="currentColor" strokeWidth={beamHeight} strokeLinecap="butt" />
      <line x1={firstStemX} y1={beam2Y} x2={lastStemX} y2={beam2Y} stroke="currentColor" strokeWidth={beamHeight} strokeLinecap="butt" />
      {slots.map((slot, i) => {
        const cx = getSlotCenterX(i);
        const slashX1 = cx - slashWidth / 2;
        const slashY1 = slashBottomY;
        const slashX2 = cx + slashWidth / 2;
        const slashY2 = slashTopY;
        const stemX = slashX2;
        const isSelected = i === selectedIndex;

        if (slot.rest) {
          return (
            <g key={i} className={isSelected ? 'sixteenth-triplet-group__slot--selected' : ''} aria-label="Rest">
              {isSelected && <rect x={i * slotWidthPct} y={0} width={slotWidthPct} height={FIXED_HEIGHT} fill="#fffcba" fillOpacity={0.5} />}
              <rect x={cx - 3} y={SLASH_CENTER_Y - 1.5} width={6} height={3} fill="currentColor" />
            </g>
          );
        }

        return (
          <g key={i} className={isSelected ? 'sixteenth-triplet-group__slot--selected' : ''}>
            {isSelected && <rect x={i * slotWidthPct} y={0} width={slotWidthPct} height={FIXED_HEIGHT} fill="#fffcba" fillOpacity={0.5} />}
            <line x1={stemX} y1={stemTop} x2={stemX} y2={slashY2} stroke="currentColor" strokeWidth={stemWidth} strokeLinecap="round" />
            <line x1={slashX1} y1={slashY1} x2={slashX2} y2={slashY2} stroke="currentColor" strokeWidth={slashStrokeWidth} strokeLinecap="round" />
            {slot.articulation === "accent" && (
              <path d={`M ${cx - 3} ${belowSlashY + 4} L ${cx} ${belowSlashY} L ${cx + 3} ${belowSlashY + 4}`} fill="none" stroke="currentColor" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" />
            )}
            {slot.articulation === "staccato" && (
              <circle cx={cx} cy={belowSlashY + 1.5} r={1.2} fill="currentColor" />
            )}
          </g>
        );
      })}
    </svg>
  );
}
