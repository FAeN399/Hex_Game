---

title: HexCard Forge – To‑Do Checklist
project: HexCard Forge Unified App
related\_plan: implementation\_plan.md
related\_spec: specification\_v0.9.md
date: 2025-05-28
----------------

## Milestone M‑0 — Project Skeleton & CI

* [ ] **C0‑1 Init Monorepo & Workspaces**  (M‑0)
* [ ] **C0‑2 Add Lint/Format Hooks**  (M‑0)
* [ ] **C0‑3 Configure Vitest & Sample Test**  (M‑0)
* [ ] **C0‑4 Set up Playwright E2E Scaffold**  (M‑0)
* [ ] **C0‑5 GitHub Actions Matrix Build**  (M‑0)

## Milestone M‑1 — Shared Schema & Store

* [ ] **C1‑1 Implement Zod Schema**  (M‑1)
* [ ] **C1‑2 Wire Zustand Store + Persist**  (M‑1)
* [ ] **C1‑3 Add Save/Load Helper (Failing Tests)**  (M‑1)
* [ ] **C1‑4 Green‑Light Save/Load Tests**  (M‑1)

## Milestone M‑2 — Forge MVP

* [ ] **C2‑1 Forge UI Skeleton**  (M‑2)
* [ ] **C2‑2 Card Drag‑Drop Component + Tests**  (M‑2)
* [ ] **C2‑3 Fusion Algorithm (Pure Fn + Tests)**  (M‑2)
* [ ] **C2‑4 Integrate Algorithm into UI; Snapshot Test**  (M‑2)

## Milestone M‑3 — Map Editor MVP

* [ ] **C3‑1 Hex Grid Renderer Component**  (M‑3)
* [ ] **C3‑2 Terrain Brush Tool + Reducer Tests**  (M‑3)
* [ ] **C3‑3 File Export/Import Service + Tests**  (M‑3)

## Milestone M‑4 — Card Game Loop MVP

* [ ] **C4‑1 Turn State Machine (Pure)**  (M‑4)
* [ ] **C4‑2 Edge Combat Resolver + Tests**  (M‑4)
* [ ] **C4‑3 Board View & Interaction Wiring**  (M‑4)
* [ ] **C4‑4 E2E: Minimal Match Passes**  (M‑4)

## Milestone M‑5 — Cross‑Module Integration

* [ ] **C5‑1 Sidebar Navigation (React Router)**  (M‑5)
* [ ] **C5‑2 Undo/Redo Middleware + Tests**  (M‑5)
* [ ] **C5‑3 Cross‑Module State Sync E2E**  (M‑5)

## Milestone M‑6 — Procedural Map & AI Hints

* [ ] **C6‑1 Procedural Map Generator Fn + Tests**  (M‑6)
* [ ] **C6‑2 AI Forge Suggestion Fn + Tests**  (M‑6)
* [ ] **C6‑3 UI Controls for Procedural & AI Features**  (M‑6)

## Milestone M‑7 — Desktop Build & Accessibility

* [ ] **C7‑1 Tauri Scaffold & IPC Bridge Tests**  (M‑7)
* [ ] **C7‑2 Desktop Save Dialog Integration**  (M‑7)
* [ ] **C7‑3 Axe‑Core Accessibility Audit CI Step**  (M‑7)

## Milestone M‑8 — Polish & Balance Pass

* [ ] **C8‑1 Balance Script & Snapshot Tests**  (M‑8)
* [ ] **C8‑2 Particle/FX Polish Pass**  (M‑8)
* [ ] **C8‑3 Release Build Script & Checksum**  (M‑8)

---

### Requirements Compliance Checklist

* [ ] **R‑1 Seamless Module Switching**
* [ ] **R‑2 Cards Usable Anywhere (No Locks)**
* [ ] **R‑3 Manual & Procedural Map Modes**
* [ ] **R‑4 Robust Save/Load (Web + Desktop)**
* [ ] **R‑5 AI Assistants Functional**
* [ ] **R‑6 Offline Desktop & Online Web Builds**
* [ ] **R‑7 WCAG 2.2 AA Accessibility**

---

### Continuous Testing

* [ ] Vitest Unit Coverage ≥ 90 %
* [ ] Playwright E2E Smoke Suite Green
* [ ] GitHub Actions Matrix Passing

### Documentation

* [ ] Update `README.md` after each milestone
* [ ] Generate Storybook or Demo GIFs at M‑2, M‑3, M‑4

### Review Gates

* [ ] Milestone PR reviewed & merged before next sprint
