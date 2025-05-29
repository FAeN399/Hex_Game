# Prompt Summary from Documentation

This file compiles notable prompts and actionable suggestions gathered from `Overview.md` and `Deep_Dive.md`.

## Overview.md – Key Code Generation Prompts

1. **Prompt #1 – Monorepo Setup (C0-1)**
   - Initialize the pnpm monorepo with `apps/web`, `apps/desktop`, and `packages/schema`.
   - Scaffold a minimal React+Vite app with a test expecting `<h1>Hello Forge</h1>`.
2. **Prompt #2 – Lint & Format Hooks (C0-2)**
   - Configure ESLint and Prettier with husky and lint-staged pre-commit hooks.
   - Verify linting by auto-fixing a deliberately bad file.
3. **Prompt #3 – Zod Schema & Tests (C1-1)**
   - Implement shared data models in `packages/schema` and provide Vitest fixtures for valid and invalid JSON.
4. **Prompt #4 – Zustand Store w/ Persistence (C1-2)**
   - Create a global Zustand store with localStorage persistence and accompanying tests.
5. **Subsequent Prompts (C1-3 → C8-3)**
   - Follow similar chunks covering the rest of the milestones.
6. **Final Integration Prompt**
   - Run a smoke end-to-end test after all features are implemented.
7. **Using the Prompts**
   - Feed each prompt to a coding-capable LLM (e.g., GPT‑4 or GitHub Copilot CLI) and run the tests before proceeding.

## Deep_Dive.md – Recommended Prompt Ideas

- **Use LLMs for Requirement QA**
  - Ask a model to check the specification for unclear statements or missing test cases.
- **Clarify and Expand the Specification**
  - Add a section for non‑functional requirements and ensure every requirement has acceptance criteria.
- **Add Lifecycle Tasks to `todo.md`**
  - Include documentation, performance checks and other non-development tasks.
- **Risk Review Each Iteration**
  - Schedule a recurring “Risk Review and Mitigation” task in the development cycle.
- **Document Architecture Decisions**
  - Record chosen architecture and rationale in a short design doc.
- **Demo Early for Stakeholder Feedback**
  - Plan milestones where a working demo is shown to stakeholders to solicit feedback.
