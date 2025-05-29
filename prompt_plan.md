# 🛠️ Test-Driven Implementation Plan

*For the HexCard Forge unified application*

---

## A. High-Level Milestones

| M#      | Milestone                         | Goal                                                                |
| ------- | --------------------------------- | ------------------------------------------------------------------- |
| **M-0** | **Project Skeleton & CI**         | Monorepo, pnpm, ESLint/Prettier, Vitest, Playwright, GitHub Actions |
| **M-1** | **Shared Schema & Store**         | Zod models, Zustand state, type-safe persistence layer              |
| **M-2** | **Forge MVP**                     | Drag-and-drop 6 cards ➜ character JSON; unit tests for fusion math  |
| **M-3** | **Map Editor MVP**                | Hex grid painter, tile selection, JSON export/import                |
| **M-4** | **Card Game Loop MVP**            | Render board, turn phases, attack/defense resolver                  |
| **M-5** | **Cross-Module Integration**      | Sidebar navigation, live data wiring, undo stack                    |
| **M-6** | **Procedural Map & AI Hints**     | Seeded generator + simple card-suggestion engine                    |
| **M-7** | **Desktop Build & Accessibility** | Tauri packaging, WCAG color audit, key-bindings                     |
| **M-8** | **Polish & Balance Pass**         | Stats tuning, animation polish, release candidate                   |

---

## B. Iterative Breakdown (2 passes)

### Pass 1 – Split Each Milestone into Implementable Chunks

| Milestone | Chunk IDs & Descriptions                                                                                                                                                                                  |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M-0       | **C0-1** Init monorepo & workspace<br>**C0-2** Add lint/format hooks<br>**C0-3** Configure Vitest & sample test<br>**C0-4** Set up Playwright E2E scaffold<br>**C0-5** GitHub Actions matrix build        |
| M-1       | **C1-1** Implement Zod `schema/` & unit tests<br>**C1-2** Wire Zustand store with persist middleware<br>**C1-3** Add save/load helper & failing tests<br>**C1-4** Green-light save/load tests             |
| M-2       | **C2-1** Forge UI skeleton (React + Three.js stage)<br>**C2-2** Card drag-drop component with tests<br>**C2-3** Fusion algorithm (pure fn + tests)<br>**C2-4** Integrate algorithm into UI; snapshot test |
| M-3       | **C3-1** Hex grid renderer component<br>**C3-2** Terrain brush tool + unit tests on reducer<br>**C3-3** File export/import service + tests                                                                |
| M-4       | **C4-1** Turn state machine (pure)<br>**C4-2** Edge combat resolver + tests<br>**C4-3** Board view & interaction wiring<br>**C4-4** E2E: minimal match passes                                             |
| M-5       | **C5-1** Sidebar navigation (React Router)<br>**C5-2** Undo/redo middleware + tests<br>**C5-3** Cross-module state sync E2E                                                                               |
| M-6       | **C6-1** Procedural map generator fn + unit tests<br>**C6-2** AI forge suggestion fn + unit tests<br>**C6-3** UI controls for both features                                                               |
| M-7       | **C7-1** Tauri scaffold & IPC bridge tests<br>**C7-2** Desktop save dialog integration<br>**C7-3** axe-core accessibility audit CI step                                                                   |
| M-8       | **C8-1** Balance script & snapshot tests<br>**C8-2** Particle/FX polish pass<br>**C8-3** Release build script & checksum                                                                                  |

### Pass 2 – Right-Size Each Chunk into Test/Code Pairs

*(example for two chunks; follow the same pattern for all)*

| Chunk               | TDD Steps                                                                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **C1-1** `schema/`  | **T1** Write failing unit test asserting `HexCard.parse(badCard)` throws.<br>**T2** Implement Zod model.<br>**T3** Add happy-path test loading fixture JSON. |
| **C2-3** Fusion alg | **T1** Test: given 6 cards → stats sum matches spec.<br>**T2** Implement pure `fuseCards()`.<br>**T3** Property-based test (fast-check) for edge collisions. |

Repeat until every chunk is covered by ≤ 3 red-green-refactor cycles.

---

## C. Code-Generation LLM Prompt Series

> **How to use:**
> Feed Prompt #1 to the coding LLM, run resulting tests; proceed to Prompt #2 only when green.
> Each prompt is self-contained and references prior artifacts by file path.

---

### Prompt #1 — **C0-1** Monorepo Setup (COMPLETED)

