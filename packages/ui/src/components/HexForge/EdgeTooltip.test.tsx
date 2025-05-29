import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EdgeTooltip from './EdgeTooltip';
import { EdgeIcon } from '@hexcard/schema';

describe('EdgeTooltip', () => {
  const defaultProps = {
    startEdge: 'attack' as EdgeIcon,
    endEdge: 'defense' as EdgeIcon,
    isVisible: true,
    position: { x: 100, y: 100 },
    isValid: true
  };

  it('renders correctly when visible', () => {
    render(<EdgeTooltip {...defaultProps} />);
    
    // Should contain the edge symbols
    expect(screen.getByText('⚔️')).toBeInTheDocument();
    expect(screen.getByText('🛡️')).toBeInTheDocument();
    
    // Should contain connection symbol
    expect(screen.getByText('✓')).toBeInTheDocument();
  });
  
  it('does not render when not visible', () => {
    const { container } = render(<EdgeTooltip {...defaultProps} isVisible={false} />);
    
    // Container should be empty
    expect(container.firstChild).toBeNull();
  });
  
  it('displays invalid connection properly', () => {
    render(<EdgeTooltip {...defaultProps} isValid={false} />);
    
    // Should contain X symbol for invalid connection
    expect(screen.getByText('✗')).toBeInTheDocument();
    
    // Should contain text about incompatibility
    const tooltipText = screen.getByText(/incompatible/i);
    expect(tooltipText).toBeInTheDocument();
  });
  
  it('displays different explanation for same-type connections', () => {
    render(
      <EdgeTooltip 
        {...defaultProps} 
        startEdge="element" 
        endEdge="element"
      />
    );
    
    // Should mention perfect match for same types
    const tooltipText = screen.getByText(/perfect match/i);
    expect(tooltipText).toBeInTheDocument();
    expect(tooltipText).toHaveTextContent(/20% power bonus/i);
  });
  
  it('displays special message for link connections', () => {
    render(
      <EdgeTooltip 
        {...defaultProps} 
        startEdge="link" 
        endEdge="attack"
      />
    );
    
    // Should mention link connecting to anything
    const tooltipText = screen.getByText(/link edges can connect/i);
    expect(tooltipText).toBeInTheDocument();
  });
  
  it('positions tooltip correctly', () => {
    const position = { x: 250, y: 300 };
    const { container } = render(<EdgeTooltip {...defaultProps} position={position} />);
    
    // Should have style with position
    const tooltip = container.firstChild as HTMLElement;
    expect(tooltip.style.left).toBe(`${position.x}px`);
    expect(tooltip.style.top).toBe(`${position.y}px`);
  });
});
