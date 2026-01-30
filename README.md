# Chord Charts

An interactive chord chart editor built with Astro, React, and Tailwind. Create and edit chord charts with sections, measures, beat divisions, slash notation, and lyrics. Charts can be stored as JSON or Markdown.

## Features

- **Sections & measures** — Add sections (Intro, Verse, Chorus, etc.), set time signatures (4/4, 3/4, 6/8, etc.), and add or remove measures.
- **Chord entry** — Type chords directly (e.g. `Am7`, `F#maj7`, `Bb`) or use the picker. Supports standard chord symbols and Nashville numbers. Flexible spelling (e.g. `min`, `-`, `Δ` for major 7).
- **Beat divisions** — Quarter (1), eighth (2), eighth triplet (3), sixteenth (4), sixteenth triplet (5). Use number keys **1–5** when a beat is selected to change division/slash count.
- **Slash notation** — Rhythmic slashes with optional articulations (accent, staccato, marcato).
- **Barlines** — Single, double, final, repeat start/end.
- **Navigation** — Rehearsal marks, segno, coda, D.S., D.C., endings.
- **Dynamics & lyrics** — Per-beat dynamics and lyrics below the chart.
- **Drag to reorder** — Use the grip handle before a section title to reorder sections.
- **Import/export** — JSON and Markdown with a human-readable structure.
- **Undo/redo** — Full history with Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z.
- **Themes** — Light, dark, and high-contrast.
- **Accessibility** — Keyboard navigation (arrows, Enter, Escape), ARIA labels, skip link, theme support.

## Tech Stack

- [Astro](https://astro.build) 5.x
- [React](https://react.dev) 18
- [Tailwind CSS](https://tailwindcss.com) 4
- [Zustand](https://zustand-demo.pmnd.rs/) — state and undo/redo
- [Zod](https://zod.dev) — schema and validation
- [Radix UI](https://www.radix-ui.com) / shadcn-style components

## Getting Started

**Prerequisites:** Node 18+, pnpm (or npm).

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

Open [http://localhost:4321](http://localhost:4321).

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Project Structure

```
src/
├── components/
│   ├── chord-chart/     # Editor: ChordChartEditor, ChartCanvas, Toolbar,
│   │                    # PropertiesPanel, MeasureComponent, BeatComponent,
│   │                    # ChordInput, SectionHeader, etc.
│   └── ui/              # shadcn-style primitives (Button, Input, Select, …)
├── lib/
│   ├── schema.ts        # Zod schemas and types for chart data
│   ├── store.ts         # Zustand store and actions
│   ├── chordParser.ts   # Parse typed chord strings (Am7, 4m7, …)
│   ├── constants.ts     # Time signatures, divisions, chord roots/qualities
│   ├── io.ts            # JSON/Markdown import and export
│   ├── useKeyboardNavigation.ts
│   └── utils.ts
├── pages/
│   └── index.astro      # Single page that mounts ChordChartEditor
├── layouts/
│   └── Layout.astro
└── styles/
    ├── globals.css      # Tailwind and theme variables
    └── chord-chart.css  # Editor and accessibility styles
```

## Using the Editor in Another Astro Project

1. Copy `src/components/chord-chart/`, `src/components/ui/`, `src/lib/`, and the relevant styles.
2. Ensure Astro has the React integration and Tailwind (or your CSS setup) matches.
3. Use the editor on any page:

```astro
---
import { ChordChartEditor } from "@/components/chord-chart";
import "@/styles/globals.css";
import "@/styles/chord-chart.css";
---

<main class="h-screen">
  <ChordChartEditor client:load />
</main>
```

Optional: pass `initialChart` (JSON string) to load a chart on mount.

## Data Format

Charts are validated with Zod and have a structure like:

- **Metadata:** title, composer, key, tempo, notation type (standard / Nashville), measures per line.
- **Sections:** name, time signature, rehearsal mark, navigation (segno, coda, etc.), measures.
- **Measures:** instruction text, barlines, ending (1st/2nd/3rd), beats.
- **Beats:** division (quarter, eighth, eighth triplet, sixteenth, sixteenth triplet), slots (chord/Nashville + slash/articulation), dynamics, lyrics.

Export to **JSON** (full structure) or **Markdown** (readable summary). Use the Toolbar to download or upload files.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **1–5** | Set beat division (quarter → sixteenth triplet) when a beat/slot is selected |
| **↑ / ↓** | Move selection to previous/next section |
| **← / →** | Move selection within measure/beat/slots |
| **Enter / Space** | Activate selected slot (e.g. open chord input) |
| **Escape** | Clear selection |
| **Ctrl/Cmd+Z** | Undo |
| **Ctrl/Cmd+Shift+Z** or **Ctrl/Cmd+Y** | Redo |

## License

MIT
