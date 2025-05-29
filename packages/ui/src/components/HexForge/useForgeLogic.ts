import { useState, useCallback, useMemo } from 'react';
import { create } from 'zustand';
import { HexCard, EdgeIcon } from '@hexcard/schema';
import { ForgeState, CharacterStats } from './types';

/**
 * Custom hook that provides the forge state management logic
 */
export const useForgeStore = create<ForgeState>((set, get) => ({
  placedCards: [null, null, null, null, null, null],
  focusedSocketIndex: null,
  selectedCardIndex: null,
  
  placeCard: (card: HexCard, socketIndex: number) => {
    set(state => {
      // Create a new array with the card placed at the specified index
      const newPlacedCards = [...state.placedCards];
      newPlacedCards[socketIndex] = card;
      return { placedCards: newPlacedCards };
    });
  },
  
  removeCard: (socketIndex: number) => {
    set(state => {
      // Create a new array with null at the specified index
      const newPlacedCards = [...state.placedCards];
      newPlacedCards[socketIndex] = null;
      return { placedCards: newPlacedCards };
    });
  },
  
  setFocusedSocket: (index: number | null) => {
    set({ focusedSocketIndex: index });
  },
  
  setSelectedCard: (index: number | null) => {
    set({ selectedCardIndex: index });
  },
  
  getCurrentStats: () => {
    const { placedCards } = get();
    return calculateCharacterStats(placedCards);
  },
  
  isValidArrangement: () => {
    const { placedCards } = get();
    // Check if all sockets are filled
    if (placedCards.some(card => card === null)) {
      return false;
    }
    
    // Check if connections between adjacent cards are valid
    for (let i = 0; i < placedCards.length; i++) {
      const currentCard = placedCards[i]!; // Non-null assertion (we checked above)
      const nextCard = placedCards[(i + 1) % placedCards.length]!;
      
      // Get the adjacent edges
      const currentEdge = currentCard.edges[(i + 3) % 6]; // Opposite edge
      const nextEdge = nextCard.edges[i];
      
      if (!isValidConnection(currentEdge, nextEdge)) {
        return false;
      }
    }
    
    return true;
  },
  
  resetForge: () => {
    set({
      placedCards: [null, null, null, null, null, null],
      focusedSocketIndex: null,
      selectedCardIndex: null
    });
  }
}));

/**
 * Checks if two edges form a valid connection
 */
export const isValidConnection = (edge1: EdgeIcon, edge2: EdgeIcon): boolean => {
  // Same types always connect
  if (edge1 === edge2) return true;
  
  // Link connects to anything
  if (edge1 === "link" || edge2 === "link") return true;
  
  // Other special connection rules can be added here
  
  // Default: edges don't connect
  return false;
};

/**
 * Calculate character stats based on the placed cards
 */
