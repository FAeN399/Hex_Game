**HexCard Forge — Unified Application Specification**
*Version 0.9 • May 28 2025*

---

## 1 | Project Vision

Create a **single hybrid app** (desktop & web) that lets players:

1. **Forge Characters** by fusing six hex-cards.
2. **Play** a turn-based strategy game with those characters on a hex map.
3. **Author or Random-Generate Maps** with a full-featured editor.

All three workflows share one data model, one UI theme, and the same code-base.

---

## 2 | Key Requirements

| ID  | Requirement                                                                                             | Priority |
| --- | ------------------------------------------------------------------------------------------------------- | -------- |
| R-1 | Players can switch between **Map**, **Forge**, and **Play** screens without reloading.                  | P0       |
| R-2 | Every hex-card is usable **anywhere** (on the board *or* inside the Forge). No category-specific locks. | P0       |
| R-3 | Map Editor supports manual drawing **and** one-click procedural generation with adjustable seeds.       | P0       |
| R-4 | Save/Load entire project (maps, decks, forged characters, game state) to disk or browser storage.       | P0       |
| R-5 | AI Assistants can propose card combos or auto-build maps on demand.                                     | P1       |
| R-6 | Runs offline as a tiny Tauri desktop app **and** online in any evergreen browser.                       | P0       |
| R-7 | Must be keyboard-navigable & WCAG 2.2 AA accessible (color-blind safe palette).                         | P1       |

---

## 3 | Architecture

### 3.1 Technology Stack

| Layer         | Choice                                                               | Rationale                                  |
| ------------- | -------------------------------------------------------------------- | ------------------------------------------ |
| Front-end     | **React 18 + TypeScript + Vite**                                     | Familiar, fast HMR, huge ecosystem         |
| Rendering     | **Three.js** (board & forge 3-D) + **Pixi.js** (HUD & icons)         | Hardware-accelerated, flexible             |
| Desktop shell | **Tauri 2**                                                          | 65 MB mem, Rust back-end for FS access     |
| State         | **Zustand**                                                          | Simple, testable, avoids Redux boilerplate |
| Validation    | **Zod**                                                              | Shared schema & runtime guards             |
| Styling       | **Tailwind CSS** + CSS Modules                                       | Design tokens, dark/arcane theme           |
| Testing       | Vitest (unit) • Playwright (E2E) • React Testing Library (component) | Cohesive tool-chain                        |
| CI            | GitHub Actions (build-matrix: web, win, mac, linux)                  | Auto-releases & checks                     |

### 3.2 Folder Layout (Monorepo / pnpm)

```
apps/
  web/             # Browser build
  desktop/         # Tauri shell (imports web dist)
packages/
  ui/              # Re-usable React components
  engine/          # Game rules, forge logic
  schema/          # Zod definitions
  utils/
```

---

## 4 | Shared Data Model (schema/)

<details><summary>Zod definitions (v1)</summary>

```ts
import { z } from "zod";

/* Hex-Card */
export const EdgeIcon = z.enum([
  "attack","defense","element","resource","skill","link"
]);
export const HexCard = z.object({
  id:    z.string().uuid(),
  name:  z.string(),
  type:  z.enum(["unit","hero","spell","structure","relic"]),
  edges: z.tuple([EdgeIcon,EdgeIcon,EdgeIcon,EdgeIcon,EdgeIcon,EdgeIcon]),
  tags:  z.string().array().default([]),
  cost:  z.number().int().nonnegative().optional(),
  text:  z.string().optional()
});

/* Forged Character */
export const Character = z.object({
  id:        z.string().uuid(),
  name:      z.string(),
  cardIds:   z.string().uuid().array().length(6),
  stats:     z.record(z.string(), z.number()),
  abilities: z.string().array()
});

/* Map */
export const Terrain = z.enum([
  "plains","forest","mountain","water","desert","swamp","city"
]);
export const MapTile = z.object({
  q: z.number().int(),
  r: z.number().int(),
  terrain: Terrain,
  occupantId: z.string().uuid().optional()
});

/* Save-Game Root */
export const SaveGame = z.object({
  version: z.literal(1),
  map:     MapTile.array(),
  deck:    HexCard.array(),
  forged:  Character.array(),
  turn:    z.number().int(),
  phase:   z.enum(["upkeep","hero","action","combat","cleanup"])
});
```

