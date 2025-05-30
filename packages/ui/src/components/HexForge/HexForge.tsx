import * as React from 'react';
import { FC, useEffect, useState, useRef, useCallback } from 'react';
import { randomUUID } from 'crypto';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  HexForgeProps, 
  CharacterStats,
  ForgeState,
  ForgeSocketProps,
  CardPreviewProps,
  ForgeResultProps
} from './types';
// @ts-ignore - Schema module exists but TS can't find declaration
import { HexCardType as HexCard, CharacterType, EdgeIconType as EdgeIcon } from 'schema';
import ForgeSocket from './ForgeSocket';
import CardPreview from './CardPreview';
import ConnectionLine from './ConnectionLine';
import ForgeResult from './ForgeResult';
import ForgeParticles from './ForgeParticles';
import ForgeConfigurationManager from './ForgeConfigurationManager';
import { useForgeStore, isValidConnection as isEdgeValid } from './useForgeLogic';
// @ts-ignore - CSS Module exists but TS can't find declaration
import styles from './styles.module.css';

// Define interfaces for component state
interface Position {
  x: number;
  y: number;
}

interface Connection {
  sourceIndex: number;
  targetIndex: number;
  isValid: boolean;
  sourceEdge?: string;
  targetEdge?: string;
}

interface EffectState {
  isActive: boolean;
  sourcePosition: Position | null;
  targetPosition: Position | null;
  particleType: 'connection' | 'placement' | 'success' | 'forge';
}

interface TemporaryMessage {
  text: string;
  type: 'success' | 'error' | 'info';
  duration: number;
  timestamp: number;
  timeout?: NodeJS.Timeout | null;
}

interface ConfigurationData {
  enableParticles: boolean;
  highContrastMode: boolean;
  socketSize: number;
  connectionThickness: number;
  particleCount: number;
  animationSpeed: number;
  colorTheme: 'dark' | 'light' | 'high-contrast';
}

interface ForgeConfigManagerProps {
  configuration: ConfigurationData;
  onConfigChange: (newConfig: ConfigurationData) => void;
}

/**
 * Helper function to calculate socket positions in a hexagonal arrangement
 */
const calculateSocketPositions = (): Position[] => {
  const positions: Position[] = [];
  const radius = 38; // Percentage of container size
  const centerX = 50;
  const centerY = 50;
  
  // Calculate positions in a hexagon pattern around the center
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    positions.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    });
  }
  
  return positions;
};

/**
 * Helper function to generate a character name based on the cards used
 */
