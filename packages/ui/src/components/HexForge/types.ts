import { HexCardType as HexCard, CharacterType as Character, EdgeIconType as EdgeIcon } from 'schema';

export interface HexForgeProps {
  /**
   * Cards available for forging
   */
  availableCards: HexCard[];
  
  /**
   * Callback when a character is successfully forged
   */
  onForgeComplete?: (character: Character) => void;
  
  /**
   * Enable particle and lighting effects
   * @default true
   */
  enableEffects?: boolean;
  
  /**
   * Enable high-contrast mode for accessibility
   * @default false
   */
  accessibilityMode?: boolean;
}

export interface ForgeSocketProps {
  /**
   * Index of the socket (0-5)
   */
  index: number;
  
  /**
   * Position in the hexagonal arrangement
   */
  position: {
    x: number;
    y: number;
  };
  
  /**
   * Card currently in this socket (if any)
   */
  card: HexCard | null;
  
  /**
   * Whether the socket is currently focused via keyboard
   */
  isFocused: boolean;
  
  /**
   * Callback when a card is placed in this socket
   */
  onCardPlaced: (cardId: string) => void;
  
  /**
   * Callback when a card is removed from this socket
   */
  onCardRemoved: () => void;
  
  /**
   * Whether this socket is highlighted as part of a valid pattern
   */
  isHighlighted: boolean;
}

export interface CardPreviewProps {
  /**
   * The card to display
   */
  card: HexCard;
  
  /**
   * Whether the card is currently being dragged
   */
  isDragging?: boolean;
  
  /**
   * Whether the card is currently selected via keyboard
   */
  isSelected?: boolean;
  
  /**
   * Size of the card (in pixels)
   */
  size?: number;
}

export interface ConnectionLineProps {
  /**
   * Start position of the connection line
   */
  startPos: {
    x: number;
    y: number;
  };
  
  /**
   * End position of the connection line
   */
  endPos: {
    x: number;
    y: number;
  };
  
  /**
   * Whether the connection is valid according to game rules
   */
  isValid: boolean;
  
  /**
   * The type of edge at the starting position
   */
  startEdgeType: EdgeIcon;
  
  /**
   * The type of edge at the ending position
   */
  endEdgeType: EdgeIcon;
}

export interface ForgeResultProps {
  /**
   * Cards placed in the forge
   */
  placedCards: Array<HexCard | null>;
  
  /**
   * Whether the forge is complete (all cards placed)
   */
  isComplete: boolean;
  
  /**
   * Character stats generated from the current card arrangement
   */
  characterStats: CharacterStats;
}

export interface CharacterStats {
  /**
   * Total power of the character
   */
  totalPower: number;
  
  /**
   * Attack value
   */
  attack: number;
  
  /**
   * Defense value
   */
  defense: number;
  
  /**
   * Speed value
   */
  speed: number;
  
  /**
   * Magic value
   */
  magic: number;
  
  /**
   * Special abilities gained from card combinations
   */
  specialAbilities: string[];
}

export interface ForgeState {
  /**
   * Cards placed in each socket (0-5)
   */
  placedCards: Array<HexCard | null>;
  
  /**
   * Index of the currently focused socket (for keyboard navigation)
   */
  focusedSocketIndex: number | null;
  
  /**
   * Index of the currently selected card (for keyboard navigation)
   */
  selectedCardIndex: number | null;
  
  /**
   * Set a card in a specific socket
   */
  placeCard: (card: HexCard, socketIndex: number) => void;
  
  /**
   * Remove a card from a socket
   */
  removeCard: (socketIndex: number) => void;
  
  /**
   * Set the focused socket index
   */
  setFocusedSocket: (index: number | null) => void;
  
  /**
   * Set the selected card index
   */
  setSelectedCard: (index: number | null) => void;
  
  /**
   * Calculate the current character stats based on placed cards
   */
  getCurrentStats: () => CharacterStats;
  
  /**
   * Check if the current arrangement forms a valid character
   */
  isValidArrangement: () => boolean;
  
  /**
   * Reset the forge to empty state
   */
  resetForge: () => void;
}
