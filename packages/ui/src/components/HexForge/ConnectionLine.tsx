import React, { FC, useEffect, useState, useRef } from 'react';
import { ConnectionLineProps } from './types';
import styles from './styles.module.css';
import { isValidConnection } from './useForgeLogic';

/**
 * Visual connection line between card sockets with enhanced feedback
 * Shows different visual styles based on connection validity
 */
const ConnectionLine: FC<ConnectionLineProps> = ({
  startPos,
  endPos,
  isValid,
  startEdgeType,
  endEdgeType
}) => {
  // Track if connection status has changed for animation triggers
  const [wasValid, setWasValid] = useState<boolean | undefined>(undefined);
  const [activatingAnimation, setActivatingAnimation] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Detect changes in connection validity to trigger animations
  useEffect(() => {
    const calculatedValidity = typeof isValid !== 'undefined' ? 
      isValid : 
      isValidConnection(startEdgeType, endEdgeType);
    
    // If first render or status changed, trigger animation
    if (wasValid === undefined || calculatedValidity !== wasValid) {
      setActivatingAnimation(true);
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set timeout to remove animation class
      timeoutRef.current = setTimeout(() => {
        setActivatingAnimation(false);
      }, 800); // Match animation duration
    }
    
    setWasValid(calculatedValidity);
    
    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isValid, startEdgeType, endEdgeType, wasValid]);
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
  
  // Determine tooltip text for accessibility
  const tooltipText = connectionStatus === 'validConnection' ?
    `Valid connection: ${startEdgeType} connects to ${endEdgeType}` :
    `Invalid connection: ${startEdgeType} cannot connect to ${endEdgeType}`;

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
    activatingAnimation ? styles.connectionActivating : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={lineClasses}
      style={lineStyle}
      role="img"
      aria-label={tooltipText}
      title={tooltipText}
      data-connection={`${startEdgeType}-${endEdgeType}`}
      data-testid={`connection-line-${startEdgeType}-${endEdgeType}`}
      data-status={connectionStatus}
    />
  );
};

export default ConnectionLine;
