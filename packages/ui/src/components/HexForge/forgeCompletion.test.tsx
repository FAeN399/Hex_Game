import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
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

describe('Forge Completion Visual Feedback', () => {
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
    
    // Mock timers for animations
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows animated forge center when all cards are placed', () => {
    const { container } = render(
      <HexForge 
        availableCards={sampleCards} 
        onForgeComplete={mockForgeComplete}
        enableEffects={true}
      />
    );
    
    // Initially, the forge center should not have the active class
    const forgeCenter = container.querySelector('.forgeCenter');
    expect(forgeCenter).not.toHaveClass('forgeActive');
    
    // Place all cards
    const { placeCard } = useForgeStore.getState();
    sampleCards.forEach((card, index) => {
      placeCard(card, index);
    });
    
    // After placing all cards, forge center should have active class
    expect(forgeCenter).toHaveClass('forgeActive');
  });
  
  it('triggers success particles when forge is completed', () => {
    const { container } = render(
      <HexForge 
        availableCards={sampleCards} 
        onForgeComplete={mockForgeComplete}
        enableEffects={true}
      />
    );
    
    // Initially there should be no success particles
    let successParticles = container.querySelectorAll('.particlePulse');
    expect(successParticles.length).toBe(0);
    
    // Place all cards and complete the forge
    const { placeCard } = useForgeStore.getState();
    sampleCards.forEach((card, index) => {
      placeCard(card, index);
    });
    
    // Find and click the forge button
    const forgeButton = screen.getByRole('button', { name: /forge|create character/i });
    fireEvent.click(forgeButton);
    
    // Advance timers to allow effects to render
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    // Now should have success particles
    successParticles = container.querySelectorAll('.particle');
    expect(successParticles.length).toBeGreaterThan(0);
  });
  
  it('adds forgeComplete class to forge center after successful completion', () => {
    const { container } = render(
      <HexForge 
        availableCards={sampleCards} 
        onForgeComplete={mockForgeComplete}
        enableEffects={true}
      />
    );
    
    // Initially, the forge center should not have the complete class
    const forgeCenter = container.querySelector('.forgeCenter');
    expect(forgeCenter).not.toHaveClass('forgeComplete');
    
    // Place all cards
    const { placeCard } = useForgeStore.getState();
    sampleCards.forEach((card, index) => {
      placeCard(card, index);
    });
    
    // Find and click the forge button
    const forgeButton = screen.getByRole('button', { name: /forge|create character/i });
    fireEvent.click(forgeButton);
    
    // After completion, forge center should have complete class
    expect(forgeCenter).toHaveClass('forgeComplete');
  });
  
  it('shows success message after forge completion', () => {
    render(
      <HexForge 
        availableCards={sampleCards} 
        onForgeComplete={mockForgeComplete}
        enableEffects={true}
      />
    );
    
    // Place all cards
    const { placeCard } = useForgeStore.getState();
    sampleCards.forEach((card, index) => {
      placeCard(card, index);
    });
    
    // Initially no success message
    expect(screen.queryByText(/success|complete|created/i)).not.toBeInTheDocument();
    
    // Find and click the forge button
    const forgeButton = screen.getByRole('button', { name: /forge|create character/i });
    fireEvent.click(forgeButton);
    
    // Should show success message
    expect(screen.getByText(/success|complete|created/i)).toBeInTheDocument();
  });
  
  it('disables effects when effects are turned off', () => {
    const { container } = render(
      <HexForge 
        availableCards={sampleCards} 
        onForgeComplete={mockForgeComplete}
        enableEffects={false}
      />
    );
    
    // Place all cards
    const { placeCard } = useForgeStore.getState();
    sampleCards.forEach((card, index) => {
      placeCard(card, index);
    });
    
    // Find and click the forge button
    const forgeButton = screen.getByRole('button', { name: /forge|create character/i });
    fireEvent.click(forgeButton);
    
    // Advance timers to allow effects to render
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    // Should not have any particle effects
    const particles = container.querySelectorAll('.particle');
    expect(particles.length).toBe(0);
  });
});
