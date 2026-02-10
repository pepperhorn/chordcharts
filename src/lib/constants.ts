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
  dottedQuarter: { slots: 1, label: "Dotted Quarter" },
  dottedEighth: { slots: 2, label: "Dotted Eighth" },
} as const;

// Barline types
export const BARLINE_TYPES = [
  "single",
  "double",
  "final",
  "repeatStart",
  "repeatEnd",
  "repeatBoth",
] as const;

// Articulation marks
export const ARTICULATIONS = [
  "none",
  "accent",
  "staccato",
  "marcato",
  "tenuto",
  "fermata",
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
  // Minor-major extended (must come before shorter patterns)
  { pattern: "minmaj9", quality: "minmaj9" },
  { pattern: "mmaj9", quality: "minmaj9" },
  { pattern: "mM9", quality: "minmaj9" },
  { pattern: "m(maj9)", quality: "minmaj9" },
  { pattern: "minmaj7", quality: "minmaj7" },
  { pattern: "mmaj7", quality: "minmaj7" },
  { pattern: "mM7", quality: "minmaj7" },
  { pattern: "m(maj7)", quality: "minmaj7" },
  { pattern: "mm7", quality: "minmaj7" },
  // Major extended
  { pattern: "maj13", quality: "maj13" },
  { pattern: "major13", quality: "maj13" },
  { pattern: "ma13", quality: "maj13" },
  { pattern: "maj11", quality: "maj11" },
  { pattern: "major11", quality: "maj11" },
  { pattern: "ma11", quality: "maj11" },
  { pattern: "maj9", quality: "maj9" },
  { pattern: "major9", quality: "maj9" },
  { pattern: "ma9", quality: "maj9" },
  { pattern: "maj7", quality: "maj7" },
  { pattern: "major7", quality: "maj7" },
  { pattern: "ma7", quality: "maj7" },
  // Minor extended
  { pattern: "min13", quality: "min13" },
  { pattern: "minor13", quality: "min13" },
  { pattern: "m13", quality: "min13" },
  { pattern: "-13", quality: "min13" },
  { pattern: "min11", quality: "min11" },
  { pattern: "minor11", quality: "min11" },
  { pattern: "m11", quality: "min11" },
  { pattern: "-11", quality: "min11" },
  { pattern: "min9", quality: "min9" },
  { pattern: "minor9", quality: "min9" },
  { pattern: "m9", quality: "min9" },
  { pattern: "-9", quality: "min9" },
  { pattern: "min7", quality: "min7" },
  { pattern: "minor7", quality: "min7" },
  { pattern: "mi7", quality: "min7" },
  { pattern: "m7", quality: "min7" },
  { pattern: "-7", quality: "min7" },
  // Minor 6/9
  { pattern: "min6/9", quality: "min69" },
  { pattern: "m6/9", quality: "min69" },
  { pattern: "m69", quality: "min69" },
  { pattern: "-6/9", quality: "min69" },
  // Minor add9
  { pattern: "minadd9", quality: "minadd9" },
  { pattern: "m(add9)", quality: "minadd9" },
  { pattern: "madd9", quality: "minadd9" },
  { pattern: "-add9", quality: "minadd9" },
  // Minor augmented
  { pattern: "minaug", quality: "minaug" },
  { pattern: "m+", quality: "minaug" },
  { pattern: "m#5", quality: "minaug" },
  // Diminished
  { pattern: "dim7", quality: "dim7" },
  { pattern: "diminished7", quality: "dim7" },
  { pattern: "°7", quality: "dim7" },
  { pattern: "o7", quality: "dim7" },
  // Half-diminished
  { pattern: "m7b5", quality: "hdim7" },
  { pattern: "min7b5", quality: "hdim7" },
  { pattern: "ø7", quality: "hdim7" },
  { pattern: "ø", quality: "hdim7" },
  { pattern: "-7b5", quality: "hdim7" },
  { pattern: "half-dim", quality: "hdim7" },
  { pattern: "halfdim", quality: "hdim7" },
  // Augmented 7
  { pattern: "aug7", quality: "aug7" },
  { pattern: "augmented7", quality: "aug7" },
  { pattern: "+7", quality: "aug7" },
  { pattern: "7#5", quality: "aug7" },
  // Suspended dominants (must come before simple sus)
  { pattern: "13sus4", quality: "13sus4" },
  { pattern: "13sus", quality: "13sus4" },
  { pattern: "9sus4", quality: "9sus4" },
  { pattern: "9sus", quality: "9sus4" },
  { pattern: "7sus4", quality: "7sus4" },
  { pattern: "7sus", quality: "7sus4" },
  // Simple suspended
  { pattern: "sus9", quality: "sus9" },
  { pattern: "sus4", quality: "sus4" },
  { pattern: "sus2", quality: "sus2" },
  { pattern: "sus", quality: "sus4" },
  // 6/9 chords
  { pattern: "6/9", quality: "69" },
  { pattern: "69", quality: "69" },
  // Add chords
  { pattern: "add9", quality: "add9" },
  { pattern: "(add9)", quality: "add9" },
  { pattern: "add2", quality: "add2" },
  { pattern: "(add2)", quality: "add2" },
  { pattern: "add4", quality: "add4" },
  { pattern: "(add4)", quality: "add4" },
  { pattern: "add11", quality: "add11" },
  { pattern: "(add11)", quality: "add11" },
  // Altered dominant
  { pattern: "7alt", quality: "alt" },
  { pattern: "alt", quality: "alt" },
  // Power chord
  { pattern: "5", quality: "5" },
  { pattern: "(omit3)", quality: "5" },
  { pattern: "omit3", quality: "5" },
  { pattern: "(no3)", quality: "5" },
  { pattern: "no3", quality: "5" },
  // Major variants
  { pattern: "maj", quality: "maj" },
  { pattern: "major", quality: "maj" },
  { pattern: "ma", quality: "maj" },
  // Minor variants
  { pattern: "min", quality: "min" },
  { pattern: "minor", quality: "min" },
  { pattern: "mi", quality: "min" },
  { pattern: "m", quality: "min" },
  { pattern: "-", quality: "min" },
  // Diminished
  { pattern: "dim", quality: "dim" },
  { pattern: "diminished", quality: "dim" },
  { pattern: "°", quality: "dim" },
  { pattern: "o", quality: "dim" },
  // Augmented
  { pattern: "aug", quality: "aug" },
  { pattern: "augmented", quality: "aug" },
  { pattern: "+", quality: "aug" },
  // Dominant family
  { pattern: "13", quality: "13" },
  { pattern: "11", quality: "11" },
  { pattern: "9", quality: "9" },
  { pattern: "dom7", quality: "dom7" },
  { pattern: "dominant7", quality: "dom7" },
  { pattern: "7", quality: "dom7" },
  // 6th chords
  { pattern: "min6", quality: "min6" },
  { pattern: "m6", quality: "min6" },
  { pattern: "-6", quality: "min6" },
  { pattern: "6", quality: "6" },
  // Default (empty = major)
  { pattern: "", quality: "maj" },
];

