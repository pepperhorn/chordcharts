import React from "react";

interface SlotSlash {
  articulation: string;
  tied: boolean;
  rest: boolean;
}

interface BeamedSlashGroupProps {
  slots: SlotSlash[];
  size?: "sm" | "md";
  selectedIndex?: number;
}

// Fixed height to match SlashNotation for vertical alignment
const FIXED_HEIGHT = 72;
const SLASH_CENTER_Y = 50; // Positioned lower to allow for longer stems

// Unified slash dimensions for consistency across all subdivisions
const SLASH_HEIGHT = 14;
const SLASH_WIDTH = 9;
const SLASH_STROKE = 2.2;

// Local SVG dimensions for individual noteheads (fixed size, never stretched)
// Wide enough to contain the Petaluma glyph (≈22px at fontSize=60) plus stem clearance
const NOTE_SVG_WIDTH = 32;
const NOTE_CENTER_X = NOTE_SVG_WIDTH / 2;

// 75% of notehead height — target size for accent, marcato, and legato marks.
// ARTIC_HALF is the ± offset from mark centre (marks span 10.5px total).
// ARTIC_HALF_W is the horizontal half-span (matches notehead width).
const ARTIC_HALF = (SLASH_HEIGHT * 0.75) / 2;   // 5.25
const ARTIC_HALF_W = SLASH_WIDTH / 2;             // 4.5

/**
 * Renders standard slash notation with stems and beams.
 * Uses HTML layout for positioning so noteheads maintain consistent size
 * regardless of container width. Beams are CSS divs that stretch between
 * percentage-positioned stems.
 */
