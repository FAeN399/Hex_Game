# HexCard Forge Nexus

A dark-themed, arcane-tech card and map strategy game that combines tactical gameplay with mystical elements.

## Features

- Hexagonal card system for strategic gameplay
- Interactive map-based battles
- Dark theme with arcane aesthetics
- Modern UI components with responsive design
- Rich lore and immersive world-building
- Optional AI card suggestion in the forge screen

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm package manager (`npm install -g pnpm`)
- Modern web browser for web components

### Installation
1. Clone the repository
2. Install dependencies using `pnpm install`
3. Start the web client with `pnpm dev:web` or the desktop app with `pnpm dev:desktop`
4. Run all tests with `pnpm test`

## Project Structure

```
apps/
  web-client/       # React + Vite front end
  desktop-studio/   # Tauri wrapper for desktop
packages/
  schema/           # Zod data models
  engine/           # Pure game logic (forge, turn state machine)
  ui/               # Shared UI components
  story/            # Narrative event generator
apps/
  session-manager/  # CLI for session transitions
```

Additional documentation lives in the `docs/` folder.

### AI Card Suggestion
On the Forge screen you can click **Suggest Card** to let the engine recommend a
card from your collection that best matches the edges of the cards you've
already placed. This feature is optional and doesn't modify your selection until
you choose to use the suggested card.

### Story Events Between Sessions
The `story` package introduces psychological attributes that drive automatic
narrative scenes between weekly games. Use the `session-manager` CLI to input a
scenario and players' choices, then receive a short script of generated events.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions and support, please open an issue in the repository.
