# HexCard Forge Nexus - Card Forge Component Implementation Guide

## Implementation Status (Updated May 29, 2025)

The HexCard Forge component has been successfully implemented with the following features:

1. **Hexagon Shape & Positioning**: ✓ COMPLETE
   - Horizontal orientation (flat top and bottom) using clip-path polygon
   - Perfect circle arrangement of hexagons around the center eye
   - Fixed aspect ratio for perfectly proportioned hexagons
   - Light blue color scheme (#AFD4E8) with diagonal grid pattern overlay
   - Added red diamond accents to the hexagons

2. **Center Eye Element**: ✓ COMPLETE
   - Gold star shape using CSS clip-path polygon
   - Dark purple circle in the center
   - Black dot with white highlight to create eye effect
   - Subtle animation effects

3. **Connection Elements**: ✓ COMPLETE
   - Green connection lines between hexagons
   - Red diamond gems at connection points
   - Properly positioned with CSS transforms
   - Interactive highlighting based on valid connections

4. **Card Inventory**: ✓ COMPLETE
   - Draggable cards matching the hexagonal style
   - Consistent styling with the forge sockets
   - Card state visualization

## Integration with Core Systems

The HexForge component integrates with the following project systems:

1. **State Management**: 
   - Uses Zustand store for managing forge state
   - Maintains placed cards, focusing, selection state
   - Provides methods for card placement and removal

2. **Card Schema**:
   - Consumes card data from `@hexcard/schema`
   - Handles edge connections based on card edge types
   - Validates card arrangements based on edge compatibility

3. **Fusion Algorithm**:
   - Calculates combined character stats from placed cards
   - Implements specialized bonuses for complementary card combinations
   - Returns structured character data when forge is complete

4. **Accessibility**:
   - Keyboard navigation for socket selection and card placement
   - High contrast mode option for better visibility
   - ARIA attributes for screen reader compatibility

## Enhancement Path

### 1. Interactive Refinements

- Implement save/load of forge configurations
- Add undo/redo history for card placements
- Enhance drag-and-drop with animations and feedback
- Add tooltip explanations for edge connections

### 2. Visual Polish

- Add particle effects when cards are successfully placed
- Implement animated transitions between card states
- Create visual feedback for successful character creation
- Add optional 3D perspective view using Three.js

### 3. Gameplay Extensions

- Implement card rarity effects on stat calculations
- Add special combination bonuses for specific card arrangements
- Create AI suggestion system to recommend card placements
- Add character preview with generated 3D model

## Technical Architecture

The component follows React best practices with:

- Functional components with typed props
- Custom hooks for logic separation (useForgeStore, useSocketPositions, useKeyboardNavigation)
- CSS modules for scoped styling
- Comprehensive unit tests for core logic

## Edge Connection System

Cards connect through a sophisticated edge matching system:

- Each card has 6 edges with types (attack, defense, element, skill, resource, link)
- Adjacent card edges must be compatible to form a valid connection
- "Link" edges can connect to any other edge type
- Same types always connect successfully
- Special combinations may provide additional bonuses

## Core Component Requirements

The HexCard Forge component satisfies these fundamental requirements:

1. Visualizes a central socket where 6 hex cards can be arranged
2. Displays visual connection points between each card
3. Provides drag-and-drop and keyboard controls for card placement
4. Shows visual feedback for card placement and valid connections
5. Calculates and displays character stats based on card arrangements
6. Follows the dark purple arcane-tech visual style from UI_in_HTML.html
7. Works as a standalone React component that can be integrated in both web-client and desktop-studio
8. Uses Three.js for basic 3D effects but keeps the interface clean and responsive
9. Accounts for keyboard-based accessibility for card placement

## Technical Specifications

### Component Structure

```
packages/ui/src/components/HexForge/
├── index.ts           # Public exports
├── HexForge.tsx      # Main component
├── ForgeSocket.tsx   # Individual socket component
├── CardPreview.tsx   # Display for draggable cards
├── ConnectionLine.tsx # Visual connector between cards 
├── ForgeResult.tsx   # Character result preview
├── types.ts          # Type definitions
├── useForgeLogic.ts  # Hook for forge calculations
└── styles.module.css # Component-specific styles
```

### Required Dependencies

- react
- react-dom
- @react-three/fiber (Three.js React renderer)
- @react-three/drei (Three.js helpers)
- react-dnd (for drag and drop)
- zustand (for component state)
- packages/schema (for HexCard and Character types)

### Key Features Implementation

#### 1. Hexagonal Layout

Position six sockets in a hexagonal arrangement around a central area. Use mathematical precision to place them at the correct angles (60° apart):

```tsx
const socketPositions = [
  { x: Math.cos(0 * Math.PI / 3) * radius, y: Math.sin(0 * Math.PI / 3) * radius },
  { x: Math.cos(1 * Math.PI / 3) * radius, y: Math.sin(1 * Math.PI / 3) * radius },
  { x: Math.cos(2 * Math.PI / 3) * radius, y: Math.sin(2 * Math.PI / 3) * radius },
  { x: Math.cos(3 * Math.PI / 3) * radius, y: Math.sin(3 * Math.PI / 3) * radius },
  { x: Math.cos(4 * Math.PI / 3) * radius, y: Math.sin(4 * Math.PI / 3) * radius },
  { x: Math.cos(5 * Math.PI / 3) * radius, y: Math.sin(5 * Math.PI / 3) * radius },
];
```

#### 2. Card Edge Connections

Implement visual connections that show how card edges connect. Each card has 6 edges with different types. Adjacent edges should be highlighted when they form valid connections.

```tsx
// Determine if edges match according to game rules
const isValidConnection = (edge1: EdgeIcon, edge2: EdgeIcon): boolean => {
  // Implementation based on game rules, e.g.,
  if (edge1 === edge2) return true; // Same type always connects
  if (edge1 === 'link' || edge2 === 'link') return true; // Link connects to anything
  
  // Other special rules...
  return false;
};
```

#### 3. Stats Calculation

Calculate character stats based on the combination of cards and their positions:

```tsx
const calculateStats = (placedCards: Array<HexCard | null>): CharacterStats => {
  let totalPower = 0;
  let attack = 0;
  let defense = 0;
  // Etc.
  
  placedCards.forEach((card, index) => {
    if (!card) return;
    
    // Basic stat contribution
    if (card.type === 'unit') attack += 1;
    if (card.type === 'structure') defense += 2;
    
    // Edge bonus calculations based on position
    // Card index determines which edges connect to which slots
    // ...
  });
  
  return { totalPower, attack, defense /* etc */ };
};
```

#### 4. Arcane-Tech Visual Style

Implement the visual style using CSS variables from UI_in_HTML.html:

```css
.forge-container {
  background-color: var(--violet-abyss);
  border-radius: var(--radius-lg);
  box-shadow: 0 0 24px rgba(129, 81, 181, 0.3);
}

.socket {
  background-color: var(--obsidian-petal);
  border: 2px solid var(--arcane-orchid);
  transition: all 0.2s ease;
}

.socket:hover, .socket:focus {
  border-color: var(--ether-cyan);
  box-shadow: 0 0 16px var(--rune-glow);
}

.valid-connection {
  stroke: var(--ether-cyan);
  filter: drop-shadow(0 0 8px var(--ether-cyan));
}

.invalid-connection {
  stroke: var(--void-magenta);
  opacity: 0.6;
}
```

#### 5. Three.js Integration

Use @react-three/fiber for the 3D elements:

```tsx
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';

const ForgeScene = () => {
  return (
    <Canvas>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} />
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 5]} intensity={0.6} />
      <ForgeSocketsGroup />
      <CardModels />
      <ConnectionLines />
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  );
};
```

#### 6. Accessibility Implementation

Ensure keyboard navigation works correctly:

```tsx
const HexForge = () => {
  const [focusedSocketIndex, setFocusedSocketIndex] = useState<number | null>(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      setFocusedSocketIndex(prev => (prev === null) ? 0 : (prev + 1) % 6);
    } else if (e.key === 'ArrowLeft') {
      setFocusedSocketIndex(prev => (prev === null) ? 5 : (prev - 1 + 6) % 6);
    } else if (e.key === 'Enter' || e.key === ' ') {
      // Place selected card in focused socket
      if (focusedSocketIndex !== null && selectedCardIndex !== null) {
        placeCard(selectedCardIndex, focusedSocketIndex);
      }
    }
    // Additional keyboard handling...
  };
  
  return (
    <div 
      className="hex-forge" 
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="application"
      aria-label="Hex Card Forge"
    >
      {/* Component content */}
    </div>
  );
};
```

## Testing Plan

1. Unit test the edge-matching logic and stat calculations
2. Component tests for card placement and rendering
3. Accessibility testing with keyboard navigation simulation
4. Visual regression tests for different card combinations
5. Performance testing with many cards

## Integration Example

```tsx
import { HexForge } from '@hexcard/ui';
import { useForgeStore } from '@hexcard/engine';

const ForgeScreen = () => {
  const { availableCards, forgeCharacter } = useForgeStore();
  
  const handleForgeComplete = (character) => {
    forgeCharacter(character);
    // Navigate or show success message
  };
  
  return (
    <div className="forge-screen-container">
      <h1>Forge Your Character</h1>
      <p>Place six cards in the forge to create a new character</p>
      
      <HexForge
        availableCards={availableCards}
        onForgeComplete={handleForgeComplete}
        enableEffects={true}
        accessibilityMode={false} // Toggle for reduced motion/effects
      />
      
      <div className="card-inventory">
        {/* Show available cards to drag */}
      </div>
    </div>
  );
};
```

Implement this component with careful attention to both visual appeal and technical robustness. The forge is a central gameplay mechanism, so ensure it feels satisfying and magical to use.

The component should be lightweight, responsive, and align with the established Zod schema for HexCard and Character types.