# CLAUDE.md

## Project Overview

Chord Charts is an interactive chord chart editor built with **Astro 5**, **React 18**, and **Tailwind CSS 3**. It lets users create, edit, and manage chord charts with sections, measures, beat divisions, slash notation, dynamics, lyrics, and navigation markers. Charts can be imported/exported as JSON or Markdown.

## Quick Reference

```bash
pnpm install          # Install dependencies
pnpm dev              # Dev server at http://localhost:4321
pnpm build            # Production build (output in dist/)
pnpm preview          # Preview production build
```

**Package manager:** pnpm (with workspace support via `pnpm-workspace.yaml`)
**Node requirement:** 18+
**No test framework, linter, or CI/CD is configured.**

## Architecture

Single-page application — Astro renders one page (`src/pages/index.astro`) which mounts the React `ChordChartEditor` component with `client:load`.

### Directory Structure

```
src/
├── pages/index.astro              # Entry point, mounts ChordChartEditor
├── layouts/Layout.astro           # HTML shell with meta tags and skip link
├── components/
│   ├── chord-chart/               # Core editor components (13 TSX files)
│   │   ├── ChordChartEditor.tsx   # Top-level orchestrator, keyboard shortcuts
│   │   ├── Toolbar.tsx            # File ops, theme, metadata editing
│   │   ├── ChartCanvas.tsx        # Scrollable chart rendering area
│   │   ├── PropertiesPanel.tsx    # Right sidebar for editing selection
│   │   ├── SectionHeader.tsx      # Section title, drag reorder, time sig
│   │   ├── MeasureComponent.tsx   # Single measure with beats and barlines
│   │   ├── BeatComponent.tsx      # Beat with division-based slots
│   │   ├── ChordInput.tsx         # Chord picker with autocomplete
│   │   ├── ChordSymbol.tsx        # Formatted chord text rendering
│   │   ├── SlashNotation.tsx      # Rhythmic slash with articulations
│   │   ├── BeamedSlashGroup.tsx   # Beamed slash notation (largest component)
│   │   ├── Barline.tsx            # Barline visual rendering
│   │   ├── NavigationMarkers.tsx  # Segno, coda, D.S., D.C., endings
│   │   └── index.ts              # Barrel export
│   └── ui/                        # shadcn/ui primitives (Radix-based)
│       ├── button.tsx, input.tsx, label.tsx, select.tsx
│       ├── dropdown-menu.tsx, popover.tsx, command.tsx
│       ├── tabs.tsx, tooltip.tsx, scroll-area.tsx, separator.tsx
├── lib/
│   ├── schema.ts                  # Zod schemas + derived TypeScript types
│   ├── store.ts                   # Zustand store (state, actions, undo/redo)
│   ├── chordParser.ts             # Parse chord strings (Am7, F#maj7, 4m7)
│   ├── constants.ts               # Time signatures, divisions, chord data
│   ├── io.ts                      # JSON and Markdown import/export
│   ├── useKeyboardNavigation.ts   # Arrow key navigation hook
│   └── utils.ts                   # Factory functions, deepClone, cn()
└── styles/
    ├── globals.css                # Tailwind directives + theme CSS variables
    └── chord-chart.css            # Music font, theme definitions, a11y styles
```

### Data Flow

1. **Schema** (`schema.ts`) — Zod schemas define the data model: `ChordChart > Section > Measure > Beat > BeatSlot`. Types are inferred with `z.infer<>`.
2. **Store** (`store.ts`) — Single Zustand store holds chart data, UI state (selection, zoom, theme, toggles), and a 50-entry undo/redo history. Uses `subscribeWithSelector` middleware.
3. **Components** — React components read from and dispatch actions to the store. The hierarchy mirrors the data model: `ChordChartEditor > ChartCanvas > SectionHeader + MeasureComponent > BeatComponent > ChordInput/SlashNotation`.
4. **Serialization** (`io.ts`) — Charts serialize to/from JSON (validated by Zod) and Markdown.

### Key Architectural Decisions

