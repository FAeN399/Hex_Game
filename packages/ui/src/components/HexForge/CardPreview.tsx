import React, { FC } from 'react';
import { useDrag } from 'react-dnd';
import { CardPreviewProps } from './types';
import styles from './styles.module.css';

/**
 * Preview component for a draggable hex card
 */
const CardPreview: FC<CardPreviewProps> = ({
  card,
  isDragging: externalIsDragging,
  isSelected,
  size = 120
}) => {
  // Set up drag-and-drop functionality
  const [{ isDragging }, drag] = useDrag({
    type: 'hexcard',
    item: { id: card.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });
  
  // Use externally provided isDragging if available
  const actualIsDragging = typeof externalIsDragging !== 'undefined' ? externalIsDragging : isDragging;
  
  // Combine classes for styling
  const cardClasses = [
    styles.hexCard,
    actualIsDragging ? styles.dragging : '',
    isSelected ? styles.selected : ''
  ].filter(Boolean).join(' ');
  
  // Style with provided size
  const cardStyle = {
    width: `${size}px`,
    height: `${size * 1.1547}px`,
  };
  
  // Map rarity to visual indicators
  const getRarityStyle = () => {
    switch(card.rarity) {
      case 'rare':
        return { border: '2px solid var(--forge-gilded-brass)', boxShadow: '0 0 10px var(--forge-gilded-brass)' };
      case 'uncommon':
        return { border: '2px solid var(--forge-ether-cyan)', boxShadow: '0 0 5px var(--forge-ether-cyan)' };
      case 'common':
      default:
        return {};
    }
  };

  return (
    <div
      ref={drag}
      className={cardClasses}
      style={{ ...cardStyle, ...getRarityStyle() }}
      tabIndex={0}
      aria-label={`${card.name}, ${card.type} card, ${card.rarity}`}
      data-testid={`card-preview-${card.id}`}
    >
      <div className={styles.hexCardName}>{card.name}</div>
      <div className={styles.hexCardType}>{card.type}</div>
      
      {/* Edge icons around the hexagon */}
      <div className={styles.edgeIcons}>
        {card.edges.map((edge, i) => (
          <div key={i} className={styles.edgeIcon} data-edge-type={edge}>
            {getEdgeIcon(edge)}
          </div>
        ))}
      </div>
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

export default CardPreview;
