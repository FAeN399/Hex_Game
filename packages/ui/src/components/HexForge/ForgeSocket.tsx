import React, { FC } from 'react';
import { useDrop } from 'react-dnd';
import { ForgeSocketProps } from './types';
import styles from './styles.module.css';

/**
 * A socket in the forge that can accept a hexagonal card
 */
const ForgeSocket: FC<ForgeSocketProps> = ({
  index,
  position,
  card,
  isFocused,
  isHighlighted,
  onCardPlaced,
  onCardRemoved
}) => {
  // Set up drag-and-drop functionality
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'hexcard',
    drop: (item: { id: string }) => {
      onCardPlaced(item.id);
      return { socketIndex: index };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
    // Can only drop if socket is empty
    canDrop: () => !card
  });
  
  // Combine classes for styling
  const socketClasses = [
    styles.forgeSocket,
    isFocused ? styles.focused : '',
    isHighlighted ? styles.highlighted : '',
    card ? styles.hasCard : styles.empty,
    isOver && canDrop ? styles.dropTarget : ''
  ].filter(Boolean).join(' ');
  
  // Calculate socket position
  const socketStyle = {
    transform: `translate(${position.x}px, ${position.y}px)`,
  };

  // Handle click to remove card
  const handleClick = () => {
    if (card) {
      onCardRemoved();
    }
  };

  return (
    <div
      ref={drop}
      className={socketClasses}
      style={socketStyle}
      onClick={handleClick}
      tabIndex={0}
      role="button"
      aria-label={`Forge socket ${index + 1}${card ? ' with ' + card.name : ' empty'}`}
      data-testid={`forge-socket-${index}`}
      data-socket-index={index}
    >
      {/* If a card is in this socket, show card content */}
      {card && (
        <div className={styles.hexCardInSocket}>
          <div className={styles.hexCardName}>{card.name}</div>
          <div className={styles.hexCardType}>{card.type}</div>
          <div className={styles.edgeIcons}>
            {card.edges.map((edge, i) => (
              <div key={i} className={styles.edgeIcon} data-edge-type={edge}>
                {getEdgeIcon(edge)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual indicator for empty socket */}
      {!card && (
        <div className={styles.emptySocketIndicator}>
          {isOver && canDrop ? '+' : index + 1}
        </div>
      )}
    </div>
  );
};

/**
 * Helper function to get icon for edge type
 */
const getEdgeIcon = (edge: string): string => {
  switch (edge) {
    case 'attack': return '⚔️';
    case 'defense': return '🛡️';
    case 'element': return '✨';
    case 'skill': return '⚡';
    case 'resource': return '💎';
    case 'link': return '🔗';
    default: return '?';
  }
};

export default ForgeSocket;