const generateCharacterName = (cards: (HexCard | null)[]): string => {
  // Filter out null cards
  const validCards = cards.filter(card => card !== null) as HexCard[];
  
  // Get the most common card type for a title
  const typeCount: Record<string, number> = {};
  let mostCommonType = '';
  let highestCount = 0;
  
  validCards.forEach(card => {
    const type = card.type || 'Unknown';
    typeCount[type] = (typeCount[type] || 0) + 1;
    
    if (typeCount[type] > highestCount) {
      mostCommonType = type;
      highestCount = typeCount[type];
    }
  });
  
  // Generate a random prefix
  const prefixes = ['Mystical', 'Ancient', 'Arcane', 'Ethereal', 'Shadowy', 'Celestial', 'Primal', 'Astral'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  
  // Capitalize the type for the title
  const title = mostCommonType.charAt(0).toUpperCase() + mostCommonType.slice(1);
  
  return `${prefix} ${title}`;
};

/**
 * Helper function to validate connections between hex cards
 */
const isValidConnection = (sourceCard: HexCard | null, targetCard: HexCard | null): boolean => {
  if (!sourceCard || !targetCard) return false;
  
  // Check edge compatibility (fictional logic, replace with actual game rules)
  const sourceEdge = sourceCard.edges?.[0] || 'default';
  const targetEdge = targetCard.edges?.[0] || 'default';
  
  // Simple example: edges with same type can connect
  return sourceEdge === targetEdge;
};

/**
 * Calculate character stats based on the cards placed in the forge
 */
const calculateCharacterStats = (cards: (HexCard | null)[]): CharacterStats => {
  const filledCards = cards.filter((card): card is HexCard => card !== null);
  
  // Base stats
  const stats: CharacterStats = {
    totalPower: 0,
    attack: 0,
    defense: 0,
    speed: 0,
    magic: 0,
    specialAbilities: []
  };
  
  // Aggregate stats from cards based on their type and properties
  filledCards.forEach(card => {
    // Calculate stats based on card type
    switch(card.type) {
      case 'unit':
        stats.attack += 1;
        stats.defense += 1;
        break;
      case 'hero':
        stats.attack += 2;
        stats.defense += 1;
        stats.speed += 1;
        break;
      case 'spell':
        stats.magic += 2;
        stats.speed += 1;
        break;
      case 'structure':
        stats.defense += 3;
        break;
      case 'relic':
        stats.magic += 1;
        stats.attack += 1;
        break;
    }
    
    // Add bonuses based on edge types
    card.edges.forEach(edge => {
      switch(edge) {
        case 'attack':
          stats.attack += 0.5;
          break;
        case 'defense':
          stats.defense += 0.5;
          break;
        case 'skill':
          stats.speed += 0.5;
          break;
        case 'element':
          stats.magic += 0.5;
          break;
      }
    });
    
    // Generate abilities based on card tags
    card.tags.forEach(tag => {
      const ability = `${card.type.charAt(0).toUpperCase() + card.type.slice(1)} ${tag}`;
      if (!stats.specialAbilities.includes(ability)) {
        stats.specialAbilities.push(ability);
      }
    });
  });
  
  // Round stats to integers
  stats.attack = Math.round(stats.attack);
  stats.defense = Math.round(stats.defense);
  stats.speed = Math.round(stats.speed);
  stats.magic = Math.round(stats.magic);
  
  // Calculate total power
  stats.totalPower = stats.attack + stats.defense + stats.speed + stats.magic;
  
  return stats;
};

/**
 * HexForge Component - The main forge component for combining hex cards
 */
const HexForge: FC<HexForgeProps> = ({ 
  availableCards, 
  onForgeComplete, 
  enableEffects = true, 
  accessibilityMode = false 
}) => {
  // References for socket elements
  const socketRefs = useRef<(HTMLDivElement | null)[]>([]);
  const forgeContainerRef = useRef<HTMLDivElement | null>(null);
  
  // Socket positions in a hexagonal arrangement
  const socketPositions = calculateSocketPositions();
  
  // Forge state from store
  const placedCards = useForgeStore(state => state.placedCards);
  const placeCardAction = useForgeStore(state => state.placeCard);
  const removeCardAction = useForgeStore(state => state.removeCard);
  const resetForgeAction = useForgeStore(state => state.resetForge);
  // Derive used IDs for filtering
  const usedCardIds = placedCards.filter((c): c is HexCard => c !== null).map(c => c.id);
  
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isForgeComplete, setIsForgeComplete] = useState<boolean>(false);
  const [characterStats, setCharacterStats] = useState<CharacterStats>({
    totalPower: 0,
    attack: 0,
    defense: 0,
    speed: 0,
    magic: 0,
    specialAbilities: []
  });
  
  // Visual effects and config states
  const [tempMessage, setTempMessage] = useState<TemporaryMessage | null>(null);
  const [effects, setEffects] = useState<EffectState[]>([]);
  const [focusedSocket, setFocusedSocket] = useState<number | null>(null);
  const [config, setConfig] = useState<ConfigurationData>({
    particleCount: 20,
    connectionThickness: 2,
    socketSize: 80,
    animationSpeed: 1,
    colorTheme: 'dark',
    enableParticles: true,
    highContrastMode: false
  });
  
  // Add a temporary message with auto-dismiss
  const addTempMessage = useCallback((text: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000) => {
    // Clear any existing message timer
    if (tempMessage?.timeout) {
      clearTimeout(tempMessage.timeout);
    }
    
    const timeout = setTimeout(() => {
      setTempMessage(null);
    }, duration);
    
    setTempMessage({
      text,
      type,
      duration,
      timestamp: Date.now(),
      timeout
    });
  }, [tempMessage]);
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (tempMessage?.timeout) {
        clearTimeout(tempMessage.timeout);
      }
    };
  }, [tempMessage]);
  
  // Handle card placement in a socket
  const handleCardPlaced = useCallback((card: HexCard, socketIndex: number) => {
    if (socketIndex < 0 || socketIndex >= 6) return;
    
    // Check if the slot is empty
    if (!placedCards[socketIndex]) {
      // Place the card in store and update local copy
      const newPlacedCards = [...placedCards];
      newPlacedCards[socketIndex] = card;
      placeCardAction(card, socketIndex);
      
      // Trigger placement effect
      if (enableEffects) {
        setEffects(prev => [
          ...prev,
          {
            isActive: true,
            sourcePosition: null,
            targetPosition: socketPositions[socketIndex],
            particleType: 'placement'
          }
        ]);
        
        // Show success message
        addTempMessage(`Card placed in socket ${socketIndex + 1}`, 'success');
      }
      
      // Check connections and update stats
      validateConnections(newPlacedCards);
      updateCharacterStats(newPlacedCards);
    }
  }, [placedCards, socketPositions, enableEffects, addTempMessage]);
  
  // Handle card removal from a socket
  const handleCardRemoval = useCallback((socketIndex: number) => {
    if (socketIndex < 0 || socketIndex >= 6) return;
    
    const card = placedCards[socketIndex];
    if (card) {
      // Remove the card in store and update local copy
      const newPlacedCards = [...placedCards];
      newPlacedCards[socketIndex] = null;
      removeCardAction(socketIndex);
      
      // Update connections and stats
      validateConnections(newPlacedCards);
      updateCharacterStats(newPlacedCards);
      
      // Reset forge completion state
      setIsForgeComplete(false);
      
      // Show message
      addTempMessage(`Card removed from socket ${socketIndex + 1}`, 'info');
    }
  }, [placedCards, addTempMessage]);
  
  // Validate connections between cards
  const validateConnections = useCallback((cards: (HexCard | null)[]) => {
    const newConnections: Connection[] = [];
    
    // Check adjacent sockets for valid connections
    for (let i = 0; i < 6; i++) {
      const nextIndex = (i + 1) % 6;
      
      if (cards[i] && cards[nextIndex]) {
        const sourceCard = cards[i];
        const targetCard = cards[nextIndex];
        
        if (sourceCard && targetCard) {
          // Check if edges are compatible
          const sourceEdge = sourceCard.edges?.[i] || 'default';
          const targetEdge = targetCard.edges?.[nextIndex] || 'default';
          // Validate connection based on edge types
          const isValid = isEdgeValid(sourceEdge as any, targetEdge as any);
          
          newConnections.push({
            sourceIndex: i,
            targetIndex: nextIndex,
            isValid,
            sourceEdge,
            targetEdge
          });
          
          // If connection is valid and effects are enabled, show connection effect
          if (isValid && enableEffects) {
            setEffects(prev => [
              ...prev,
              {
                isActive: true,
                sourcePosition: socketPositions[i],
                targetPosition: socketPositions[nextIndex],
                particleType: 'connection'
              }
            ]);
          }
        }
      }
    }
    
    setConnections(newConnections);
    
    // Check if all slots are filled and all connections are valid
    const allSlotsFilled = cards.every(card => card !== null);
    const allConnectionsValid = newConnections.length === 6 && newConnections.every(conn => conn.isValid);
    
    if (allSlotsFilled && allConnectionsValid && !isForgeComplete) {
      setIsForgeComplete(true);
      
      if (enableEffects) {
        setEffects(prev => [
          ...prev,
          {
            isActive: true,
            sourcePosition: { x: 50, y: 50 }, // Center of the forge
            targetPosition: null,
            particleType: 'success'
          }
        ]);
      }
      
      addTempMessage('Forge complete! Character can now be created.', 'success', 5000);
    }
  }, [socketPositions, enableEffects, isForgeComplete, addTempMessage]);
  
  // Update character stats based on placed cards
  const updateCharacterStats = useCallback((cards: (HexCard | null)[]) => {
    const stats = calculateCharacterStats(cards);
    setCharacterStats(stats);
  }, []);
  
  // Handle character creation when forge is complete
  const handleCreateCharacter = useCallback(() => {
    if (!isForgeComplete) return;
    
    // Create character from the forge
    const stats = characterStats;
    
    if (enableEffects) {
      // Show forge effect
      setEffects(prev => [
        ...prev,
        {
          isActive: true,
          sourcePosition: { x: 50, y: 50 },
          targetPosition: null,
          particleType: 'forge'
        }
      ]);
      
      addTempMessage('Creating character...', 'info');
      
      // Call the completion callback after a delay for the animation
      setTimeout(() => {
        if (onForgeComplete) {
          // Use the engine's forgeCharacter function
          const nonNullCards = placedCards.filter((card): card is HexCard => card !== null);
          const characterName = generateCharacterName(placedCards);
          
          // Create a character that matches the schema definition
          const character: CharacterType = {
            id: randomUUID(),
            name: characterName,
            cardIds: nonNullCards.map(card => card.id),
            stats: {
              totalPower: stats.totalPower,
              attack: stats.attack,
              defense: stats.defense,
              speed: stats.speed,
              magic: stats.magic
            },
            abilities: stats.specialAbilities
          };
          
          onForgeComplete(character);
          addTempMessage('Character created successfully!', 'success');
          
          // Reset the forge after a short delay
          setTimeout(() => {
            resetForge();
          }, 2000);
        }
      }, 1500);
    } else {
      // Call the completion callback immediately if effects are disabled
      if (onForgeComplete) {
        // Use the engine's forgeCharacter function
        const nonNullCards = placedCards.filter((card): card is HexCard => card !== null);
        const characterName = generateCharacterName(placedCards);
        
        // Create a character that matches the schema definition
        const character: CharacterType = {
          id: randomUUID(),
          name: characterName,
          cardIds: nonNullCards.map(card => card.id),
          stats: {
            totalPower: stats.totalPower,
            attack: stats.attack,
            defense: stats.defense,
            speed: stats.speed,
            magic: stats.magic
          },
          abilities: stats.specialAbilities
        };
        
        onForgeComplete(character);
        resetForge();
      }
    }
  }, [isForgeComplete, characterStats, enableEffects, placedCards, onForgeComplete, addTempMessage]);
  
  // Reset the forge to initial state
  const resetForge = useCallback(() => {
    // Reset store forge state
    resetForgeAction();
    // Reset component UI state
    setConnections([]);
    setIsForgeComplete(false);
    setCharacterStats({ totalPower:0, attack:0, defense:0, speed:0, magic:0, specialAbilities:[] });
    setEffects([]);
    addTempMessage('Forge reset', 'info');
  }, [resetForgeAction, addTempMessage]);
  
  // Clean up any active effects after they have played
  useEffect(() => {
    if (effects.length > 0) {
      const timer = setTimeout(() => {
        setEffects([]);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [effects]);
  
  // Synchronize connections and stats whenever placedCards change
  useEffect(() => {
    validateConnections(placedCards);
    updateCharacterStats(placedCards);
  }, [placedCards, validateConnections, updateCharacterStats]);

  // Handle focusing a socket for keyboard navigation
  const handleFocusSocket = useCallback((index: number | null) => {
    setFocusedSocket(index);
  }, []);
  
  // Render connection lines between sockets
  const renderConnectionLines = useCallback(() => {
    return connections.map((connection, index) => (
      <ConnectionLine
        key={`connection-${index}`}
        startPos={socketPositions[connection.sourceIndex]}
        endPos={socketPositions[connection.targetIndex]}
        isValid={connection.isValid}
        startEdgeType={connection.sourceEdge as EdgeIcon}
        endEdgeType={connection.targetEdge as EdgeIcon}
      />
    ));
  }, [connections, socketPositions]);
  
  // Determine root classes including accessibility mode
  const rootClasses = [
    styles.forgeContainer,
    accessibilityMode ? styles.accessibilityMode : ''
  ].filter(Boolean).join(' ');
  
  // Render the component
  return (
    <div className={rootClasses} role="region" aria-label="Hex Card Forge" ref={forgeContainerRef}>
      <DndProvider backend={HTML5Backend}>
        <div className={styles.forgeArea}>
          {/* Render the forge sockets in a hexagonal pattern */}
          <div className={styles.forgeSocketsContainer}>
            {Array(6).fill(null).map((_, index) => (
              <ForgeSocket
                key={`socket-${index}`}
                index={index}
                position={socketPositions[index]}
                card={placedCards[index]}
                isFocused={focusedSocket === index}
                onCardPlaced={(cardId) => {
                  const card = availableCards.find(c => c.id === cardId);
                  if (card) handleCardPlaced(card, index);
                }}
                onCardRemoved={() => handleCardRemoval(index)}
                isHighlighted={connections.some(conn => 
                  (conn.sourceIndex === index || conn.targetIndex === index) && conn.isValid
                )}
              />
            ))}
          </div>

          {/* Connection lines between sockets */}
          {renderConnectionLines()}

          {/* Visual particles for effects */}
          {enableEffects && effects.filter((e: EffectState) => e.isActive).map((effect, index) => (
            <ForgeParticles
              key={`particles-${index}`}
              isActive={effect.isActive}
              sourcePosition={effect.sourcePosition ? effect.sourcePosition : undefined}
              targetPosition={effect.targetPosition ? effect.targetPosition : undefined}
              particleType={effect.particleType}
              particleCount={config.particleCount}
            />
          ))}

          {/* Center forge star element */}
          <div className={styles.forgeCenter}>
            <div className={styles.forgeEye}></div>
          </div>

          {/* Temporary messages */}
          {tempMessage && (
            <div className={`${styles.tempMessage} ${styles[tempMessage.type]}`}>
              {tempMessage.text}
            </div>
          )}

          {/* Forge completion UI */}
          {isForgeComplete && (
            <ForgeResult
              placedCards={placedCards}
              isComplete={isForgeComplete}
              characterStats={characterStats}
            />
          )}
        </div>

        {/* Available cards section */}
        <div className={styles.availableCards}>
          {availableCards
            .filter(card => !usedCardIds.includes(card.id))
            .map((card, index) => (
              <CardPreview
                key={`card-${card.id}-${index}`}
                card={card}
                isSelected={selectedCardIndex === index}
                size={80}
              />
            ))}
        </div>

        {/* Action buttons */}
        <div className={styles.actionButtons}>
          <button 
            className={styles.forgeButton}
            onClick={handleCreateCharacter}
            disabled={!isForgeComplete}
          >
            Forge Character
          </button>
          
          <button 
            className={styles.resetButton}
            onClick={resetForge}
          >
            Reset Forge
          </button>

          <button 
            className={styles.configButton}
            onClick={() => {
              // Open config dialog logic here
            }}
          >
            Settings
          </button>
        </div>

        {/* Configuration manager */}
        <ForgeConfigurationManager
          configuration={config}
          onConfigChange={setConfig}
        />
      </DndProvider>
    </div>
  );
};

export default HexForge;