export const calculateCharacterStats = (placedCards: Array<HexCard | null>): CharacterStats => {
  // Default stats
  let totalPower = 0;
  let attack = 0;
  let defense = 0;
  let speed = 0;
  let magic = 0;
  const specialAbilities: string[] = [];
  
  // Count filled slots
  const filledSlots = placedCards.filter(card => card !== null).length;
  
  // If no cards placed, return default stats
  if (filledSlots === 0) {
    return { totalPower, attack, defense, speed, magic, specialAbilities };
  }
  
  // Process each card's contribution
  placedCards.forEach((card, index) => {
    if (!card) return;
    
    // Basic stat contribution based on card type
    if (card.type === "unit") {
      attack += 1;
      defense += 1;
    } else if (card.type === "hero") {
      attack += 2;
      defense += 1;
      speed += 1;
    } else if (card.type === "spell") {
      magic += 2;
      speed += 1;
    } else if (card.type === "structure") {
      defense += 3;
    } else if (card.type === "relic") {
      magic += 1;
      attack += 1;
    }
    
    // Add bonus based on edge types
    card.edges.forEach(edge => {
      switch(edge) {
        case "attack":
          attack += 0.5;
          break;
        case "defense":
          defense += 0.5;
          break;
        case "skill":
          speed += 0.5;
          break;
        case "element":
          magic += 0.5;
          break;
        case "resource":
          totalPower += 1;
          break;
        case "link":
          // Links contribute to all stats slightly
          attack += 0.2;
          defense += 0.2;
          speed += 0.2;
          magic += 0.2;
          break;
      }
    });
    
    // Process tag-based abilities
    if (card.tags) {
      if (card.tags.includes("fire")) {
        specialAbilities.push("Fire Damage");
      }
      if (card.tags.includes("guardian")) {
        specialAbilities.push("Guardian Shield");
        defense += 1;
      }
      // Add more tag-based abilities here
    }
  });
  
  // Calculate adjacency bonuses for valid connections
  for (let i = 0; i < placedCards.length; i++) {
    const currentCard = placedCards[i];
    const nextCard = placedCards[(i + 1) % placedCards.length];
    
    if (!currentCard || !nextCard) continue;
    
    // Get the adjacent edges
    const currentEdge = currentCard.edges[(i + 3) % 6]; // Opposite edge
    const nextEdge = nextCard.edges[i];
    
    if (isValidConnection(currentEdge, nextEdge)) {
      totalPower += 1; // Bonus for valid connections
      
      // Special combos
      if ((currentEdge === "attack" && nextEdge === "attack")) {
        attack += 1; // Double attack bonus
      }
      if ((currentEdge === "defense" && nextEdge === "defense")) {
        defense += 1; // Double defense bonus
      }
    }
  }
  
  // Round stats to integers for display
  totalPower = Math.round(totalPower + (attack + defense + speed + magic) / 4);
  
  return {
    totalPower: Math.round(totalPower),
    attack: Math.round(attack),
    defense: Math.round(defense),
    speed: Math.round(speed),
    magic: Math.round(magic),
    specialAbilities: [...new Set(specialAbilities)] // Remove duplicates
  };
};

/**
 * Hook that calculates socket positions in a hexagonal arrangement
 */
export const useSocketPositions = (radius: number = 150) => {
  return useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      x: Math.cos((i * Math.PI) / 3) * radius,
      y: Math.sin((i * Math.PI) / 3) * radius
    }));
  }, [radius]);
};

/**
 * Hook that manages keyboard navigation logic
 */
export const useKeyboardNavigation = () => {
  const { focusedSocketIndex, selectedCardIndex, setFocusedSocket, setSelectedCard, placeCard } = useForgeStore();
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent, availableCards: HexCard[]) => {
    // Socket navigation with arrow keys
    if (e.key === "ArrowRight") {
      setFocusedSocket(prev => (prev === null) ? 0 : (prev + 1) % 6);
      e.preventDefault();
    } else if (e.key === "ArrowLeft") {
      setFocusedSocket(prev => (prev === null) ? 5 : (prev - 1 + 6) % 6);
      e.preventDefault();
    }
    
    // Card selection with up/down
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      if (availableCards.length === 0) return;
      
      if (e.key === "ArrowUp") {
        setSelectedCard(prev => (prev === null) ? 0 : (prev === 0 ? availableCards.length - 1 : prev - 1));
      } else {
        setSelectedCard(prev => (prev === null) ? 0 : (prev + 1) % availableCards.length);
      }
      e.preventDefault();
    }
    
    // Place card with Enter or Space
    if ((e.key === "Enter" || e.key === " ") && focusedSocketIndex !== null && selectedCardIndex !== null) {
      const card = availableCards[selectedCardIndex];
      placeCard(card, focusedSocketIndex);
      e.preventDefault();
    }
  }, [focusedSocketIndex, selectedCardIndex, setFocusedSocket, setSelectedCard, placeCard]);
  
  return { handleKeyDown };
};
