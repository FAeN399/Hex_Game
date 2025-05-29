import * as React from 'react';
import { FC, useEffect, useState, useRef, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  HexForgeProps, 
  CharacterStats,
  ForgeState,
  ConnectionLineProps,
  ForgeSocketProps,
  CardPreviewProps,
  ForgeResultProps
} from './types';
// @ts-ignore - Schema module exists but TS can't find declaration
import { HexCard, Character, EdgeIcon } from '@hexcard/schema';
import ForgeSocket from './ForgeSocket';
import CardPreview from './CardPreview';
import ConnectionLine from './ConnectionLine';
import ForgeResult from './ForgeResult';
import ForgeParticles from './ForgeParticles';
import ForgeConfigurationManager from './ForgeConfigurationManager';
import { useForgeStore } from './useForgeLogic';
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
  
  // Aggregate stats from cards
  filledCards.forEach(card => {
    stats.attack += card.stats?.attack || 0;
    stats.defense += card.stats?.defense || 0;
    stats.speed += card.stats?.speed || 0;
    stats.magic += card.stats?.magic || 0;
    
    // Add unique abilities
    if (card.abilities) {
      card.abilities.forEach(ability => {
        if (!stats.specialAbilities.includes(ability)) {
          stats.specialAbilities.push(ability);
        }
      });
    }
  });
  
  // Calculate total power
  stats.totalPower = stats.attack + stats.defense + stats.speed + stats.magic;
  
  return stats;
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
  
  // State for the forge
  const [placedCards, setPlacedCards] = useState<(HexCard | null)[]>(Array(6).fill(null));
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
  
  // Visual effects states
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
  
  // Get socket positions using the custom hook
  const socketPositions = useSocketPositions(6, config.socketSize);
  
  // Initialize socket refs
  useEffect(() => {
    socketRefs.current = socketRefs.current.slice(0, 6);
  }, []);
  
  // Calculate connections whenever cards are placed
  useEffect(() => {
    const newConnections: Connection[] = [];
    
    // Check for valid connections between adjacent sockets
    for (let i = 0; i < placedCards.length; i++) {
      for (let j = i + 1; j < placedCards.length; j++) {
        // Skip if either socket is empty
        if (!placedCards[i] || !placedCards[j]) continue;
        
        // Check if these sockets are adjacent (simplified)
        const isAdjacent = Math.abs(i - j) === 1 || 
                         (i === 0 && j === 5) || 
                         (i === 5 && j === 0);
        
        if (isAdjacent) {
          const isValid = isValidConnection(placedCards[i], placedCards[j]);
          newConnections.push({
            sourceIndex: i,
            targetIndex: j,
            isValid
          });
          
          // Create visual effects for connections if enabled
          if (enableEffects && isValid) {
            triggerConnectionEffect(i, j);
          }
        }
      }
    }
    
    setConnections(newConnections);
    
    // Check if forge is complete (all sockets filled and all connections valid)
    const allSocketsFilled = placedCards.every(card => card !== null);
    const allConnectionsValid = newConnections.every(conn => conn.isValid);
    
    if (allSocketsFilled && allConnectionsValid && newConnections.length >= 5) {
      const stats = calculateCharacterStats(placedCards);
      setCharacterStats(stats);
      setIsForgeComplete(true);
      
      // Trigger success effects
      if (enableEffects) {
        triggerForgeSuccessEffect();
      }
      
      // Notify parent component
      if (onForgeComplete) {
        const character: Character = {
          id: `forge-${Date.now()}`,
          name: generateCharacterName(placedCards),
          cards: placedCards.filter((card): card is HexCard => card !== null),
          stats
        };
        onForgeComplete(character);
      }
      
      showTemporaryMessage('Character forged successfully!', 'success');
    }
  }, [placedCards, enableEffects, onForgeComplete]);
  
  // Handle temporary messages
  useEffect(() => {
    if (tempMessage) {
      const { duration } = tempMessage;
      const timeout = setTimeout(() => {
        setTempMessage(null);
      }, duration);
      
      return () => clearTimeout(timeout);
    }
  }, [tempMessage]);
  
  // Clear effects after they play
  useEffect(() => {
    effects.forEach((effect, index) => {
      if (effect.isActive) {
        setTimeout(() => {
          setEffects(prev => {
            const newEffects = [...prev];
            if (newEffects[index]) {
              newEffects[index] = { ...newEffects[index], isActive: false };
            }
            return newEffects;
          });
        }, 1000 * config.animationSpeed);
      }
    });
  }, [effects, config.animationSpeed]);
  
  // Handle placing a card in a socket
  const handleCardPlaced = useCallback((card: HexCard, socketIndex: number) => {
    if (socketIndex < 0 || socketIndex >= 6) return false;
    
    // Check if socket is already occupied
    if (placedCards[socketIndex] !== null) {
      showTemporaryMessage('Socket already contains a card', 'error');
      return false;
    }
    
    // Place the card
    const newPlacedCards = [...placedCards];
    newPlacedCards[socketIndex] = card;
    setPlacedCards(newPlacedCards);
    
    // Trigger placement effect
    if (enableEffects) {
      triggerPlacementEffect(socketIndex);
    }
    
    showTemporaryMessage(`Card placed in socket ${socketIndex + 1}`, 'info');
    return true;
  }, [placedCards, enableEffects]);
  
  // Handle removing a card from a socket
  const handleCardRemoved = useCallback((socketIndex: number) => {
    if (socketIndex < 0 || socketIndex >= 6) return;
    
    // Remove the card
    const newPlacedCards = [...placedCards];
    newPlacedCards[socketIndex] = null;
    setPlacedCards(newPlacedCards);
    
    // Reset forge completion status
    setIsForgeComplete(false);
    
    showTemporaryMessage(`Card removed from socket ${socketIndex + 1}`, 'info');
  }, [placedCards]);
  
  // Handle card selection for keyboard navigation
  const handleCardSelected = useCallback((index: number) => {
    setSelectedCardIndex(index);
  }, []);
  
  // Handle socket focus for keyboard navigation
  const handleSocketFocus = useCallback((socketIndex: number) => {
    // Implement keyboard navigation focus logic
  }, []);
  
  // Apply configuration changes
  const handleConfigChange = useCallback((newConfig: ConfigurationData) => {
    setConfig(newConfig);
  }, []);
  
  // Helper to show temporary messages
  const showTemporaryMessage = (text: string, type: 'info' | 'error' | 'success') => {
    setTempMessage({
      text,
      type,
      duration: 3000,
      timestamp: Date.now(),
      timeout: undefined
    });
  };
  
  // Effect triggers
  const triggerPlacementEffect = (socketIndex: number) => {
    if (!enableEffects) return;
    
    const position = socketPositions[socketIndex];
    setEffects(prev => [
      ...prev,
      {
        isActive: true,
        sourcePosition: null,
        targetPosition: position,
        particleType: 'placement'
      }
    ]);
  };
  
  const triggerConnectionEffect = (sourceIndex: number, targetIndex: number) => {
    if (!enableEffects) return;
    
    const sourcePosition = socketPositions[sourceIndex];
    const targetPosition = socketPositions[targetIndex];
    
    setEffects(prev => [
      ...prev,
      {
        isActive: true,
        sourcePosition,
        targetPosition,
        particleType: 'connection'
      }
    ]);
  };
  
  const triggerForgeSuccessEffect = () => {
    if (!enableEffects) return;
    
    // Center position for the forge effect
    const centerX = socketPositions.reduce((sum, pos) => sum + pos.x, 0) / 6;
    const centerY = socketPositions.reduce((sum, pos) => sum + pos.y, 0) / 6;
    const centerPosition: Position = { x: centerX, y: centerY };
    
    setEffects(prev => [
      ...prev,
      {
        isActive: true,
        sourcePosition: centerPosition,
        targetPosition: null,
        particleType: 'success'
      },
      {
        isActive: true,
        sourcePosition: centerPosition,
        targetPosition: null,
        particleType: 'forge'
      }
    ]);
  };
  
  // Reset the forge
  const handleReset = () => {
    setPlacedCards(Array(6).fill(null));
    setSelectedCardIndex(null);
    setConnections([]);
    setIsForgeComplete(false);
    setEffects([]);
    setCharacterStats({
      totalPower: 0,
      attack: 0,
      defense: 0,
      speed: 0,
      magic: 0,
      specialAbilities: []
    });
    
    showTemporaryMessage('Forge reset', 'info');
  };
  
  // Render the component
  return (
    <div className={styles.hexForgeContainer} role="region" aria-label="Hex Card Forge" ref={forgeContainerRef}>
      <DndProvider backend={HTML5Backend}>
        <div className={styles.forgeArea}>
          {/* Render the forge sockets in a hexagonal pattern */}
          <div className={styles.socketsContainer}>
            {Array(6).fill(null).map((_, index) => (
              <ForgeSocket
                key={`socket-${index}`}
                index={index}
                card={placedCards[index]}
                ref={(el: HTMLDivElement | null) => { socketRefs.current[index] = el; }}
                onCardPlaced={(cardId) => {
                  const card = availableCards.find(c => c.id === cardId);
                  if (card) handleCardPlaced(card, index);
                }}
                onCardRemoved={() => handleCardRemoved(index)}
                isHighlighted={connections.some(
                  conn => (conn.sourceIndex === index || conn.targetIndex === index) && conn.isValid
                )}
              />
            ))}
            
            {/* Connection lines */}
            {connections.map((conn, index) => {
              const sourcePos = socketPositions[conn.sourceIndex];
              const targetPos = socketPositions[conn.targetIndex];
              return (
                <ConnectionLine
                  key={`conn-${index}`}
                  startPos={sourcePos}
                  endPos={targetPos}
                  isValid={conn.isValid}
                  startEdgeType={placedCards[conn.sourceIndex]?.edges?.[0] || 'default'}
                  endEdgeType={placedCards[conn.targetIndex]?.edges?.[0] || 'default'}
                />
              );
            })}
            
            {/* Particle effects */}
            {effects.filter((e: EffectState) => e.isActive).map((effect, index) => (
              <ForgeParticles
                key={`effect-${index}`}
                isActive={effect.isActive}
                sourcePosition={effect.sourcePosition ? effect.sourcePosition : undefined}
                targetPosition={effect.targetPosition ? effect.targetPosition : undefined}
                particleType={effect.particleType}
                particleCount={config.particleCount}
              />
            ))}
          </div>
          
          {/* Available cards */}
          <div className={styles.availableCards}>
            <h3>Available Cards</h3>
            <div className={styles.cardsList}>
              {availableCards.map((card, index) => (
                <CardPreview
                  key={`card-${card.id}`}
                  card={card}
                  isSelected={selectedCardIndex === index}
                  isDragging={false}
                  size={60}
                />
              ))}
            </div>
          </div>
          
          {/* Result display */}
          {isForgeComplete && (
            <ForgeResult
              placedCards={placedCards}
              isComplete={isForgeComplete}
              characterStats={characterStats}
            />
          )}
          
          {/* Controls */}
          <div className={styles.controls}>
            <button 
              className={styles.resetButton} 
              onClick={handleReset}
              aria-label="Reset Forge"
            >
              Reset Forge
            </button>
            
            <ForgeConfigurationManager
              config={config}
              onConfigChange={handleConfigChange}
            />
          </div>
          
          {/* Temporary message */}
          {tempMessage && (
            <div className={`${styles.message} ${styles[tempMessage.type]}`}>
              {tempMessage.text}
            </div>
          )}
        </div>
      </DndProvider>
    </div>
  );
};

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
              character={{
                name: "Forged Character",
                stats: characterStats,
                cards: placedCards.filter((card): card is HexCard => card !== null)
              }}
              onClose={() => setIsForgeComplete(false)}
            />
          )}
        </div>

        {/* Available cards section */}
        <div className={styles.availableCards}>
          {availableCards.map((card, index) => (
            <CardPreview
              key={`card-${card.id}-${index}`}
              card={card}
              index={index}
              isSelected={selectedCardIndex === index}
              onSelect={() => setSelectedCardIndex(index)}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div className={styles.actionButtons}>
          <button 
            className={styles.forgeButton}
            onClick={handleCreateCharacter}
            disabled={placedCards.filter(Boolean).length < 6}
          >
            Forge Character
          </button>
          
          <button 
            className={styles.resetButton}
            onClick={() => {
              setPlacedCards(Array(6).fill(null));
              setConnections([]);
              setIsForgeComplete(false);
            }}
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
