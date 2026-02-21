import { z } from "zod";

// Chord schema
export const ChordSchema = z.object({
  root: z.string(),
  quality: z.string(),
  bass: z.string().optional(),
  extensions: z.array(z.string()).optional(),
});

// Nashville chord schema
export const NashvilleChordSchema = z.object({
  degree: z.string(),
  quality: z.string().optional(),
  bass: z.string().optional(),
});

// Slash notation (rhythm) schema
export const SlashSchema = z.object({
  articulation: z.enum(["none", "accent", "staccato", "marcato", "legato"]).default("none"),
  tied: z.boolean().default(false),
  rest: z.boolean().default(false),
});

// Single beat slot schema
export const BeatSlotSchema = z.object({
  id: z.string(),
  chord: ChordSchema.nullable().default(null),
  nashvilleChord: NashvilleChordSchema.nullable().default(null),
  slash: SlashSchema.default({ articulation: "none", tied: false, rest: false }),
});

// Beat schema (contains slots based on division)
export const BeatSchema = z.object({
  id: z.string(),
  division: z.enum(["quarter", "eighth", "eighthTriplet", "sixteenth", "sixteenthTriplet"]).default("quarter"),
  slots: z.array(BeatSlotSchema),
  dynamics: z.string().nullable().default(null),
  lyrics: z.string().nullable().default(null),
});

// Measure schema
export const MeasureSchema = z.object({
  id: z.string(),
  instruction: z.string().nullable().default(null),
  barlineStart: z.enum(["single", "double", "repeatStart"]).default("single"),
  barlineEnd: z.enum(["single", "double", "final", "repeatEnd"]).default("single"),
  beats: z.array(BeatSchema),
  repeatStart: z.boolean().default(false),
  repeatEnd: z.boolean().default(false),
  repeatCount: z.number().default(2),
  ending: z.number().nullable().default(null),
});

// Time signature schema
export const TimeSignatureSchema = z.object({
  beats: z.number().min(1).max(16),
  beatUnit: z.number().refine((v) => [2, 4, 8, 16].includes(v)),
});

// Navigation marker schema
export const NavigationSchema = z.object({
  type: z.enum([
    "segno", "coda", "dsCoda", "dsSegno",
    "dcCoda", "dcFine", "fine", "toCoda"
  ]),
  targetSectionId: z.string().optional(),
});

// Section schema
export const SectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  timeSignature: TimeSignatureSchema,
  measures: z.array(MeasureSchema),
  navigation: NavigationSchema.nullable().default(null),
  rehearsalMark: z.string().nullable().default(null),
});

// Chart metadata schema
export const ChartMetaSchema = z.object({
  title: z.string().default("Untitled"),
  composer: z.string().default(""),
  arranger: z.string().default(""),
  key: z.string().default("C"),
  tempo: z.number().default(120),
  tempoText: z.string().default(""),
  notationType: z.enum(["standard", "nashville"]).default("standard"),
  measuresPerLine: z.number().default(4),
});

// Full chord chart schema
export const ChordChartSchema = z.object({
  version: z.literal("1.0"),
  meta: ChartMetaSchema,
  sections: z.array(SectionSchema),
});

// TypeScript types derived from schemas
export type Chord = z.infer<typeof ChordSchema>;
export type NashvilleChord = z.infer<typeof NashvilleChordSchema>;
export type Slash = z.infer<typeof SlashSchema>;
export type BeatSlot = z.infer<typeof BeatSlotSchema>;
export type Beat = z.infer<typeof BeatSchema>;
export type Measure = z.infer<typeof MeasureSchema>;
export type TimeSignature = z.infer<typeof TimeSignatureSchema>;
export type Navigation = z.infer<typeof NavigationSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type ChartMeta = z.infer<typeof ChartMetaSchema>;
export type ChordChart = z.infer<typeof ChordChartSchema>;

// Selection types for editor state
export type SelectionType = "measure" | "beat" | "slot" | "section";

export interface Selection {
  type: SelectionType;
  sectionId: string;
  measureId?: string;
  beatId?: string;
  slotId?: string;
}
