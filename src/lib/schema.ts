import { z } from "zod";

// =============================================================================
// CHORD SCHEMAS
// =============================================================================

// Standard chord schema with full alteration support
export const ChordSchema = z.object({
  root: z.enum([
    "C", "C#", "Db", "D", "D#", "Eb", "E", "F",
    "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B",
  ]),
  quality: z.string(), // Validated against CHORD_QUALITIES in parser
  bass: z.enum([
    "C", "C#", "Db", "D", "D#", "Eb", "E", "F",
    "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B",
  ]).optional(),
  extensions: z.array(z.string()).optional(),
  // Scale degree for hybrid Nashville display (e.g., show "1" instead of "C" in key of C)
  degree: z.enum([
    "1", "2", "3", "4", "5", "6", "7",
    "b1", "b2", "b3", "b4", "b5", "b6", "b7",
    "#1", "#2", "#3", "#4", "#5", "#6", "#7",
  ]).optional(),
});

// Nashville chord schema
export const NashvilleChordSchema = z.object({
  degree: z.enum([
    "1", "2", "3", "4", "5", "6", "7",
    "b1", "b2", "b3", "b4", "b5", "b6", "b7",
    "#1", "#2", "#3", "#4", "#5", "#6", "#7",
  ]),
  quality: z.string().optional(),
  bass: z.enum([
    "1", "2", "3", "4", "5", "6", "7",
    "b1", "b2", "b3", "b4", "b5", "b6", "b7",
    "#1", "#2", "#3", "#4", "#5", "#6", "#7",
  ]).optional(),
  extensions: z.array(z.string()).optional(),
});

// Polychord schema for upper structure triads (e.g., D/C7 = D triad over C7)
export const PolychordSchema = z.object({
  upper: ChordSchema,
  lower: ChordSchema,
});

// =============================================================================
// RHYTHM & NOTATION SCHEMAS
// =============================================================================

// Articulation marks including fermata
export const ArticulationEnum = z.enum([
  "none",
  "accent",      // >
  "staccato",    // .
  "marcato",     // ^
  "tenuto",      // -
  "fermata",     // 𝄐
]);

// Tie types for proper notation
export const TieTypeEnum = z.enum([
  "none",        // No tie
  "start",       // Start of tie (connects to next)
  "stop",        // End of tie (connects from previous)
  "continue",    // Middle of tie (both directions)
]);

// Slash notation (rhythm) schema with enhanced tie support
export const SlashSchema = z.object({
  articulation: ArticulationEnum.default("none"),
  tie: TieTypeEnum.default("none"),
  rest: z.boolean().default(false),
  // For dotted rhythms: multiplier on base slot duration (1.0 = normal, 1.5 = dotted)
  // Most rendering uses ties instead, but this enables explicit dotted notation
  durationMultiplier: z.number().min(0.25).max(4).default(1),
});

// Single beat slot schema
export const BeatSlotSchema = z.object({
  id: z.string(),
  // Standard chord (mutually exclusive with nashvilleChord and polychord)
  chord: ChordSchema.nullable().default(null),
  // Nashville notation chord
  nashvilleChord: NashvilleChordSchema.nullable().default(null),
  // Polychord for upper structure notation
  polychord: PolychordSchema.nullable().default(null),
  // Rhythm slash notation
  slash: SlashSchema.default({
    articulation: "none",
    tie: "none",
    rest: false,
    durationMultiplier: 1
  }),
  // Anticipation/push: chord is played slightly before this beat position
  // Common in jazz/pop for rhythmic interest
  push: z.boolean().default(false),
  // Hide chord symbol (for tied sustains where chord shouldn't repeat visually)
  hidden: z.boolean().default(false),
});

// Beat division options
export const DivisionEnum = z.enum([
  "quarter",           // 1 slot per beat
  "eighth",            // 2 slots per beat
  "eighthTriplet",     // 3 slots per beat
  "sixteenth",         // 4 slots per beat
  "sixteenthTriplet",  // 6 slots per beat
  // Compound meters
  "dottedQuarter",     // For 6/8, 9/8, 12/8 - 1 slot per dotted quarter
  "dottedEighth",      // 2 slots per dotted quarter beat
]);

// Beat schema (contains slots based on division)
export const BeatSchema = z.object({
  id: z.string(),
  division: DivisionEnum.default("quarter"),
  slots: z.array(BeatSlotSchema),
  dynamics: z.string().nullable().default(null),
  lyrics: z.string().nullable().default(null),
});

// =============================================================================
// MEASURE & STRUCTURE SCHEMAS
// =============================================================================

// Barline types
export const BarlineEnum = z.enum([
  "single",
  "double",
  "final",
  "repeatStart",
  "repeatEnd",
  "repeatBoth",  // For ||: :|| in the middle of a repeated section
]);