export function BeamedSlashGroup({ slots, size = "md", selectedIndex = -1 }: BeamedSlashGroupProps) {
  const n = slots.length;

  // Sixteenth triplets: render as two separate groups of 3
  if (n === 6) {
    const group1 = slots.slice(0, 3);
    const group2 = slots.slice(3, 6);
    const group1Selected = selectedIndex >= 0 && selectedIndex < 3 ? selectedIndex : -1;
    const group2Selected = selectedIndex >= 3 ? selectedIndex - 3 : -1;
    return (
      <div className="beamed-slash-group beamed-slash-group--sixteenth-triplet flex items-center w-full">
        <div className="flex-1"><SixteenthTripletGroup slots={group1} size={size} selectedIndex={group1Selected} /></div>
        <div className="flex-1"><SixteenthTripletGroup slots={group2} size={size} selectedIndex={group2Selected} /></div>
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

  const beam1Y = 15 + beamHeight / 2;
  const beam2Y = beam1Y + beamHeight + beamGap;
  const stemTop = 16; // stem starts 1px below beam top for a clean cap

  // Slot percentage positions (center of each slot)
  const getSlotPct = (i: number) => ((i + 0.5) / n) * 100;
  // Stem-up SE anchor: ~0.73 staff spaces right of notehead centre.
  // At fontSize=60 → staff space=15px → 11px.  Matches Petaluma SMuFL anchor.
  const stemOffset = 11;

  const belowSlashY = slashBottomY + 6;
  const divisionClass = isEighthTriplet ? 'eighth-triplet' : isSixteenth ? 'sixteenth' : 'eighth';

  return (
    <div
      className={`beamed-slash-group beamed-slash-group--${divisionClass} relative w-full`}
      style={{ height: FIXED_HEIGHT }}
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
            left: `calc(50% + 10px)`,
            top: 1,
            transform: 'translateX(-50%)',
            fontFamily: 'PetalumaScript',
            fontSize: 14,
            fontWeight: 'bold',
            fontStyle: 'italic',
            lineHeight: 1,
            backgroundColor: 'hsl(var(--background))',
            paddingLeft: 1,
            paddingRight: 1,
          }}
        >
          3
        </span>
      )}

      {/* Primary beam */}
      <div
        className="absolute bg-current"
        style={{
          left: `calc(${getSlotPct(0)}% + ${stemOffset}px)`,
          right: `calc(${100 - getSlotPct(n - 1)}% - ${stemOffset}px)`,
          top: beam1Y - beamHeight / 2,
          height: beamHeight,
        }}
      />

      {/* Secondary beam for sixteenth notes */}
      {isSixteenth && (
        <div
          className="absolute bg-current"
          style={{
            left: `calc(${getSlotPct(0)}% + ${stemOffset}px)`,
            right: `calc(${100 - getSlotPct(n - 1)}% - ${stemOffset}px)`,
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
                x1={NOTE_CENTER_X + stemOffset}
                y1={stemTop}
                x2={NOTE_CENTER_X + stemOffset}
                y2={slashTopY}
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
                // Above mark centre: just above the primary beam
                const aboveCY = (beam1Y - beamHeight / 2) - ARTIC_HALF;
                const sw = size === "sm" ? 1.4 : 1.7;
                return (
                  <>
                    {/* Accent: > pointing right, above beam */}
                    {hasAccent && (
                      <path
                        d={`M ${NOTE_CENTER_X - ARTIC_HALF_W} ${aboveCY - ARTIC_HALF} L ${NOTE_CENTER_X + ARTIC_HALF_W} ${aboveCY} L ${NOTE_CENTER_X - ARTIC_HALF_W} ${aboveCY + ARTIC_HALF}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={sw}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                    {/* Marcato: ^ pointing up, above beam */}
                    {hasMarcato && (
                      <path
                        d={`M ${NOTE_CENTER_X - ARTIC_HALF_W} ${aboveCY + ARTIC_HALF} L ${NOTE_CENTER_X} ${aboveCY - ARTIC_HALF} L ${NOTE_CENTER_X + ARTIC_HALF_W} ${aboveCY + ARTIC_HALF}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={sw}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                    {/* Staccato: dot below notehead */}
                    {hasStaccato && (
                      <circle cx={NOTE_CENTER_X} cy={belowSlashY + 2} r={size === "sm" ? 1.5 : 2} fill="currentColor" />
                    )}
                    {/* Legato (tenuto): bar below notehead, 75% of notehead height wide */}
                    {hasLegato && (
                      <line
                        x1={NOTE_CENTER_X - ARTIC_HALF}
                        y1={belowSlashY + 2}
                        x2={NOTE_CENTER_X + ARTIC_HALF}
                        y2={belowSlashY + 2}
                        stroke="currentColor"
                        strokeWidth={sw}
                        strokeLinecap="round"
                      />
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

/** Renders a single group of 3 sixteenth notes with double beam and "3" indicator */
function SixteenthTripletGroup({ slots, size = "md", selectedIndex = -1 }: { slots: SlotSlash[]; size?: "sm" | "md"; selectedIndex?: number }) {
  const n = 3;

  const beamHeight = 3;
  const beamGap = 3.5;
  const stemWidth = 1.2;

  const slashTopY = SLASH_CENTER_Y - SLASH_HEIGHT / 2;
  const slashBottomY = SLASH_CENTER_Y + SLASH_HEIGHT / 2;

  const beam1Y = 15 + beamHeight / 2;
  const beam2Y = beam1Y + beamHeight + beamGap;
  const stemTop = 16; // stem starts 1px below beam top for a clean cap

  const getSlotPct = (i: number) => ((i + 0.5) / n) * 100;
  // fontSize=50 → staff space=12.5px → SE anchor ~0.73×12.5 ≈ 9px
  const stemOffset = 9;
  const belowSlashY = slashBottomY + 4;

  return (
    <div
      className="sixteenth-triplet-group relative w-full"
      style={{ height: FIXED_HEIGHT }}
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
          left: `calc(50% + 10px)`,
          top: 1,
          transform: 'translateX(-50%)',
          fontFamily: 'PetalumaScript',
          fontSize: 14,
          fontWeight: 'bold',
          fontStyle: 'italic',
          lineHeight: 1,
          backgroundColor: 'hsl(var(--background))',
          paddingLeft: 1,
          paddingRight: 1,
        }}
      >
        3
      </span>

      {/* Double beam */}
      <div
        className="absolute bg-current"
        style={{
          left: `calc(${getSlotPct(0)}% + ${stemOffset}px)`,
          right: `calc(${100 - getSlotPct(n - 1)}% - ${stemOffset}px)`,
          top: beam1Y - beamHeight / 2,
          height: beamHeight,
        }}
      />
      <div
        className="absolute bg-current"
        style={{
          left: `calc(${getSlotPct(0)}% + ${stemOffset}px)`,
          right: `calc(${100 - getSlotPct(n - 1)}% - ${stemOffset}px)`,
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
                x1={NOTE_CENTER_X + stemOffset}
                y1={stemTop}
                x2={NOTE_CENTER_X + stemOffset}
                y2={slashTopY}
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
                // Above mark centre: just above the primary beam
                const aboveCY = (beam1Y - beamHeight / 2) - ARTIC_HALF;
                return (
                  <>
                    {/* Accent: > pointing right, above beam */}
                    {hasAccent && (
                      <path
                        d={`M ${NOTE_CENTER_X - ARTIC_HALF_W} ${aboveCY - ARTIC_HALF} L ${NOTE_CENTER_X + ARTIC_HALF_W} ${aboveCY} L ${NOTE_CENTER_X - ARTIC_HALF_W} ${aboveCY + ARTIC_HALF}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.4}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                    {/* Marcato: ^ pointing up, above beam */}
                    {hasMarcato && (
                      <path
                        d={`M ${NOTE_CENTER_X - ARTIC_HALF_W} ${aboveCY + ARTIC_HALF} L ${NOTE_CENTER_X} ${aboveCY - ARTIC_HALF} L ${NOTE_CENTER_X + ARTIC_HALF_W} ${aboveCY + ARTIC_HALF}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.4}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                    {/* Staccato: dot below notehead */}
                    {hasStaccato && (
                      <circle cx={NOTE_CENTER_X} cy={belowSlashY + 1.5} r={1.5} fill="currentColor" />
                    )}
                    {/* Legato (tenuto): bar below notehead, 75% of notehead height wide */}
                    {hasLegato && (
                      <line
                        x1={NOTE_CENTER_X - ARTIC_HALF}
                        y1={belowSlashY + 2}
                        x2={NOTE_CENTER_X + ARTIC_HALF}
                        y2={belowSlashY + 2}
                        stroke="currentColor"
                        strokeWidth={1.4}
                        strokeLinecap="round"
                      />
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
