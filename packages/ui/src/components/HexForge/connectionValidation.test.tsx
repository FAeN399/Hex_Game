import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { HexForge } from './index';
import { useForgeStore, isValidConnection } from './useForgeLogic';
import { HexCardType as HexCard } from 'schema';

// Mock react-dnd
vi.mock('react-dnd', () => ({
  DndProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useDrop: () => [{ isOver: false, canDrop: true }, vi.fn()],
  useDrag: () => [{ isDragging: false }, vi.fn(), vi.fn()],
}));

// Mock react-dnd-html5-backend
vi.mock('react-dnd-html5-backend', () => ({
  HTML5Backend: {},
}));

describe('Connection Validation with Visual Cues', () => {
  // Create sample cards for testing
  const createSampleCard = (id: string, type: string, edges: string[]): HexCard => ({
    id,
    name: `Test ${type}`,
    type: type as any,
    rarity: 'common',
    edges: edges as any,
    tags: []
  });

  // Create cards with specific edge patterns for testing connections
  const matchingEdgeCard1 = createSampleCard(
    'match1', 
    'unit', 
    ['attack', 'defense', 'element', 'skill', 'resource', 'link']
  );
  
  const matchingEdgeCard2 = createSampleCard(
    'match2', 
    'hero', 
    ['attack', 'defense', 'element', 'skill', 'resource', 'link']
  );
  
  const nonMatchingEdgeCard = createSampleCard(
    'nonmatch', 
    'spell', 
    ['resource', 'resource', 'resource', 'resource', 'resource', 'resource']
  );
  
  const linkEdgeCard = createSampleCard(
    'linkcard', 
    'relic', 
    ['link', 'link', 'link', 'link', 'link', 'link']
  );

  const mockForgeComplete = vi.fn();

  beforeEach(() => {
    // Reset the store before each test
    useForgeStore.getState().resetForge();
    mockForgeComplete.mockReset();
  });

  // Test base connection validation logic
  it('correctly identifies valid connections between edges', () => {
    // Same type connections
    expect(isValidConnection('attack', 'attack')).toBe(true);
    expect(isValidConnection('defense', 'defense')).toBe(true);
    
    // Link connections
    expect(isValidConnection('attack', 'link')).toBe(true);
    expect(isValidConnection('link', 'defense')).toBe(true);
    
    // Invalid connections
    expect(isValidConnection('attack', 'defense')).toBe(false);
    expect(isValidConnection('resource', 'element')).toBe(false);
  });

  it('shows visual indicators for valid connections', () => {
    const { container } = render(
      <HexForge 
        availableCards={[matchingEdgeCard1, matchingEdgeCard2]} 
        onForgeComplete={mockForgeComplete} 
      />
    );
    
    // Place cards in adjacent slots
    const { placeCard } = useForgeStore.getState();
    placeCard(matchingEdgeCard1, 0);
    placeCard(matchingEdgeCard2, 1);
    
    // Check for visual indicators of valid connections
    const connectionLines = container.querySelectorAll('.connectionLine');
    expect(connectionLines.length).toBeGreaterThan(0);
    
    // At least one connection should have the valid connection class
    const validConnections = container.querySelectorAll('.validConnection');
    expect(validConnections.length).toBeGreaterThan(0);
  });

  it('shows visual indicators for invalid connections', () => {
    const { container } = render(
      <HexForge 
        availableCards={[matchingEdgeCard1, nonMatchingEdgeCard]} 
        onForgeComplete={mockForgeComplete} 
      />
    );
    
    // Place cards in adjacent slots
    const { placeCard } = useForgeStore.getState();
    placeCard(matchingEdgeCard1, 0);
    placeCard(nonMatchingEdgeCard, 1);
    
    // Check for visual indicators of invalid connections
    const invalidConnections = container.querySelectorAll('.invalidConnection');
    expect(invalidConnections.length).toBeGreaterThan(0);
  });

  it('updates connection indicators when cards are placed or removed', () => {
    const { container } = render(
      <HexForge 
        availableCards={[matchingEdgeCard1, nonMatchingEdgeCard, linkEdgeCard]} 
        onForgeComplete={mockForgeComplete} 
      />
    );
    
    const { placeCard, removeCard } = useForgeStore.getState();
    
    // Initially place cards with invalid connection
    placeCard(matchingEdgeCard1, 0);
    placeCard(nonMatchingEdgeCard, 1);
    
    // Check for invalid connection indicator
    let invalidConnections = container.querySelectorAll('.invalidConnection');
    expect(invalidConnections.length).toBeGreaterThan(0);
    
    // Replace the second card with a link card (should create valid connection)
    removeCard(1);
    placeCard(linkEdgeCard, 1);
    
    // Now should have valid connection indicator
    const validConnections = container.querySelectorAll('.validConnection');
    expect(validConnections.length).toBeGreaterThan(0);
    
    // Invalid connections should be gone or fewer
    invalidConnections = container.querySelectorAll('.invalidConnection');
    expect(invalidConnections.length).toBeLessThan(2);
  });
  
  it('shows particle effects for valid connections when enabled', () => {
    const { container } = render(
      <HexForge 
        availableCards={[matchingEdgeCard1, matchingEdgeCard2]} 
        onForgeComplete={mockForgeComplete}
        enableEffects={true}
      />
    );
    
    const { placeCard } = useForgeStore.getState();
    
    // Place first card
    placeCard(matchingEdgeCard1, 0);
    
    // Get initial particle count
    const initialParticleCount = container.querySelectorAll('.particle').length;
    
    // Place second card to create valid connection
    act(() => {
      placeCard(matchingEdgeCard2, 1);
    });
    
    // Allow time for particles to be created
    act(() => {
      vi.runAllTimers();
    });
    
    // Should have more particles than before
    const newParticleCount = container.querySelectorAll('.particle').length;
    expect(newParticleCount).toBeGreaterThan(initialParticleCount);
  });
  
  it('does not show particle effects when disabled', () => {
    const { container } = render(
      <HexForge 
        availableCards={[matchingEdgeCard1, matchingEdgeCard2]} 
        onForgeComplete={mockForgeComplete}
        enableEffects={false}
      />
    );
    
    const { placeCard } = useForgeStore.getState();
    
    // Place cards to create valid connection
    placeCard(matchingEdgeCard1, 0);
    placeCard(matchingEdgeCard2, 1);
    
    // No particles should be visible
    const particles = container.querySelectorAll('.particle');
    expect(particles.length).toBe(0);
  });

  it('provides visual feedback for forge completion', () => {
    const { container } = render(
      <HexForge 
        availableCards={[
          matchingEdgeCard1, matchingEdgeCard2, linkEdgeCard, 
          matchingEdgeCard1, matchingEdgeCard2, linkEdgeCard
        ]} 
        onForgeComplete={mockForgeComplete}
        enableEffects={true}
      />
    );
    
    const { placeCard } = useForgeStore.getState();
    
    // Place all cards
    placeCard(matchingEdgeCard1, 0);
    placeCard(matchingEdgeCard2, 1);
    placeCard(linkEdgeCard, 2);
    placeCard(matchingEdgeCard1, 3);
    placeCard(matchingEdgeCard2, 4);
    placeCard(linkEdgeCard, 5);
    
    // Find and click the forge button
    const forgeButton = screen.getByRole('button', { name: /forge|create character/i });
    fireEvent.click(forgeButton);
    
    // Should show success message
    const successMessage = screen.getByText(/character created|forge complete|success/i);
    expect(successMessage).toBeInTheDocument();
    
    // Should show forge completion effects
    const completionEffects = container.querySelector('.forgeSuccessEffect');
    expect(completionEffects).not.toBeNull();
  });
});