// Ending bracket schema for first/second endings spanning multiple measures
export const EndingBracketSchema = z.object({
  number: z.number().min(1).max(8), // Ending number (1, 2, 3...)
  type: z.enum(["start", "stop", "discontinue"]), // MusicXML-style bracket control
});

// Measure schema
export const MeasureSchema = z.object({
  id: z.string(),
  instruction: z.string().nullable().default(null), // Performance instruction above measure
  barlineStart: BarlineEnum.default("single"),
  barlineEnd: BarlineEnum.default("single"),
  beats: z.array(BeatSchema),
  repeatCount: z.number().default(2), // For repeat endings
  ending: EndingBracketSchema.nullable().default(null), // First/second ending bracket
  // Simile marks: repeat previous measure(s)
  simile: z.boolean().default(false), // Single measure repeat (%)
  simileCount: z.number().min(1).max(8).default(1), // Multi-measure repeat (% x N)
  // Measure-level time signature change (null = inherit from section)
  timeSignatureChange: z.object({
    beats: z.number().min(1).max(16),
    beatUnit: z.number().refine((v) => [2, 4, 8, 16].includes(v)),
  }).nullable().default(null),
});

// =============================================================================
// TIME SIGNATURE & NAVIGATION
// =============================================================================

// Time signature schema
export const TimeSignatureSchema = z.object({
  beats: z.number().min(1).max(16),
  beatUnit: z.number().refine((v) => [2, 4, 8, 16].includes(v)),
});

// Key signature schema
export const KeySignatureSchema = z.object({
  root: z.enum([
    "C", "C#", "Db", "D", "D#", "Eb", "E", "F",
    "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B",
  ]),
  mode: z.enum(["major", "minor", "dorian", "mixolydian", "lydian", "phrygian", "locrian"]).default("major"),
});

// Navigation marker schema
export const NavigationSchema = z.object({
  type: z.enum([
    "segno",     // 𝄋
    "coda",      // 𝄌
    "dsCoda",    // D.S. al Coda
    "dsSegno",   // D.S. al Segno
    "dcCoda",    // D.C. al Coda
    "dcFine",    // D.C. al Fine
    "fine",      // Fine
    "toCoda",    // To Coda 𝄌
    "dsAlFine",  // D.S. al Fine
  ]),
  targetSectionId: z.string().optional(),
  targetMeasureId: z.string().optional(),
});

// =============================================================================
// SECTION SCHEMA
// =============================================================================

// Section schema with key signature support
export const SectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  timeSignature: TimeSignatureSchema,
  // Per-section key signature (for modulations)
  keySignature: KeySignatureSchema.nullable().default(null),
  measures: z.array(MeasureSchema),
  navigation: NavigationSchema.nullable().default(null),
  rehearsalMark: z.string().nullable().default(null), // A, B, C or custom
  // Section repeat count (play this section N times)
  repeatCount: z.number().min(1).default(1),
});

// =============================================================================
// CHART METADATA
// =============================================================================

// External identifiers for linking to music databases
export const ExternalIdsSchema = z.object({
  spotifyId: z.string().optional(),
  musicBrainzId: z.string().optional(),
  isrc: z.string().optional(), // International Standard Recording Code
  iswc: z.string().optional(), // International Standard Musical Work Code
  iRealProUrl: z.string().optional(), // Original irealb:// URL for round-trip
});

// Source attribution for imported charts
export const SourceSchema = z.object({
  name: z.string(), // e.g., "iReal Pro", "Ultimate Guitar", "User transcription"
  url: z.string().optional(),
  transcriber: z.string().optional(),
  confidence: z.enum(["verified", "high", "medium", "low"]).optional(),
  importedAt: z.string().optional(), // ISO date
});

// Chart metadata schema with full attribution
export const ChartMetaSchema = z.object({
  title: z.string().default("Untitled"),
  composer: z.string().default(""),
  arranger: z.string().default(""),
  lyricist: z.string().default(""),
  copyright: z.string().default(""),

  // Musical properties
  key: z.string().default("C"),
  tempo: z.number().default(120),
  tempoText: z.string().default(""), // "Medium Swing", "Ballad", etc.
  style: z.string().default(""), // "Swing", "Bossa Nova", "Rock", "Ballad"
  genre: z.string().default(""), // "Jazz", "Pop", "Country", "Blues"

  // Display preferences
  notationType: z.enum(["standard", "nashville"]).default("standard"),
  measuresPerLine: z.number().default(4),

  // Cataloging
  year: z.number().nullable().default(null),
  album: z.string().default(""),
  artist: z.string().default(""), // Performer (distinct from composer)

  // External references
  externalIds: ExternalIdsSchema.optional(),
  source: SourceSchema.optional(),

  // User metadata
  tags: z.array(z.string()).default([]),
  notes: z.string().default(""),
});

// =============================================================================
// FULL CHORD CHART SCHEMA
// =============================================================================

