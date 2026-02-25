import React from "react";

interface SlotSlash {
  articulation: string;
  tied: boolean;
  rest: boolean;
  stemDirection?: "up" | "down";
}

interface BeamedSlashGroupProps {
  slots: SlotSlash[];
  size?: "sm" | "md";
  selectedIndex?: number;
  articulationSize?: "sm" | "md" | "lg" | "xl";
}

// Fixed height to match SlashNotation for vertical alignment
const FIXED_HEIGHT = 72;
const SLASH_CENTER_Y = 40; // Midline: notehead center aligns with time sig gap

// Unified slash dimensions for consistency across all subdivisions
const SLASH_HEIGHT = 14;
const SLASH_WIDTH = 9;
const SLASH_STROKE = 2.2;

// Local SVG dimensions for individual noteheads (fixed size, never stretched)
// Wide enough to contain the Petaluma glyph (≈22px at fontSize=60) plus stem clearance
const NOTE_SVG_WIDTH = 32;
const NOTE_CENTER_X = NOTE_SVG_WIDTH / 2;

// ARTIC_HALF_W is the horizontal half-span (matches notehead width).
const ARTIC_HALF_W = SLASH_WIDTH / 2;             // 4.5
const ARTIC_SIZE_PCT: Record<string, number> = { sm: 0.70, md: 0.75, lg: 0.80, xl: 0.90 };

// Triplet indicator offsets from outermost beam (beam2Y) or stem-end.
// stem-up:  beam2Y(4.5)  + OFFSET_UP(-19.5) = -15  → above box, needs chord-rhythm gap
// stem-down: beam2Y(75.5) + OFFSET_DOWN(4.5) = 80   → slightly below box, acceptable overflow
const TRIPLET_OFFSET_UP = -19.5;
const TRIPLET_OFFSET_DOWN = 4.5;

/** Overlay SVG that draws tie arcs between adjacent tied slots.
 *  Uses preserveAspectRatio="none" so x-positions (in %) map to container width.
 *  Y values stay true pixels. vectorEffect="non-scaling-stroke" keeps stroke width constant. */
