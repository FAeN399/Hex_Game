import React, { FC, useEffect, useState, useRef, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { HexForgeProps } from './types';
import ForgeSocket from './ForgeSocket';
import CardPreview from './CardPreview';
import ConnectionLine from './ConnectionLine';
import ForgeResult from './ForgeResult';
import ForgeParticles from './ForgeParticles';
import ForgeConfigurationManager from './ForgeConfigurationManager';
import { useForgeStore, useSocketPositions, useKeyboardNavigation } from './useForgeLogic';
import styles from './styles.module.css';

/**
 * The main HexForge component that allows players to combine six hex cards
 * to create a character with unique stats and abilities.
 */
const HexForge: FC<HexForgeProps> = ({
  availableCards,
  onForgeComplete,
  enableEffects = true,
  accessibilityMode = false
}) => {
  // Track connection visual effects
  // Status message for user feedback
  const [tempMessage, setTempMessage] = useState<string>('');
  
  // Track connection visual effects
  const [activeEffects, setActiveEffects] = useState<{
    connection: { index: number, isActive: boolean } | null;
    placement: { index: number, isActive: boolean } | null;
    forge: boolean;
  }>({ 
    connection: null,
    placement: null,
    forge: false 
  });
  
  // Refs for position tracking
  const socketRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null, null, null]);
  // Get forge state from store
  const {
    placedCards,
    focusedSocketIndex,
    selectedCardIndex,
    placeCard,
    removeCard,
    setFocusedSocket,
    setSelectedCard,
    getCurrentStats,
    isValidArrangement,
    resetForge
  } = useForgeStore();
  
  // Calculate socket positions in hexagonal arrangement
  const socketPositions = useSocketPositions();
  
  // Set up keyboard navigation
  const { handleKeyDown } = useKeyboardNavigation();
  
  // State to track which cards have been used
  const [usedCardIds, setUsedCardIds] = useState<Set<string>>(new Set());
  
  // Available cards that haven't been used yet
  const availableCardsFiltered = availableCards.filter(card => !usedCardIds.has(card.id));
  
  // Calculate character stats
  const characterStats = getCurrentStats();
  const isComplete = isValidArrangement();
  
  // Update used cards when placedCards change
  useEffect(() => {
    const newUsedCardIds = new Set<string>();
    
    placedCards.forEach(card => {
      if (card) {
        newUsedCardIds.add(card.id);
      }
    });
    
    setUsedCardIds(newUsedCardIds);
  }, [placedCards]);
  
  // Handle card placed in socket
  const handleCardPlaced = (cardId: string, socketIndex: number) => {
    const card = availableCards.find(c => c.id === cardId);
    if (card) {
      placeCard(card, socketIndex);
      
      // Trigger placement particle effect if enabled
      if (enableEffects) {
        setActiveEffects(prev => ({
          ...prev,
          placement: { index: socketIndex, isActive: true }
        }));
        
        // Reset after animation
        setTimeout(() => {
          setActiveEffects(prev => ({
            ...prev,
            placement: null
          }));
          
          // Check if this creates valid connections
          checkForValidConnections(socketIndex);
        }, 800);
      }
    }
  };
  
  const handleFocusSocket = useCallback((index: number | null) => {
    setFocusedSocket(index);
  }, [setFocusedSocket]);
  
  // Check for valid connections when a card is placed
  const checkForValidConnections = (socketIndex: number) => {
    if (!enableEffects) return;
    
    const prevIndex = socketIndex === 0 ? 5 : socketIndex - 1;
    const nextIndex = (socketIndex + 1) % 6;
    
    const currentCard = placedCards[socketIndex];
    const prevCard = placedCards[prevIndex];
    const nextCard = placedCards[nextIndex];
    
    // Check previous connection
    if (currentCard && prevCard) {
      const prevEdge = prevCard.edges[(prevIndex + 3) % 6]; // Opposite edge
      const currentEdge = currentCard.edges[prevIndex];
      
      if (isValidConnection(prevEdge, currentEdge)) {
        // Show connection effect
        setActiveEffects(prev => ({
          ...prev,
          connection: { index: prevIndex, isActive: true }
        }));
        
        setTimeout(() => {
          setActiveEffects(prev => ({
            ...prev,
            connection: null
          }));
        }, 1000);
      }
    }
    
    // Check next connection
    if (currentCard && nextCard) {
      const currentEdge = currentCard.edges[(socketIndex + 3) % 6]; // Opposite edge
      const nextEdge = nextCard.edges[socketIndex];
      
      if (isValidConnection(currentEdge, nextEdge)) {
        // Show connection effect
        setActiveEffects(prev => ({
          ...prev,
          connection: { index: socketIndex, isActive: true }
        }));
        
        setTimeout(() => {
          setActiveEffects(prev => ({
            ...prev,
            connection: null
          }));
        }, 1000);
      }
    }
  };
  
  // Handle character creation
  const handleCreateCharacter = () => {
    if (isComplete && onForgeComplete) {
      // Activate forge effect
      if (enableEffects) {
        setActiveEffects(prev => ({ ...prev, forge: true }));
      }
      
      // Generate a character name based on the cards
      const characterName = generateCharacterName(placedCards);
      
      // Create character object
      const character = {
        id: `char-${Date.now()}`,
        name: characterName,
        totalPower: characterStats.totalPower,
        stats: characterStats,
        cardIds: placedCards.map(card => card!.id) // Non-null assertion (we checked isComplete)
      };
      
      // Add a delay for the forge effect to show
      setTimeout(() => {
        // Call the callback
        onForgeComplete(character);
        
        // Reset effects and forge
        setActiveEffects({ connection: null, placement: null, forge: false });
        resetForge();
      }, enableEffects ? 2000 : 0);
    }
  };
  
  // Generate particles for effects
  const renderParticles = () => {
    if (!enableEffects) return null;
    
    return (
      <div className={styles.particleContainer}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className={styles.particle}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${2 + Math.random() * 3}s`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    );
  };
  
  // Render connection lines between sockets
  const renderConnectionLines = () => {
    return socketPositions.map((startPos, i) => {
      const endPos = socketPositions[(i + 1) % 6];
      const startCard = placedCards[i];
      const endCard = placedCards[(i + 1) % 6];
      
      // If both sockets have cards, use their edge types
      let startEdgeType = startCard ? startCard.edges[(i + 3) % 6] : 'link'; // Default to link if no card
      let endEdgeType = endCard ? endCard.edges[i] : 'link'; // Default to link if no card
      
      return (
        <ConnectionLine
          key={`connection-${i}`}
          startPos={startPos}
          endPos={endPos}
          startEdgeType={startEdgeType}
          endEdgeType={endEdgeType}
          isValid={!!(startCard && endCard)} // Only show as valid if both cards exist
        />
      );
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div 
        className={`${styles.forgeContainer} ${accessibilityMode ? styles.accessibilityMode : ''}`}
        tabIndex={0}
        onKeyDown={(e) => handleKeyDown(e, availableCardsFiltered)}
        role="application"
        aria-label="Hex Card Forge"
            
            {/* Central forge area */}
            <div 
              className={`${styles.forgeCenter} ${isComplete ? styles.forgeActive : ''} ${activeEffects.forge ? styles.forgeSuccess : ''}`}
              ref={el => socketRefs.current[6] = el}
            >
              {isComplete && (
                <button 
                  className={`${styles.forgeButton} ${activeEffects.forge ? styles.forging : ''}`} 
                  onClick={handleCreateCharacter}
                  aria-label="Create character from forged cards"
                  disabled={activeEffects.forge}
                >
                  Forge
                </button>
              )}
            </div>
            
            {/* Particle Effects */}
            {enableEffects && !accessibilityMode && (
              <>
                {/* Connection particles */}
                {activeEffects.connection && (
                  <ForgeParticles 
                    isActive={true}
                    particleType="connection"
                    particleCount={30}
                    sourcePosition={{ x: 50, y: 50 }}
                  />
                )}
                
                {/* Placement particles */}
                {activeEffects.placement && (
                  <ForgeParticles
                    isActive={true}
                    particleType="placement"
                    particleCount={15}
                  />
                )}
                
                {/* Forge completion particles */}
                {activeEffects.forge && (
                  <ForgeParticles
                    isActive={true}
                    particleType="forge"
                    particleCount={60}
                  />
                )}
              </>
            )}
          </div>
          
          {/* Card Inventory */}
          <div className={styles.cardInventory}>
            {availableCardsFiltered.map((card, index) => (
              <CardPreview
                key={card.id}
                card={card}
                isSelected={selectedCardIndex === index}
                size={100}
              />
            ))}
          </div>
          
          {/* Stats panel */}
          <ForgeResult
            placedCards={placedCards}
            isComplete={isComplete}
            characterStats={characterStats}
          />
          
          {/* Effect particles */}
          {enableEffects && renderParticles()}
        </div>
      </ForgeResult>
      
      {/* Save/Load Configuration Manager */}
      <ForgeConfigurationManager 
        onConfigLoaded={() => {
          // Show success message when config is loaded
          setTempMessage('Configuration loaded successfully!');
          setTimeout(() => setTempMessage(''), 3000);
        }}
        onError={(error: string) => {
          // Show error message
          setTempMessage(`Error: ${error}`);
          setTimeout(() => setTempMessage(''), 5000);
        }}
      />
      
      {/* Temporary success/error message */}
      {tempMessage && (
        <div className={styles.messageOverlay}>
          <div className={styles.message}>{tempMessage}</div>
        </div>
      )}
    </DndProvider>
  );
};

/**
 * Helper function to generate a character name based on the cards used
 */
const generateCharacterName = (cards: Array<any>): string => {
  // Get card types to determine title
  const types = cards.map(card => card?.type || '').filter(Boolean);
  const typeCount: Record<string, number> = {};
  types.forEach(type => {
    typeCount[type] = (typeCount[type] || 0) + 1;
  });
  
  // Default name parts
  let prefix = '';
  let title = 'Forged One';
  
  // Generate prefix based on strongest card type
  const dominantType = Object.entries(typeCount).reduce(
    (max, [type, count]) => count > max[1] ? [type, count] : max, 
    ['', 0]
  )[0];
  
  switch (dominantType) {
    case 'hero':
      prefix = ['Legendary', 'Heroic', 'Valiant'][Math.floor(Math.random() * 3)];
      title = ['Champion', 'Defender', 'Warden'][Math.floor(Math.random() * 3)];
      break;
    case 'unit':
      prefix = ['Battle', 'War', 'Tactical'][Math.floor(Math.random() * 3)];
      title = ['Warrior', 'Fighter', 'Soldier'][Math.floor(Math.random() * 3)];
      break;
    case 'spell':
      prefix = ['Arcane', 'Mystic', 'Ethereal'][Math.floor(Math.random() * 3)];
      title = ['Mage', 'Spellweaver', 'Conjurer'][Math.floor(Math.random() * 3)];
      break;
    case 'structure':
      prefix = ['Fortified', 'Stalwart', 'Unyielding'][Math.floor(Math.random() * 3)];
      title = ['Guardian', 'Sentinel', 'Bulwark'][Math.floor(Math.random() * 3)];
      break;
    case 'relic':
      prefix = ['Ancient', 'Enchanted', 'Mystical'][Math.floor(Math.random() * 3)];
      title = ['Keeper', 'Wielder', 'Channeler'][Math.floor(Math.random() * 3)];
      break;
  }
  
  return `${prefix} ${title}`;
};

export default HexForge;