// Chord dictionary for normalization (optional optimization)
// Charts can reference chords by ID instead of repeating full chord objects
export const ChordDictionaryEntrySchema = z.object({
  id: z.string(),
  chord: ChordSchema.optional(),
  nashvilleChord: NashvilleChordSchema.optional(),
  polychord: PolychordSchema.optional(),
});

// Full chord chart schema
export const ChordChartSchema = z.object({
  version: z.literal("1.1"), // Bumped for new features
  meta: ChartMetaSchema,
  sections: z.array(SectionSchema),
  // Optional chord dictionary for deduplication
  chordDictionary: z.array(ChordDictionaryEntrySchema).optional(),
});

// =============================================================================
// TYPESCRIPT TYPES
// =============================================================================

export type Chord = z.infer<typeof ChordSchema>;
export type NashvilleChord = z.infer<typeof NashvilleChordSchema>;
export type Polychord = z.infer<typeof PolychordSchema>;
export type Articulation = z.infer<typeof ArticulationEnum>;
export type TieType = z.infer<typeof TieTypeEnum>;
export type Slash = z.infer<typeof SlashSchema>;
export type BeatSlot = z.infer<typeof BeatSlotSchema>;
export type Division = z.infer<typeof DivisionEnum>;
export type Beat = z.infer<typeof BeatSchema>;
export type Barline = z.infer<typeof BarlineEnum>;
export type EndingBracket = z.infer<typeof EndingBracketSchema>;
export type Measure = z.infer<typeof MeasureSchema>;
export type TimeSignature = z.infer<typeof TimeSignatureSchema>;
export type KeySignature = z.infer<typeof KeySignatureSchema>;
export type Navigation = z.infer<typeof NavigationSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type ExternalIds = z.infer<typeof ExternalIdsSchema>;
export type Source = z.infer<typeof SourceSchema>;
export type ChartMeta = z.infer<typeof ChartMetaSchema>;
export type ChordDictionaryEntry = z.infer<typeof ChordDictionaryEntrySchema>;
export type ChordChart = z.infer<typeof ChordChartSchema>;

// =============================================================================
// SELECTION TYPES FOR EDITOR STATE
// =============================================================================

export type SelectionType = "measure" | "beat" | "slot" | "section";

export interface Selection {
  type: SelectionType;
  sectionId: string;
  measureId?: string;
  beatId?: string;
  slotId?: string;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/** Create a default empty beat slot */
export function createEmptySlot(id: string): BeatSlot {
  return {
    id,
    chord: null,
    nashvilleChord: null,
    polychord: null,
    slash: { articulation: "none", tie: "none", rest: false, durationMultiplier: 1 },
    push: false,
    hidden: false,
  };
}

/** Create a beat with the specified division */
export function createBeat(id: string, division: Division = "quarter"): Beat {
  const slotCounts: Record<Division, number> = {
    quarter: 1,
    eighth: 2,
    eighthTriplet: 3,
    sixteenth: 4,
    sixteenthTriplet: 6,
    dottedQuarter: 1,
    dottedEighth: 2,
  };

  const slots = Array.from({ length: slotCounts[division] }, (_, i) =>
    createEmptySlot(`${id}-slot-${i}`)
  );

  return {
    id,
    division,
    slots,
    dynamics: null,
    lyrics: null,
  };
}

/** Create an empty measure with the specified time signature */
export function createMeasure(id: string, timeSignature: TimeSignature): Measure {
  const beats = Array.from({ length: timeSignature.beats }, (_, i) =>
    createBeat(`${id}-beat-${i}`)
  );

  return {
    id,
    instruction: null,
    barlineStart: "single",
    barlineEnd: "single",
    beats,
    repeatCount: 2,
    ending: null,
    simile: false,
    simileCount: 1,
    timeSignatureChange: null,
  };
}

/** Create a new section */
export function createSection(
  id: string,
  name: string,
  timeSignature: TimeSignature = { beats: 4, beatUnit: 4 },
  measureCount: number = 4
): Section {
  const measures = Array.from({ length: measureCount }, (_, i) =>
    createMeasure(`${id}-measure-${i}`, timeSignature)
  );

  return {
    id,
    name,
    timeSignature,
    keySignature: null,
    measures,
    navigation: null,
    rehearsalMark: null,
    repeatCount: 1,
  };
}

/** Create a new chord chart */
export function createChordChart(title: string = "Untitled"): ChordChart {
  return {
    version: "1.1",
    meta: {
      title,
      composer: "",
      arranger: "",
      lyricist: "",
      copyright: "",
      key: "C",
      tempo: 120,
      tempoText: "",
      style: "",
      genre: "",
      notationType: "standard",
      measuresPerLine: 4,
      year: null,
      album: "",
      artist: "",
      tags: [],
      notes: "",
    },
    sections: [createSection("section-0", "A", { beats: 4, beatUnit: 4 }, 4)],
  };
}
