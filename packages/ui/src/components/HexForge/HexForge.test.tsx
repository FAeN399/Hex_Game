import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { HexForge } from './index';
import { useForgeStore } from './useForgeLogic';
import { HexCard } from '@hexcard/schema';

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

describe('HexForge', () => {
  // Create sample cards for testing
  const createSampleCard = (id: string, type: string): HexCard => ({
    id,
    name: `Test ${type}`,
    type: type as any,
    rarity: 'common',
    edges: ['attack', 'defense', 'element', 'skill', 'resource', 'link'] as any,
    tags: []
  });

  const sampleCards: HexCard[] = [
    createSampleCard('card1', 'unit'),
    createSampleCard('card2', 'hero'),
    createSampleCard('card3', 'spell'),
    createSampleCard('card4', 'structure'),
    createSampleCard('card5', 'relic'),
    createSampleCard('card6', 'unit'),
  ];

  const mockForgeComplete = vi.fn();

  beforeEach(() => {
    // Reset the store and mock function before each test
    useForgeStore.getState().resetForge();
    mockForgeComplete.mockReset();
  });

  it('renders correctly with available cards', () => {
    render(<HexForge availableCards={sampleCards} onForgeComplete={mockForgeComplete} />);
    
    // Check for main forge container
    expect(screen.getByTestId('hex-forge')).toBeInTheDocument();
    
    // Forge should start empty
    const stats = screen.getByText(/forge progress/i);
    expect(stats).toBeInTheDocument();
    expect(stats).toHaveTextContent('0/6');
  });

  it('shows correct progress as cards are placed', () => {
    render(<HexForge availableCards={sampleCards} onForgeComplete={mockForgeComplete} />);
    
    // Simulate placing two cards
    const { placeCard } = useForgeStore.getState();
    placeCard(sampleCards[0], 0);
    placeCard(sampleCards[1], 1);
    
    // Progress should update
    expect(screen.getByText(/forge progress/i)).toHaveTextContent('2/6');
  });

  it('enables forge button when all slots are filled', () => {
    render(<HexForge availableCards={sampleCards} onForgeComplete={mockForgeComplete} />);
    
    // Initially button should be disabled
    const forgeButton = screen.getByRole('button', { name: /incomplete forge/i });
    expect(forgeButton).toBeDisabled();
    
    // Fill all slots
    const { placeCard } = useForgeStore.getState();
    sampleCards.forEach((card, index) => {
      placeCard(card, index);
    });
    
    // Now the button should be enabled
    expect(screen.getByRole('button', { name: /create character/i })).not.toBeDisabled();
  });

  it('handles accessibility mode', () => {
    render(<HexForge availableCards={sampleCards} accessibilityMode={true} />);
    
    // Check that accessibility mode classes are applied
    const forgeContainer = screen.getByTestId('hex-forge');
    expect(forgeContainer).toHaveClass('accessibilityMode');
  });

  it('disables effects when specified', () => {
    const { container } = render(<HexForge availableCards={sampleCards} enableEffects={false} />);
    
    // No particle elements should be rendered
    expect(container.querySelector('.particleContainer')).toBeNull();
  });

  it('handles keyboard navigation', () => {
    render(<HexForge availableCards={sampleCards} />);
    
    const forgeContainer = screen.getByTestId('hex-forge');
    
    // Focus the container
    forgeContainer.focus();
    
    // Initially no socket is focused
    expect(useForgeStore.getState().focusedSocketIndex).toBe(null);
    
    // Press right arrow to focus first socket
    fireEvent.keyDown(forgeContainer, { key: 'ArrowRight' });
    expect(useForgeStore.getState().focusedSocketIndex).toBe(0);
    
    // Press right arrow again to move to next socket
    fireEvent.keyDown(forgeContainer, { key: 'ArrowRight' });
    expect(useForgeStore.getState().focusedSocketIndex).toBe(1);
    
    // Press left arrow to go back to previous socket
    fireEvent.keyDown(forgeContainer, { key: 'ArrowLeft' });
    expect(useForgeStore.getState().focusedSocketIndex).toBe(0);
  });

  it('calls onForgeComplete when forge is completed', () => {
    render(<HexForge availableCards={sampleCards} onForgeComplete={mockForgeComplete} />);
    
    // Fill all slots
    const { placeCard } = useForgeStore.getState();
    sampleCards.forEach((card, index) => {
      placeCard(card, index);
    });
    
    // Find and click the forge button
    const forgeButton = screen.getByRole('button', { name: /forge/i });
    fireEvent.click(forgeButton);
    
    // Check if callback was called
    expect(mockForgeComplete).toHaveBeenCalledTimes(1);
    expect(mockForgeComplete).toHaveBeenCalledWith(expect.objectContaining({
      id: expect.any(String),
      name: expect.any(String),
      totalPower: expect.any(Number),
      cardIds: expect.arrayContaining(sampleCards.map(card => card.id))
    }));
  });
});