function TieOverlay({ slots, n }: { slots: SlotSlash[]; n: number }) {
  if (!slots.some(s => s.tied)) return null;
  const y = SLASH_CENTER_Y - SLASH_HEIGHT / 2 - 4; // 4px above notehead top, bows upward
  const bowY = y - 10;
  return (
    <svg
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: FIXED_HEIGHT, pointerEvents: 'none' }}
      viewBox={`0 0 100 ${FIXED_HEIGHT}`}
      preserveAspectRatio="none"
      overflow="visible"
    >
      {slots.map((slot, i) => {
        if (!slot.tied) return null;
        const x0 = (i + 0.5) / n * 100;
        // For last slot: extend to where the next beat's first notehead would be (one slot-width past end)
        const x1 = i < n - 1 ? (i + 1.5) / n * 100 : 100 + 50 / n;
        const mx = (x0 + x1) / 2;
        return (
          <path
            key={i}
            d={`M ${x0} ${y} Q ${mx} ${bowY} ${x1} ${y}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </svg>
  );
}

/**
 * Renders standard slash notation with stems and beams.
 * Uses HTML layout for positioning so noteheads maintain consistent size
 * regardless of container width. Beams are CSS divs that stretch between
 * percentage-positioned stems.
 */
export function BeamedSlashGroup({ slots, size = "md", selectedIndex = -1, articulationSize = "lg" }: BeamedSlashGroupProps) {
  const n = slots.length;
  const ARTIC_HALF = (SLASH_HEIGHT * (ARTIC_SIZE_PCT[articulationSize] ?? 0.80)) / 2;

  const stemDir = slots[0]?.stemDirection ?? "down";
  const isUp = stemDir === "up";

  // Sixteenth triplets: render as two separate groups of 3
  if (n === 6) {
    const group1 = slots.slice(0, 3);
    const group2 = slots.slice(3, 6);
    const group1Selected = selectedIndex >= 0 && selectedIndex < 3 ? selectedIndex : -1;
    const group2Selected = selectedIndex >= 3 ? selectedIndex - 3 : -1;
    return (
      <div className="beamed-slash-group beamed-slash-group--sixteenth-triplet relative flex items-center w-full" style={{ height: FIXED_HEIGHT }}>
        <div className="flex-1"><SixteenthTripletGroup slots={group1} size={size} selectedIndex={group1Selected} articulationSize={articulationSize} stemDir={stemDir} /></div>
        <div className="flex-1"><SixteenthTripletGroup slots={group2} size={size} selectedIndex={group2Selected} articulationSize={articulationSize} stemDir={stemDir} /></div>
        <TieOverlay slots={slots} n={6} />
      </div>
    );
  }

  const beamHeight = 3;
  const beamGap = 3.5;
  const stemWidth = 1.2;

  const isEighthTriplet = n === 3;
  const isSixteenth = n === 4;

  const slashTopY = SLASH_CENTER_Y - SLASH_HEIGHT / 2;
  const slashBottomY = SLASH_CENTER_Y + SLASH_HEIGHT / 2;

  const stemLength = 22;
  // Beam Y positions depend on stem direction
  const beam1Y = isUp
    ? slashTopY - stemLength          // = 11 (above noteheads)
    : slashBottomY + stemLength;      // = 69 (below noteheads)
  const beam2Y = isUp
    ? beam1Y - beamHeight - beamGap   // = 4.5 (slight overflow ok)
    : beam1Y + beamHeight + beamGap;  // = 75.5 (slight overflow ok)

  // All stems reach beam2Y for consistent length across subdivisions
  const stemEnd = beam2Y;

  // Single-beam divisions (eighth, eighth-triplet) draw their beam at beam2Y so it aligns
  // with the sixteenth's outer beam and stems end exactly at the beam (no gap)
  const primaryBeamY = isSixteenth ? beam1Y : beam2Y;

  // Stem x: right side (NE anchor) for up, left side (SW anchor) for down
  const stemOffset = 11;
  const stemX = isUp ? NOTE_CENTER_X + stemOffset : NOTE_CENTER_X - stemOffset;
  // Stem start at the notehead edge facing the beam
  const stemY1 = isUp ? slashTopY : slashBottomY;

  // Slot percentage positions (center of each slot)
  const getSlotPct = (i: number) => ((i + 0.5) / n) * 100;

  // Beam CSS anchors flip with stem direction
  const beamLeft  = isUp
    ? `calc(${getSlotPct(0)}% + ${stemOffset}px)`
    : `calc(${getSlotPct(0)}% - ${stemOffset}px)`;
  const beamRight = isUp
    ? `calc(${100 - getSlotPct(n - 1)}% - ${stemOffset}px)`
    : `calc(${100 - getSlotPct(n - 1)}% + ${stemOffset}px)`;

  const belowSlashY = slashBottomY + 6;
  const divisionClass = isEighthTriplet ? 'eighth-triplet' : isSixteenth ? 'sixteenth' : 'eighth';

  // Triplet indicator: offset from outermost beam (beam2Y)
  const tripletIndicatorTop = beam2Y + (isUp ? TRIPLET_OFFSET_UP : TRIPLET_OFFSET_DOWN);

  return (
    <div
      className={`beamed-slash-group beamed-slash-group--${divisionClass} relative w-full`}
      style={{ height: FIXED_HEIGHT, overflow: 'visible' }}
      role="img"
      aria-label={`Beamed rhythm, ${n} notes per beat${isEighthTriplet ? ", triplet" : ""}`}
    >
      {/* Selection highlights */}
      {slots.map((_, i) =>
        i === selectedIndex ? (
          <div
            key={`sel-${i}`}
            className="absolute top-0 bottom-0"
            style={{
              left: `${(i / n) * 100}%`,
              width: `${100 / n}%`,
              background: '#fffcba',
              opacity: 0.5,
            }}
          />
        ) : null
      )}

      {/* Triplet indicator for eighth triplets */}
      {isEighthTriplet && (
        <span
          className="beamed-slash-group__triplet-indicator absolute"
          style={{
            left: isUp ? '62%' : '39%',
            top: tripletIndicatorTop,
            transform: 'translateX(-50%)',
            fontFamily: 'Petaluma',
            fontSize: 30,
            lineHeight: 1,
              paddingLeft: 1,
            paddingRight: 1,
          }}
        >
          {String.fromCodePoint(0xe883)}
        </span>
      )}

      {/* Primary beam */}
      <div
        className="absolute bg-current"
        style={{
          left: beamLeft,
          right: beamRight,
          top: primaryBeamY - beamHeight / 2,
          height: beamHeight,
        }}
      />

      {/* Secondary beam for sixteenth notes */}
      {isSixteenth && (
        <div
          className="absolute bg-current"
          style={{
            left: beamLeft,
            right: beamRight,
            top: beam2Y - beamHeight / 2,
            height: beamHeight,
          }}
        />
      )}

      {/* Individual noteheads + stems */}
      {slots.map((slot, i) => {
        const isSelected = i === selectedIndex;

        if (slot.rest) {
          return (
            <div
              key={i}
              className={isSelected ? 'beamed-slash-group__slot--selected' : ''}
              style={{
                position: 'absolute',
                left: `${getSlotPct(i)}%`,
                transform: 'translateX(-50%)',
                top: 0,
                height: FIXED_HEIGHT,
              }}
              aria-label="Rest"
            >
              <svg width={NOTE_SVG_WIDTH} height={FIXED_HEIGHT} viewBox={`0 0 ${NOTE_SVG_WIDTH} ${FIXED_HEIGHT}`} overflow="visible" style={{ display: 'block' }}>
                <rect x={NOTE_CENTER_X - 4} y={SLASH_CENTER_Y - 2} width={8} height={4} fill="currentColor" />
              </svg>
            </div>
          );
        }

        return (
          <div
            key={i}
            className={isSelected ? 'beamed-slash-group__slot--selected' : ''}
            style={{
              position: 'absolute',
              left: `${getSlotPct(i)}%`,
              transform: 'translateX(-50%)',
              top: 0,
              height: FIXED_HEIGHT,
            }}
          >
            <svg width={NOTE_SVG_WIDTH} height={FIXED_HEIGHT} viewBox={`0 0 ${NOTE_SVG_WIDTH} ${FIXED_HEIGHT}`} overflow="visible" style={{ display: 'block' }}>
              {/* Stem */}
              <line
                x1={stemX}
                y1={stemY1}
                x2={stemX}
                y2={stemEnd}
                stroke="currentColor"
                strokeWidth={stemWidth}
                strokeLinecap="round"
              />
              {/* Slash notehead – SMuFL noteheadSlashVerticalEnds U+E100 */}
              <text
                x={NOTE_CENTER_X}
                y={SLASH_CENTER_Y}
                textAnchor="middle"
                fontFamily="Petaluma"
                fontSize={60}
                fill="currentColor"
              >{'\uE100'}</text>
              {/* Articulation marks — decode compound via string inclusion */}
              {(() => {
                const a = slot.articulation;
                const hasStaccato = a.includes("staccato");
                const hasLegato   = a.includes("legato");
                const hasMarcato  = a.includes("marcato");
                const hasAccent   = a.includes("accent");
                // Marcato above notehead; accent below (stem-down, articulations between notehead and beam)
                const marcatoAboveCY = slashTopY - 5 - ARTIC_HALF;
                const sw = size === "sm" ? 1.4 : 1.7;
                const bDotR = Math.max(1.5, ARTIC_HALF * 0.35);
                // Stack below items: legato → accent → staccato (outermost)
                let nextY = belowSlashY;
                let bLegatoY = 0;
                let bAccentCY = 0;
                let bStaccatoCY = 0;
                if (hasLegato) { bLegatoY = nextY; nextY += sw / 2 + 3; }
                if (hasAccent) { bAccentCY = nextY + ARTIC_HALF; nextY += ARTIC_HALF * 2 + 3; }
                if (hasStaccato) { bStaccatoCY = nextY + bDotR; }
                return (
                  <>
                    {/* Marcato: ^ pointing up, above beam */}
                    {hasMarcato && (
                      <path
                        d={`M ${NOTE_CENTER_X - ARTIC_HALF_W} ${marcatoAboveCY + ARTIC_HALF} L ${NOTE_CENTER_X} ${marcatoAboveCY - ARTIC_HALF} L ${NOTE_CENTER_X + ARTIC_HALF_W} ${marcatoAboveCY + ARTIC_HALF}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={sw}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                    {/* Legato (tenuto): bar below notehead */}
                    {hasLegato && (
                      <line
                        x1={NOTE_CENTER_X - ARTIC_HALF}
                        y1={bLegatoY}
                        x2={NOTE_CENTER_X + ARTIC_HALF}
                        y2={bLegatoY}
                        stroke="currentColor"
                        strokeWidth={sw}
                        strokeLinecap="round"
                      />
                    )}
                    {/* Accent: > below notehead (beamed notes always stem-down) */}
                    {hasAccent && (
                      <path
                        d={`M ${NOTE_CENTER_X - ARTIC_HALF_W} ${bAccentCY - ARTIC_HALF} L ${NOTE_CENTER_X + ARTIC_HALF_W} ${bAccentCY} L ${NOTE_CENTER_X - ARTIC_HALF_W} ${bAccentCY + ARTIC_HALF}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={sw}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                    {/* Staccato: dot, always outermost below */}
                    {hasStaccato && (
                      <circle cx={NOTE_CENTER_X} cy={bStaccatoCY} r={bDotR} fill="currentColor" />
                    )}
                  </>
                );
              })()}
            </svg>
          </div>
        );
      })}
      <TieOverlay slots={slots} n={n} />
    </div>
  );
}

/** Renders a single group of 3 sixteenth notes with double beam and "3" indicator */
function SixteenthTripletGroup({ slots, size = "md", selectedIndex = -1, articulationSize = "lg", stemDir = "down" }: { slots: SlotSlash[]; size?: "sm" | "md"; selectedIndex?: number; articulationSize?: "sm" | "md" | "lg" | "xl"; stemDir?: "up" | "down" }) {
  const n = 3;
  const ARTIC_HALF = (SLASH_HEIGHT * (ARTIC_SIZE_PCT[articulationSize] ?? 0.80)) / 2;
  const isUp = stemDir === "up";

  const beamHeight = 3;
  const beamGap = 3.5;
  const stemWidth = 1.2;

  const slashTopY = SLASH_CENTER_Y - SLASH_HEIGHT / 2;
  const slashBottomY = SLASH_CENTER_Y + SLASH_HEIGHT / 2;

  const stemLength = 22;
  const beam1Y = isUp
    ? slashTopY - stemLength          // = 11
    : slashBottomY + stemLength;      // = 69
  const beam2Y = isUp
    ? beam1Y - beamHeight - beamGap   // = 4.5
    : beam1Y + beamHeight + beamGap;  // = 75.5
  const stemEnd = beam2Y;

  const stemOffset = 9;
  const stemX = isUp ? NOTE_CENTER_X + stemOffset : NOTE_CENTER_X - stemOffset;
  const stemY1 = isUp ? slashTopY : slashBottomY;

  const getSlotPct = (i: number) => ((i + 0.5) / n) * 100;

  const beamLeft  = isUp
    ? `calc(${getSlotPct(0)}% + ${stemOffset}px)`
    : `calc(${getSlotPct(0)}% - ${stemOffset}px)`;
  const beamRight = isUp
    ? `calc(${100 - getSlotPct(n - 1)}% - ${stemOffset}px)`
    : `calc(${100 - getSlotPct(n - 1)}% + ${stemOffset}px)`;

  const belowSlashY = slashBottomY + 4;
  const tripletIndicatorTop = beam2Y + (isUp ? TRIPLET_OFFSET_UP : TRIPLET_OFFSET_DOWN);

  return (
    <div
      className="sixteenth-triplet-group relative w-full"
      style={{ height: FIXED_HEIGHT, overflow: 'visible' }}
      role="img"
      aria-label="Sixteenth triplet group"
    >
      {/* Selection highlights */}
      {slots.map((_, i) =>
        i === selectedIndex ? (
          <div
            key={`sel-${i}`}
            className="absolute top-0 bottom-0"
            style={{
              left: `${(i / n) * 100}%`,
              width: `${100 / n}%`,
              background: '#fffcba',
              opacity: 0.5,
            }}
          />
        ) : null
      )}

      {/* Triplet "3" indicator */}
      <span
        className="sixteenth-triplet-group__triplet-indicator absolute"
        style={{
          left: isUp ? '60%' : '50%',
          top: tripletIndicatorTop,
          transform: 'translateX(-50%)',
          fontFamily: 'Petaluma',
          fontSize: 30,
          lineHeight: 1,
          paddingLeft: 1,
          paddingRight: 1,
        }}
      >
        {String.fromCodePoint(0xe883)}
      </span>

      {/* Double beam */}
      <div
        className="absolute bg-current"
        style={{
          left: beamLeft,
          right: beamRight,
          top: beam1Y - beamHeight / 2,
          height: beamHeight,
        }}
      />
      <div
        className="absolute bg-current"
        style={{
          left: beamLeft,
          right: beamRight,
          top: beam2Y - beamHeight / 2,
          height: beamHeight,
        }}
      />

      {/* Individual noteheads + stems */}
      {slots.map((slot, i) => {
        const isSelected = i === selectedIndex;

        if (slot.rest) {
          return (
            <div
              key={i}
              className={isSelected ? 'sixteenth-triplet-group__slot--selected' : ''}
              style={{
                position: 'absolute',
                left: `${getSlotPct(i)}%`,
                transform: 'translateX(-50%)',
                top: 0,
                height: FIXED_HEIGHT,
              }}
              aria-label="Rest"
            >
              <svg width={NOTE_SVG_WIDTH} height={FIXED_HEIGHT} viewBox={`0 0 ${NOTE_SVG_WIDTH} ${FIXED_HEIGHT}`} overflow="visible" style={{ display: 'block' }}>
                <rect x={NOTE_CENTER_X - 3} y={SLASH_CENTER_Y - 1.5} width={6} height={3} fill="currentColor" />
              </svg>
            </div>
          );
        }

        return (
          <div
            key={i}
            className={isSelected ? 'sixteenth-triplet-group__slot--selected' : ''}
            style={{
              position: 'absolute',
              left: `${getSlotPct(i)}%`,
              transform: 'translateX(-50%)',
              top: 0,
              height: FIXED_HEIGHT,
            }}
          >
            <svg width={NOTE_SVG_WIDTH} height={FIXED_HEIGHT} viewBox={`0 0 ${NOTE_SVG_WIDTH} ${FIXED_HEIGHT}`} overflow="visible" style={{ display: 'block' }}>
              <line
                x1={stemX}
                y1={stemY1}
                x2={stemX}
                y2={stemEnd}
                stroke="currentColor"
                strokeWidth={stemWidth}
                strokeLinecap="round"
              />
              {/* Slash notehead – SMuFL noteheadSlashVerticalEnds U+E100 */}
              <text
                x={NOTE_CENTER_X}
                y={SLASH_CENTER_Y}
                textAnchor="middle"
                fontFamily="Petaluma"
                fontSize={50}
                fill="currentColor"
              >{'\uE100'}</text>
              {/* Articulation marks — decode compound via string inclusion */}
              {(() => {
                const a = slot.articulation;
                const hasStaccato = a.includes("staccato");
                const hasLegato   = a.includes("legato");
                const hasMarcato  = a.includes("marcato");
                const hasAccent   = a.includes("accent");
                // Marcato above notehead; accent below (stem-down)
                const marcatoAboveCY = slashTopY - 5 - ARTIC_HALF;
                const tDotR = Math.max(1.5, ARTIC_HALF * 0.35);
                // Stack below items: legato → accent → staccato (outermost)
                let nextY = belowSlashY;
                let tLegatoY = 0;
                let tAccentCY = 0;
                let tStaccatoCY = 0;
                if (hasLegato) { tLegatoY = nextY; nextY += 1.4 / 2 + 3; }
                if (hasAccent) { tAccentCY = nextY + ARTIC_HALF; nextY += ARTIC_HALF * 2 + 3; }
                if (hasStaccato) { tStaccatoCY = nextY + tDotR; }
                return (
                  <>
                    {/* Marcato: ^ pointing up, above beam */}
                    {hasMarcato && (
                      <path
                        d={`M ${NOTE_CENTER_X - ARTIC_HALF_W} ${marcatoAboveCY + ARTIC_HALF} L ${NOTE_CENTER_X} ${marcatoAboveCY - ARTIC_HALF} L ${NOTE_CENTER_X + ARTIC_HALF_W} ${marcatoAboveCY + ARTIC_HALF}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.4}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                    {/* Legato (tenuto): bar below notehead */}
                    {hasLegato && (
                      <line
                        x1={NOTE_CENTER_X - ARTIC_HALF}
                        y1={tLegatoY}
                        x2={NOTE_CENTER_X + ARTIC_HALF}
                        y2={tLegatoY}
                        stroke="currentColor"
                        strokeWidth={1.4}
                        strokeLinecap="round"
                      />
                    )}
                    {/* Accent: > below notehead (always stem-up) */}
                    {hasAccent && (
                      <path
                        d={`M ${NOTE_CENTER_X - ARTIC_HALF_W} ${tAccentCY - ARTIC_HALF} L ${NOTE_CENTER_X + ARTIC_HALF_W} ${tAccentCY} L ${NOTE_CENTER_X - ARTIC_HALF_W} ${tAccentCY + ARTIC_HALF}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.4}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                    {/* Staccato: dot, always outermost below */}
                    {hasStaccato && (
                      <circle cx={NOTE_CENTER_X} cy={tStaccatoCY} r={tDotR} fill="currentColor" />
                    )}
                  </>
                );
              })()}
            </svg>
          </div>
        );
      })}
    </div>
  );
}

/** Three unbeamed quarter-note slashes with a triplet "3" indicator. */
export function QuarterTripletGroup({ slots, size = "md", selectedIndex = -1, articulationSize = "lg" }: BeamedSlashGroupProps) {
  const n = 3;
  const ARTIC_HALF = (SLASH_HEIGHT * (ARTIC_SIZE_PCT[articulationSize] ?? 0.80)) / 2;
  const stemDir = slots[0]?.stemDirection ?? "down";
  const isUp = stemDir === "up";

  const slashTopY = SLASH_CENTER_Y - SLASH_HEIGHT / 2;
  const slashBottomY = SLASH_CENTER_Y + SLASH_HEIGHT / 2;

  // Stem length matches beamed notes and SlashNotation quarter stems
  const STEM_LENGTH = 28.5;
  const stemEnd = isUp ? slashTopY - STEM_LENGTH : slashBottomY + STEM_LENGTH; // 4.5 or 75.5

  const stemWidth = 1.2;
  const stemOffset = 11;
  const stemX = isUp ? NOTE_CENTER_X + stemOffset : NOTE_CENTER_X - stemOffset;
  const stemY1 = isUp ? slashTopY : slashBottomY;

  const getSlotPct = (i: number) => ((i + 0.5) / n) * 100;
  const belowSlashY = slashBottomY + 6;
  // Triplet indicator: offset from stem-end (equivalent to beam2Y for beamed notes)
  const tripletIndicatorTop = stemEnd + (isUp ? TRIPLET_OFFSET_UP : TRIPLET_OFFSET_DOWN);

  const sw = size === "sm" ? 1.4 : 1.7;
  const bDotR = Math.max(1.5, ARTIC_HALF * 0.35);

  // Bracket line geometry
  const indicatorPct = 50;                        // centered on triplet group
  const bracketY = isUp ? -10 : 86;
  const hookH = 6;
  const textGap = 10;                            // px gap between "3" text and bracket
  const bracketExtent = SLASH_WIDTH / 2 + 3;     // 3px past notehead edge

  return (
    <div
      className="quarter-triplet-group relative w-full"
      style={{ height: FIXED_HEIGHT, overflow: 'visible' }}
      role="img"
      aria-label="Quarter triplet"
    >
      {/* Selection highlights */}
      {slots.map((_, i) =>
        i === selectedIndex ? (
          <div
            key={`sel-${i}`}
            className="absolute top-0 bottom-0"
            style={{ left: `${(i / n) * 100}%`, width: `${100 / n}%`, background: '#fffcba', opacity: 0.5 }}
          />
        ) : null
      )}

      {/* Triplet bracket: ┘ 3 └ (stem-up) or ┐ 3 ┌ (stem-down) */}
      {/* Left horizontal line */}
      <div className="quarter-triplet-group__bracket quarter-triplet-group__bracket--horizontal-left absolute" style={{
        left: `calc(${getSlotPct(0)}% - ${bracketExtent}px)`,
        right: `calc(${100 - indicatorPct}% + ${textGap}px)`,
        top: bracketY,
        height: 2,
      }} />
      {/* Right horizontal line */}
      <div className="quarter-triplet-group__bracket quarter-triplet-group__bracket--horizontal-right absolute" style={{
        left: `calc(${indicatorPct}% + ${textGap}px)`,
        right: `calc(${100 - getSlotPct(2)}% - ${bracketExtent}px)`,
        top: bracketY,
        height: 2,
      }} />
      {/* Left end hook */}
      <div className="quarter-triplet-group__bracket quarter-triplet-group__bracket--left-end absolute" style={{
        left: `calc(${getSlotPct(0)}% - ${bracketExtent}px)`,
        top: isUp ? bracketY : bracketY - hookH,
        width: 2,
        height: hookH,
      }} />
      {/* Right end hook */}
      <div className="quarter-triplet-group__bracket quarter-triplet-group__bracket--right-end absolute" style={{
        left: `calc(${getSlotPct(2)}% + ${bracketExtent}px)`,
        top: isUp ? bracketY : bracketY - hookH,
        width: 2,
        height: hookH,
      }} />

      {/* Triplet "3" indicator on beam side */}
      <span
        className="quarter-triplet-group__triplet-indicator absolute"
        style={{
          left: '50%',
          top: tripletIndicatorTop,
          transform: 'translateX(-50%)',
          fontFamily: 'Petaluma',
          fontSize: 30,
          lineHeight: 1,
          paddingLeft: 1,
          paddingRight: 1,
        }}
      >
        {String.fromCodePoint(0xe883)}
      </span>

      {/* Individual noteheads + stems */}
      {slots.map((slot, i) => {
        const isSelected = i === selectedIndex;
        if (slot.rest) {
          return (
            <div
              key={i}
              className={isSelected ? 'quarter-triplet-group__slot--selected' : ''}
              style={{ position: 'absolute', left: `${getSlotPct(i)}%`, transform: 'translateX(-50%)', top: 0, height: FIXED_HEIGHT }}
              aria-label="Rest"
            >
              <svg width={NOTE_SVG_WIDTH} height={FIXED_HEIGHT} viewBox={`0 0 ${NOTE_SVG_WIDTH} ${FIXED_HEIGHT}`} overflow="visible" style={{ display: 'block' }}>
                <text x={NOTE_CENTER_X} y={SLASH_CENTER_Y + 8} textAnchor="middle" fontFamily="Petaluma" fontSize={36} fill="currentColor">{'\uE4E5'}</text>
              </svg>
            </div>
          );
        }
        return (
          <div
            key={i}
            className={isSelected ? 'quarter-triplet-group__slot--selected' : ''}
            style={{ position: 'absolute', left: `${getSlotPct(i)}%`, transform: 'translateX(-50%)', top: 0, height: FIXED_HEIGHT }}
          >
            <svg width={NOTE_SVG_WIDTH} height={FIXED_HEIGHT} viewBox={`0 0 ${NOTE_SVG_WIDTH} ${FIXED_HEIGHT}`} overflow="visible" style={{ display: 'block' }}>
              {/* Stem */}
              <line x1={stemX} y1={stemY1} x2={stemX} y2={stemEnd} stroke="currentColor" strokeWidth={stemWidth} strokeLinecap="round" />
              {/* Quarter slash notehead (filled) */}
              <text x={NOTE_CENTER_X} y={SLASH_CENTER_Y} textAnchor="middle" fontFamily="Petaluma" fontSize={60} fill="currentColor">{'\uE100'}</text>
              {/* Articulations */}
              {(() => {
                const a = slot.articulation;
                const hasStaccato = a.includes("staccato");
                const hasLegato   = a.includes("legato");
                const hasMarcato  = a.includes("marcato");
                const hasAccent   = a.includes("accent");
                const marcatoAboveCY = slashTopY - 5 - ARTIC_HALF;
                let nextY = belowSlashY;
                let bLegatoY = 0, bAccentCY = 0, bStaccatoCY = 0;
                if (hasLegato) { bLegatoY = nextY; nextY += sw / 2 + 3; }
                if (hasAccent) { bAccentCY = nextY + ARTIC_HALF; nextY += ARTIC_HALF * 2 + 3; }
                if (hasStaccato) { bStaccatoCY = nextY + bDotR; }
                return (
                  <>
                    {hasMarcato && <path d={`M ${NOTE_CENTER_X - ARTIC_HALF_W} ${marcatoAboveCY + ARTIC_HALF} L ${NOTE_CENTER_X} ${marcatoAboveCY - ARTIC_HALF} L ${NOTE_CENTER_X + ARTIC_HALF_W} ${marcatoAboveCY + ARTIC_HALF}`} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />}
                    {hasLegato && <line x1={NOTE_CENTER_X - ARTIC_HALF} y1={bLegatoY} x2={NOTE_CENTER_X + ARTIC_HALF} y2={bLegatoY} stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />}
                    {hasAccent && <path d={`M ${NOTE_CENTER_X - ARTIC_HALF_W} ${bAccentCY - ARTIC_HALF} L ${NOTE_CENTER_X + ARTIC_HALF_W} ${bAccentCY} L ${NOTE_CENTER_X - ARTIC_HALF_W} ${bAccentCY + ARTIC_HALF}`} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />}
                    {hasStaccato && <circle cx={NOTE_CENTER_X} cy={bStaccatoCY} r={bDotR} fill="currentColor" />}
                  </>
                );
              })()}
            </svg>
          </div>
        );
      })}
      <TieOverlay slots={slots} n={n} />
    </div>
  );
}
