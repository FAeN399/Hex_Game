# Story Module and Session Manager

This module introduces automatic narrative events driven by character psychological attributes.

## Character Attributes
Each character profile can now include:
- **fear**: level of terror or anxiety (0-10)
- **inspire**: ability to rouse others or take bold action (0-10)
- **mindControl**: susceptibility to or mastery of psychic influence (0-10)

These attributes are defined in `packages/story/src/index.ts` and are used to generate events between sessions.

## Automatic Event Generation
`generateAttributeEvents(profile)` returns a list of `StoryEvent` objects based on a character's attributes. Events include dreams, personal quests, and environmental changes.

`scriptAutomaticEvents(profiles, scenario, decisions)` combines player decisions with these automatic events to form a narrative script for the next session.

## Session Manager CLI
A simple command line interface lives in `apps/session-manager`. Run the build script then start the tool:

```bash
pnpm --filter session-manager build
node apps/session-manager/dist/index.js
```

The CLI prompts the game master for a scenario description, character attributes, and a player decision. It then prints the generated story events.

## Maintaining
- All story logic resides in the `story` package for easy extension.
- Tests can be run with `pnpm --filter story test`.
