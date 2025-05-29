import React, { FC } from 'react';
import { EdgeIconType as EdgeIcon } from 'schema';
import styles from './styles.module.css';

interface EdgeTooltipProps {
  startEdge: EdgeIcon;
  endEdge: EdgeIcon;
  isVisible: boolean;
  position: { x: number; y: number };
  isValid: boolean;
}

/**
 * Provides visual tooltip explaining edge connection compatibility
 */
const EdgeTooltip: FC<EdgeTooltipProps> = ({
  startEdge,
  endEdge,
  isVisible,
  position,
  isValid
}) => {
  // Don't render if not visible
  if (!isVisible) return null;
  
  // Get explanatory text based on connection validity and types
  const tooltipText = getConnectionExplanation(startEdge, endEdge, isValid);
  
  return (
    <div 
      className={`${styles.edgeTooltip} ${isValid ? styles.validTooltip : styles.invalidTooltip}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      <div className={styles.tooltipContent}>
        <div className={styles.edgeIcons}>
          <span className={`${styles.edgeIcon} ${styles[startEdge]}`}>{getEdgeSymbol(startEdge)}</span>
          <span className={styles.connectionSymbol}>{isValid ? '✓' : '✗'}</span>
          <span className={`${styles.edgeIcon} ${styles[endEdge]}`}>{getEdgeSymbol(endEdge)}</span>
        </div>
        <div className={styles.tooltipText}>
          {tooltipText}
        </div>
      </div>
    </div>
  );
};

/**
 * Get a symbol representation for each edge type
 */
const getEdgeSymbol = (edge: EdgeIcon): string => {
  switch (edge) {
    case 'attack': return '⚔️';
    case 'defense': return '🛡️';
    case 'element': return '✨';
    case 'skill': return '📚';
    case 'resource': return '💎';
    case 'link': return '🔗';
    default: return '?';
  }
};

/**
 * Generate explanation text for the connection
 */
const getConnectionExplanation = (
  startEdge: EdgeIcon,
  endEdge: EdgeIcon,
  isValid: boolean
): string => {
  if (isValid) {
    // Same types always connect
    if (startEdge === endEdge) {
      return `Perfect match: ${startEdge} connects to ${endEdge} for a 20% power bonus!`;
    }
    
    // Link connects to anything
    if (startEdge === 'link' || endEdge === 'link') {
      return 'Link edges can connect to any other edge type';
    }
    
    // Special combinations
    if ((startEdge === 'attack' && endEdge === 'defense') || 
        (startEdge === 'defense' && endEdge === 'attack')) {
      return 'Balance: Attack and Defense create a powerful tactical combination';
    }
    
    if ((startEdge === 'element' && endEdge === 'skill') ||
        (startEdge === 'skill' && endEdge === 'element')) {
      return 'Synergy: Elements empower Skills for enhanced magical effects';
    }
    
    // Default valid connection
    return `Compatible: ${startEdge} and ${endEdge} can connect`;
  } else {
    // Invalid connection
    return `Incompatible: ${startEdge} cannot connect to ${endEdge}`;
  }
};

export default EdgeTooltip;
