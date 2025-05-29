import React, { FC } from 'react';
import { ConnectionLineProps } from './types';
import styles from './styles.module.css';
import { isValidConnection } from './useForgeLogic';

/**
 * Visual connection line between card sockets
 */
const ConnectionLine: FC<ConnectionLineProps> = ({
  startPos,
  endPos,
  isValid,
  startEdgeType,
  endEdgeType
}) => {
  // Calculate the length and angle of the line
  const dx = endPos.x - startPos.x;
  const dy = endPos.y - startPos.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  
  // Calculate the status of connection based on edge types
  const connectionStatus = React.useMemo(() => {
    // If explicitly provided, use it
    if (typeof isValid !== 'undefined') {
      return isValid ? 'validConnection' : 'invalidConnection';
    }
    
    // Otherwise calculate based on edge types
    return isValidConnection(startEdgeType, endEdgeType) ? 'validConnection' : 'invalidConnection';
  }, [isValid, startEdgeType, endEdgeType]);

  // Define line style with calculated position, length, and rotation
  const lineStyle = {
    left: `${startPos.x}px`,
    top: `${startPos.y}px`,
    width: `${length}px`,
    transform: `rotate(${angle}deg)`,
  };

  // Combine classes for styling
  const lineClasses = [
    styles.connectionLine,
    styles[connectionStatus],
  ].filter(Boolean).join(' ');

  return (
    <div
      className={lineClasses}
      style={lineStyle}
      role="presentation"
      data-connection={`${startEdgeType}-${endEdgeType}`}
      data-testid={`connection-line-${startEdgeType}-${endEdgeType}`}
    />
  );
};

export default ConnectionLine;
