# Forge Completion Strategy

This document outlines a short-term plan to finish the **Forge** module so players can create characters from their card collection. It pulls together information from `spec.md`, `prompt_plan.md` and `todo.md`.

## Goals
- Allow six cards to be fused into a character as described in the specification.
- Ensure the forge UI and underlying logic are complete and fully tested.
- Keep development focused on Milestone M‑2 until all tasks are finished.

## Plan
1. **Review Requirements**
   - Confirm behaviour in `spec.md` section *Forge*.
   - Note the Milestone M‑2 tasks in `todo.md`:
     - `C2‑1` Forge UI Skeleton
     - `C2‑2` Card Drag‑Drop Component + Tests
     - `C2‑3` Fusion Algorithm (Pure Fn + Tests)
     - `C2‑4` Integrate Algorithm into UI; Snapshot Test
2. **Work Through Prompt Series**
   - `prompt_plan.md` provides code‑generation prompts for each chunk. Execute them sequentially and run `pnpm -r test` after each.
3. **Focus on Store and Schema**
   - Use the Zod schemas in `packages/schema` and the forge store in `packages/engine/src` to validate characters.
   - Ensure unit tests in `packages/engine/src/forge.test.ts` remain green.
4. **UI Implementation Steps**
   - Build the visual skeleton first (`C2‑1`).
   - Implement drag‑drop interactions for hex slots (`C2‑2`).
   - Connect the pure fusion logic (`C2‑3`) from `packages/engine`.
   - Finalise integration and snapshot test the component (`C2‑4`).
5. **Exit Criteria**
   - All M‑2 tasks in `todo.md` are checked off.
   - `pnpm -r test` shows unit and component tests passing.
   - A player can forge a hero from six cards in the UI without errors.

Following this strategy keeps development centred on the Forge until it is functional, providing the foundation for characters used in later modules.