- **Zustand** over React Context for state — lightweight, middleware support, subscriptions.
- **Zod** for runtime validation — schemas serve as both validation and documentation of the data model.
- **shadcn/ui** component pattern — UI primitives are copied into `src/components/ui/` (not imported from a package), wrapping Radix UI. Configured via `components.json`.
- **Immutable state updates** — Store actions use spread operators and `deepClone()` for history snapshots.
- **CSS custom properties** for theming — Light, dark, and high-contrast themes defined as CSS variable sets in `chord-chart.css`. Switched by setting `data-theme` on `<html>`.
- **Petaluma music font** — Loaded via CDN from `chord-chart.css` for professional notation rendering.
- **`@` path alias** — Configured in both `astro.config.mjs` (Vite) and `tsconfig.json` to map `@/*` to `src/*`.

## Code Conventions

### TypeScript

- Strict mode via Astro's strict tsconfig preset.
- Types are derived from Zod schemas using `z.infer<>` — avoid duplicating type definitions.
- Use `interface` for component props and store state shapes; Zod-inferred types for data models.
- Imports use the `@/` alias (e.g., `import { useChartStore } from "@/lib/store"`).

### React Components

- Function components with named exports (not default exports).
- Props defined as inline `interface` above the component.
- Hooks: `useChartStore` for store access, `useKeyboardNavigation` for keyboard handling.
- Tailwind classes applied directly via `className`, composed with `cn()` from `@/lib/utils`.

### Styling

- Tailwind utility classes for layout and spacing.
- CSS variables (`--background`, `--foreground`, `--primary`, etc.) for theme colors — defined in `globals.css`, extended in `tailwind.config.mjs`.
- Component variants use `class-variance-authority` (cva) in shadcn/ui components.
- Class merging via `tailwind-merge` through the `cn()` helper.

### State Management

- All chart mutations go through Zustand store actions in `store.ts`.
- Every mutation calls `saveHistory()` to enable undo/redo.
- UI state (selection, zoom, theme, visibility toggles) is separate from chart data within the store.
- IDs are generated with `nanoid` via factory functions in `utils.ts`.

### File Organization

- Business logic lives in `src/lib/` — keep components thin.
- New UI primitives go in `src/components/ui/` following shadcn/ui patterns.
- Editor-specific components go in `src/components/chord-chart/`.
- Barrel exports via `index.ts` in `chord-chart/`.

## Common Tasks

### Adding a new chord chart component

1. Create `src/components/chord-chart/MyComponent.tsx` with a named export.
2. Add any needed store actions to `store.ts` (with `saveHistory()` calls).
3. Export from `src/components/chord-chart/index.ts`.
4. If the component needs new data fields, update the Zod schema in `schema.ts` — types will auto-derive.

### Adding a new shadcn/ui component

Use the shadcn CLI: `pnpm dlx shadcn@latest add <component-name>`. This places the component in `src/components/ui/` per the `components.json` configuration.

### Modifying the data model

1. Update the relevant Zod schema in `schema.ts`.
2. Types update automatically via `z.infer<>`.
3. Update factory functions in `utils.ts` if new defaults are needed.
4. Update `io.ts` if the change affects JSON/Markdown serialization.
5. Update store actions in `store.ts` as needed.

### Theming

Theme CSS variables are in `src/styles/globals.css` (light/dark base) and `src/styles/chord-chart.css` (light/dark/high-contrast for chart-specific colors). Add new theme tokens as CSS custom properties and extend `tailwind.config.mjs` to expose them.

## Configuration Files

| File | Purpose |
|---|---|
| `astro.config.mjs` | Astro framework config: React + Tailwind integrations, `@` path alias |
| `tsconfig.json` | Extends Astro strict preset, `@/*` path mapping |
| `tailwind.config.mjs` | Dark mode via class strategy, shadcn design tokens, animations plugin |
| `components.json` | shadcn/ui CLI config (style, aliases, CSS variables) |
| `pnpm-workspace.yaml` | pnpm workspace config |
| `package.json` | Scripts: `dev`, `build`, `preview`, `start` |