// Alterations/extensions that can follow a base quality (e.g. m7#5, 7b9)
export const CHORD_EXTENSIONS = [
  // Fifths
  "#5", "b5",
  // Ninths
  "#9", "b9",
  // Elevenths
  "#11", "b11", "add11",
  // Thirteenths
  "#13", "b13",
  // Omissions
  "omit3", "no3", "omit5", "no5",
  // Additions
  "add4",
  // Altered shorthand (when used as extension)
  "alt",
] as const;

// Chord qualities
export const CHORD_QUALITIES = [
  // Basic triads
  { value: "maj", label: "Major", symbol: "" },
  { value: "min", label: "Minor", symbol: "m" },
  { value: "dim", label: "Diminished", symbol: "°" },
  { value: "aug", label: "Augmented", symbol: "+" },
  { value: "5", label: "Power", symbol: "5" },
  // Suspended
  { value: "sus2", label: "Suspended 2", symbol: "sus2" },
  { value: "sus4", label: "Suspended 4", symbol: "sus4" },
  { value: "sus9", label: "Suspended 9", symbol: "sus9" },
  // Add chords
  { value: "add2", label: "Add 2", symbol: "add2" },
  { value: "add4", label: "Add 4", symbol: "add4" },
  { value: "add9", label: "Add 9", symbol: "add9" },
  { value: "add11", label: "Add 11", symbol: "add11" },
  // 6th chords
  { value: "6", label: "Major 6", symbol: "6" },
  { value: "min6", label: "Minor 6", symbol: "m6" },
  { value: "69", label: "6/9", symbol: "6/9" },
  { value: "min69", label: "Minor 6/9", symbol: "m6/9" },
  // 7th chords
  { value: "maj7", label: "Major 7", symbol: "maj7" },
  { value: "min7", label: "Minor 7", symbol: "m7" },
  { value: "dom7", label: "Dominant 7", symbol: "7" },
  { value: "dim7", label: "Diminished 7", symbol: "°7" },
  { value: "hdim7", label: "Half-dim 7", symbol: "ø7" },
  { value: "minmaj7", label: "Minor-Major 7", symbol: "m(maj7)" },
  { value: "aug7", label: "Augmented 7", symbol: "+7" },
  { value: "minaug", label: "Minor Augmented", symbol: "m(#5)" },
  // Suspended dominants
  { value: "7sus4", label: "7 sus4", symbol: "7sus4" },
  { value: "9sus4", label: "9 sus4", symbol: "9sus4" },
  { value: "13sus4", label: "13 sus4", symbol: "13sus4" },
  // 9th chords
  { value: "maj9", label: "Major 9", symbol: "maj9" },
  { value: "min9", label: "Minor 9", symbol: "m9" },
  { value: "minadd9", label: "Minor add9", symbol: "m(add9)" },
  { value: "9", label: "Dominant 9", symbol: "9" },
  { value: "minmaj9", label: "Minor-Major 9", symbol: "m(maj9)" },
  // 11th chords
  { value: "maj11", label: "Major 11", symbol: "maj11" },
  { value: "min11", label: "Minor 11", symbol: "m11" },
  { value: "11", label: "Dominant 11", symbol: "11" },
  // 13th chords
  { value: "maj13", label: "Major 13", symbol: "maj13" },
  { value: "min13", label: "Minor 13", symbol: "m13" },
  { value: "13", label: "Dominant 13", symbol: "13" },
  // Altered
  { value: "alt", label: "Altered", symbol: "alt" },
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
  "dsAlFine",
] as const;

// Section name presets
export const SECTION_PRESETS = [
  "Intro", "Verse", "Pre-Chorus", "Chorus", "Bridge",
  "Interlude", "Solo", "Outro", "Tag", "Vamp", "Coda",
] as const;