```prompt
You are an expert TypeScript dev.

**Goal**: create the initial pnpm monorepo with `apps/desktop-studio`, `apps/web-client`, and `packages/schema`.

**Tasks**
1. `pnpm init` with workspace settings.
2. Add `apps/web-client` (React+Vite) skeleton with hello world test.
3. Commit baseline `.gitignore`, `README.md`.

**TDD**
- Create `apps/web-client/src/App.test.tsx` expecting `<h1>Hello Forge</h1>`.
- Make it pass with minimal React component.

Return a patch diff covering all files.
```

### Prompt #2 — **C0-2** Lint & Format Hooks (COMPLETED)

```prompt
Extend the monorepo.

**Tasks**
1. Add ESLint + Prettier configs.
2. Configure `lint-staged` + `husky pre-commit`.
```

### Prompt #3 — **C0-3** Configure Vitest & Sample Tests (COMPLETED)

```prompt
Add testing infrastructure to the monorepo.

**Tasks**
1. Set up Vitest for unit and component testing.
2. Create sample tests for core components.
3. Configure test coverage reporting.

**TDD**
- Create a test utility for rendering components.
- Write a test for a simple UI component.
- Ensure tests pass with `pnpm test`.
```

### Prompt #4 — **C1-1** Implement Schema Package

```prompt
You are an expert TypeScript dev working on a hex-card game.

**Goal**: Implement the core data models using Zod for validation.

**Tasks**
1. Create `packages/schema/src/models` with the following schemas:
   - `HexCard.ts` - Define a hex card with 6 edges, type, name, and stats
   - `Character.ts` - A character forged from 6 cards
   - `MapTile.ts` - A hexagonal map tile with terrain type
   - `SaveGame.ts` - Top-level structure with game state

2. Add JSON fixtures in `packages/schema/test/fixtures`.

**TDD**
- Write tests in `packages/schema/test` that validate:
  - `HexCard.parse(badCard)` throws with invalid data
  - Valid fixtures parse without errors
  - Exported type definitions match expected structure

Return a patch diff covering all new and modified files.
```

**TDD**
- Add a deliberately mis-formatted file in `apps/web/src/bad.ts`.
- Add a unit test ensuring `pnpm run lint` exits 0 after auto-fix.

Deliver updated configs and test.
```

### Prompt #3 — **C1-1** Zod Schema & Tests

```prompt
Create `packages/schema/src/index.ts` defining Zod models per spec v0.9.

**TDD**
1. Fixture `tests/__fixtures__/validCard.json` should parse without error.
2. Fixture `tests/__fixtures__/invalidCard.json` (missing id) must throw.

Add Vitest tests, ensure green.
```

### Prompt #4 — **C1-2** Zustand Store w/ Persist

```prompt
Implement global store.

**Tasks**
1. `packages/engine/src/store.ts` exporting `useForgeStore`.
2. Persist to localStorage in web; mocked in tests.

**TDD**
- Test: after calling `addCard(card)`, store selector returns card.
- Test: persistence layer serializes to JSON string.

Provide updated code + tests.
```

### Prompt #5 — **C1-3** Native Save/Load Service

```prompt
# Context
- Backend uses Tauri commands located under `src-tauri/src`.
- Front-end communicates via `@tauri-apps/api/tauri`.
- Zustand store with persistence already exists.

# Tests
1. `src-tauri/tests/save_load.rs` writes JSON with `save_state` then reads it back using `load_state`.
2. `apps/web/src/useFileIO.test.ts` mocks `invoke` and asserts wrapper calls.

# Tasks
1. Implement async `save_state(Json<String>)` and `load_state() -> Json<String>` in Rust.
2. Register the commands with `tauri::Builder`.
3. Add hook `useFileIO()` in `packages/engine/src/useFileIO.ts` that wraps `invoke` calls.
4. Ensure everything is non-blocking and works across macOS, Windows, and Linux.

Return a git-style diff with tests first.
# END
```

---

### Final Wiring Prompt — **Integration & Smoke E2E**

```prompt
Wire all modules for a smoke run.

**Tasks**
1. Sidebar nav with icons (Map / Forge / Play).
2. On Forge tab, drop 6 mock cards ➜ create character state.
3. Switch to Map tab, place that character on grid.
4. Start Play tab; ensure state machine enters `hero` phase.

**TDD / E2E**
- Playwright script `e2e/smoke.spec.ts`:
  1. Visit root.
  2. Forge hero.
  3. Place hero on map.
  4. Assert UI shows phase `hero`.

Return full diff; all unit and E2E tests must pass.
```

---

## ✅ Next Action

You now have:

1. Milestones → Chunks → TDD steps.
2. A sequenced set of code-generation prompts.

Feel free to ask for expansions (e.g., full prompt list, specific chunk) or adjustments before kicking off implementation.