</details>

---

## 5 | Module Design

### 5.1 Navigation

* **Persistent left sidebar** with icons for **Forge**, **Map**, **Play**.
* Content area swaps via React Router.
* Hotkeys: `⌘/Ctrl 1-3`.

### 5.2 Forge

* 3-D crucible table.
* Drag six cards onto **hexagonal sockets arranged around a central circle**
  → live preview stats.
* Click *Forge* → character created & pushed into `forged[]`.
* AI Suggest button: calls local rule-of-thumb generator.

### 5.3 Map Editor

* Toolbar: brush, fill, elevation, prop bucket.
* Layers: terrain, props, spawn points.
* Procedural tab: input seed, sliders (size, water %, mountain ruggedness).
* Export `.hexmap` (subset of SaveGame) or commit directly to `map` in store.

### 5.4 Card Game

* Board rendered with Three.js axial hex grid.
* Zustand middleware logs every action for undo / replay.
* Turn logic lives in `engine/` and is pure (unit-testable).

### 5.5 Data Flow

```
 forge  →  zustand store  →  play
 map    ↗               ↘  save/load (.json)
```

All mutations validated by Zod; invalid payloads blocked & toasts displayed.

---

## 6 | Error Handling

| Layer              | Strategy                                                                     |
| ------------------ | ---------------------------------------------------------------------------- |
| Front-end          | React Error Boundaries per route; toast notifications for recoverable issues |
| IPC (Tauri)        | Rust side returns `Result<T,AppError>`; mapped to typed errors               |
| Save/Load          | Zod parse on import; if fail → prompt user & keep backup copy                |
| Network (AI hints) | Timeouts 5 s; fallback to local heuristic generator                          |

---

## 7 | Testing Plan

| Level         | Tool                           | Coverage Targets                                              |
| ------------- | ------------------------------ | ------------------------------------------------------------- |
| Unit          | **Vitest**                     | engine rules, forge math, reducers ≥ 90 %                     |
| Component     | React Testing Library          | UI props / state wiring, edge cases                           |
| Integration   | **Playwright**                 | End-to-end flows: create map → forge hero → start match       |
| Accessibility | `@axe-core/playwright`         | All major screens pass WCAG 2.2 AA                            |
| Performance   | Lighthouse (web) & Tauri bench | Time-to-interactive ≤ 2 s; memory < 120 MB desktop            |
| Regression    | GitHub Actions matrix          | Builds & tests on ubuntu-latest, windows-latest, macos-latest |

---

## 8 | Developer On-Boarding

```bash
pnpm i            # install everything
pnpm dev:web      # hot-reload browser build
pnpm dev:desktop  # tauri dev
pnpm test         # run Vitest suite
pnpm e2e          # Playwright headless
```

* **Env vars**: none required offline; AI hints use optional `OPENAI_API_KEY`.
* **Pre-commit**: eslint + prettier + type-check.

---

## 9 | Roadmap (MVP → v1)

| Sprint      | Goal                                                   |
| ----------- | ------------------------------------------------------ |
| S-1 (2 wks) | Boot monorepo, Zod schema, Zustand store, bare sidebar |
| S-2         | Forge UI + drag-drop + character output                |
| S-3         | Map Editor terrain brush + save/load                   |
| S-4         | Core game loop (board render, turn phases)             |
| S-5         | Procedural map gen + AI forge suggestions              |
| S-6         | Desktop build, accessibility polish, CI pipeline       |

---

## 10 | Open Questions

1. Final iconography for the six edge types.
2. Balance formula for stats derived from 6-card fusion.
3. AI hint scope (local ML vs. cloud call).

Resolve these before Sprint 2.

---

### Ready to Code

This document provides the **requirements, architecture, data model, error strategy, and testing plan** necessary for a dev team to start implementation immediately. Let me know when you’d like deeper dives into any subsystem (e.g., procedural map algorithms or combat resolution math).
