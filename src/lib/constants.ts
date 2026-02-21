// Time signature presets
export const TIME_SIGNATURES = [
  { beats: 4, beatUnit: 4, label: "4/4" },
  { beats: 2, beatUnit: 4, label: "2/4" },
  { beats: 3, beatUnit: 4, label: "3/4" },
  { beats: 6, beatUnit: 8, label: "6/8" },
  { beats: 9, beatUnit: 8, label: "9/8" },
  { beats: 12, beatUnit: 8, label: "12/8" },
  { beats: 5, beatUnit: 4, label: "5/4" },
] as const;

// Beat division options (1–5 keys: 1=quarter, 2=eighth, 3=eighth triplet, 4=sixteenth, 5=sixteenth triplet)
export const DIVISIONS = {
  quarter: { slots: 1, label: "Quarter" },
  eighth: { slots: 2, label: "Eighth" },
  eighthTriplet: { slots: 3, label: "Eighth Triplet" },
  sixteenth: { slots: 4, label: "Sixteenth" },
  sixteenthTriplet: { slots: 6, label: "Sixteenth Triplet" },
} as const;

// Barline types
export const BARLINE_TYPES = [
  "single",
  "double",
  "final",
  "repeatStart",
  "repeatEnd",
] as const;

// Articulation marks
export const ARTICULATIONS = [
  "none",
  "accent",
  "staccato",
  "marcato",
  "legato",
] as const;

// Dynamic markings
export const DYNAMICS = [
  "ppp", "pp", "p", "mp", "mf", "f", "ff", "fff",
  "sfz", "fp", "cresc", "decresc",
] as const;

// Chord roots
export const CHORD_ROOTS = [
  "C", "C#", "Db", "D", "D#", "Eb", "E", "F",
  "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B",
] as const;

// Chord quality spelling aliases (input pattern -> internal quality). Parser tries longest match first.
export const CHORD_ALIASES: Array<{ pattern: string; quality: string }> = [
  { pattern: "maj7", quality: "maj7" },
  { pattern: "major7", quality: "maj7" },
  { pattern: "ma7", quality: "maj7" },
  { pattern: "m7", quality: "min7" },
  { pattern: "min7", quality: "min7" },
  { pattern: "minor7", quality: "min7" },
  { pattern: "mi7", quality: "min7" },
  { pattern: "-7", quality: "min7" },
  { pattern: "dim7", quality: "dim7" },
  { pattern: "diminished7", quality: "dim7" },
  { pattern: "m7b5", quality: "hdim7" },
  { pattern: "ø7", quality: "hdim7" },
  { pattern: "ø", quality: "hdim7" },
  { pattern: "-7b5", quality: "hdim7" },
  { pattern: "half-dim", quality: "hdim7" },
  { pattern: "halfdim", quality: "hdim7" },
  { pattern: "minmaj7", quality: "minmaj7" },
  { pattern: "mmaj7", quality: "minmaj7" },
  { pattern: "mm7", quality: "minmaj7" },
  { pattern: "maj9", quality: "maj9" },
  { pattern: "major9", quality: "maj9" },
  { pattern: "min9", quality: "min9" },
  { pattern: "minor9", quality: "min9" },
  { pattern: "m9", quality: "min9" },
  { pattern: "min6", quality: "min6" },
  { pattern: "m6", quality: "min6" },
  { pattern: "aug7", quality: "aug7" },
  { pattern: "augmented7", quality: "aug7" },
  { pattern: "sus9", quality: "sus9" },
  { pattern: "sus4", quality: "sus4" },
  { pattern: "sus", quality: "sus4" },
  { pattern: "sus2", quality: "sus2" },
  { pattern: "6/9", quality: "69" },
  { pattern: "69", quality: "69" },
  { pattern: "add9", quality: "add9" },
  { pattern: "add2", quality: "add2" },
  { pattern: "maj", quality: "maj" },
  { pattern: "major", quality: "maj" },
  { pattern: "ma", quality: "maj" },
  { pattern: "min", quality: "min" },
  { pattern: "minor", quality: "min" },
  { pattern: "mi", quality: "min" },
  { pattern: "m", quality: "min" },
  { pattern: "-", quality: "min" },
  { pattern: "dim", quality: "dim" },
  { pattern: "diminished", quality: "dim" },
  { pattern: "°", quality: "dim" },
  { pattern: "o", quality: "dim" },
  { pattern: "aug", quality: "aug" },
  { pattern: "augmented", quality: "aug" },
  { pattern: "+", quality: "aug" },
  { pattern: "7", quality: "dom7" },
  { pattern: "dom7", quality: "dom7" },
  { pattern: "dominant7", quality: "dom7" },
  { pattern: "9", quality: "9" },
  { pattern: "11", quality: "11" },
  { pattern: "13", quality: "13" },
  { pattern: "6", quality: "6" },
  { pattern: "", quality: "maj" },
];

// Alterations/extensions that can follow a base quality (e.g. m7#5, 7b9)
export const CHORD_EXTENSIONS = [
  "#5", "b5", "#9", "b9", "#11", "b11", "#13", "b13",
] as const;

// Chord qualities
export const CHORD_QUALITIES = [
  { value: "maj", label: "Major", symbol: "" },
  { value: "min", label: "Minor", symbol: "m" },
  { value: "dim", label: "Diminished", symbol: "dim" },
  { value: "aug", label: "Augmented", symbol: "aug" },
  { value: "maj7", label: "Major 7", symbol: "maj7" },
  { value: "min7", label: "Minor 7", symbol: "m7" },
  { value: "dom7", label: "Dominant 7", symbol: "7" },
  { value: "dim7", label: "Diminished 7", symbol: "dim7" },
  { value: "hdim7", label: "Half-dim 7", symbol: "m7b5" },
  { value: "minmaj7", label: "Minor-Major 7", symbol: "mM7" },
  { value: "aug7", label: "Augmented 7", symbol: "aug7" },
  { value: "sus2", label: "Suspended 2", symbol: "sus2" },
  { value: "sus4", label: "Suspended 4", symbol: "sus4" },
  { value: "sus9", label: "Suspended 9", symbol: "sus9" },
  { value: "add2", label: "Add 2", symbol: "add2" },
  { value: "add9", label: "Add 9", symbol: "add9" },
  { value: "69", label: "6/9", symbol: "6/9" },
  { value: "6", label: "Major 6", symbol: "6" },
  { value: "min6", label: "Minor 6", symbol: "m6" },
  { value: "9", label: "Dominant 9", symbol: "9" },
  { value: "maj9", label: "Major 9", symbol: "maj9" },
  { value: "min9", label: "Minor 9", symbol: "m9" },
  { value: "11", label: "Dominant 11", symbol: "11" },
  { value: "13", label: "Dominant 13", symbol: "13" },
] as const;

// Nashville numbers
export const NASHVILLE_NUMBERS = [
  "1", "2", "3", "4", "5", "6", "7",
  "b2", "b3", "b5", "b6", "b7",
  "#1", "#2", "#4", "#5", "#6",
] as const;

// Navigation marker types
export const NAVIGATION_TYPES = [
  "segno",
  "coda",
  "dsCoda",
  "dsSegno",
  "dcCoda",
  "dcFine",
  "fine",
  "toCoda",
] as const;

// Section name presets
export const SECTION_PRESETS = [
  "Intro", "Verse", "Pre-Chorus", "Chorus", "Bridge",
  "Interlude", "Solo", "Outro", "Tag", "Vamp", "Coda",
] as const;
