import React from 'react';
import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ForgeParticles from './ForgeParticles';

describe('ForgeParticles', () => {
  let originalRAF: typeof window.requestAnimationFrame;
  let originalCAF: typeof window.cancelAnimationFrame;
  
  beforeEach(() => {
    // Mock timers
    vi.useFakeTimers();
    
    // Mock requestAnimationFrame and cancelAnimationFrame
    originalRAF = window.requestAnimationFrame;
    originalCAF = window.cancelAnimationFrame;
    window.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(cb, 16) as unknown as number;
    window.cancelAnimationFrame = (id: number) => clearTimeout(id);
  });
  
  afterEach(() => {
    // Restore original functions
    window.requestAnimationFrame = originalRAF;
    window.cancelAnimationFrame = originalCAF;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });
  
  it('renders nothing when not active', () => {
    const { container } = render(
      <ForgeParticles 
        isActive={false} 
        particleType="connection" 
      />
    );
    
    // Container should be empty
    expect(container.firstChild).toBeNull();
  });
  
  it('renders particles when active', () => {
    const { container } = render(
      <ForgeParticles 
        isActive={true} 
        particleType="connection" 
        particleCount={5}
      />
    );
    
    // Should have container element
    expect(container.firstChild).not.toBeNull();
    expect(container.querySelector('.particleContainer')).not.toBeNull();
    
    // Should generate 5 particles
    const particles = container.querySelectorAll('.particle');
    expect(particles.length).toBe(5);
  });
  
  it('removes particles over time', () => {
    const { container, rerender } = render(
      <ForgeParticles 
        isActive={true} 
        particleType="forge" 
        particleCount={10}
      />
    );
    
    // Initially should have 10 particles
    expect(container.querySelectorAll('.particle').length).toBe(10);
    
    // Advance time to trigger animation frame
    act(() => {
      vi.advanceTimersByTime(500);
    });
    
    // Rerender to trigger update
    rerender(
      <ForgeParticles 
        isActive={true} 
        particleType="forge" 
        particleCount={10}
      />
    );
    
    // Particles should be decreasing
    const remainingParticles = container.querySelectorAll('.particle').length;
    expect(remainingParticles).toBeLessThan(10);
  });
  
  it('uses different colors for different particle types', () => {
    const { container: connectionContainer } = render(
      <ForgeParticles 
        isActive={true} 
        particleType="connection" 
        particleCount={1}
      />
    );
    
    const { container: forgeContainer } = render(
      <ForgeParticles 
        isActive={true} 
        particleType="forge" 
        particleCount={1}
      />
    );
    
    const { container: placementContainer } = render(
      <ForgeParticles 
        isActive={true} 
        particleType="placement" 
        particleCount={1}
      />
    );
    
    // Get the background colors
    const connectionColor = getComputedStyle(connectionContainer.querySelector('.particle')!).backgroundColor;
    const forgeColor = getComputedStyle(forgeContainer.querySelector('.particle')!).backgroundColor;
    const placementColor = getComputedStyle(placementContainer.querySelector('.particle')!).backgroundColor;
    
    // Colors should be different for different types
    // Note: This test might be flaky if the random color selection happens to pick the same color
    // A better approach would be to mock the random function, but this is simpler for demonstration
    expect(connectionColor === forgeColor && forgeColor === placementColor).toBe(false);
  });
  
  it('positions particles based on source/target when provided', () => {
    const sourcePosition = { x: 10, y: 20 };
    const targetPosition = { x: 100, y: 200 };
    
    const { container } = render(
      <ForgeParticles 
        isActive={true} 
        particleType="connection" 
        particleCount={5}
        sourcePosition={sourcePosition}
        targetPosition={targetPosition}
      />
    );
    
    // All particles should be positioned along the line between source and target
    const particles = container.querySelectorAll('.particle');
    particles.forEach(particle => {
      const style = getComputedStyle(particle);
      const left = parseFloat(style.left);
      const top = parseFloat(style.top);
      
      // We can't test exact positions due to randomness, but we can check if
      // they're in the general area between source and target
      expect(left).toBeGreaterThanOrEqual(sourcePosition.x - 100);
      expect(left).toBeLessThanOrEqual(targetPosition.x + 100);
      expect(top).toBeGreaterThanOrEqual(sourcePosition.y - 100);
      expect(top).toBeLessThanOrEqual(targetPosition.y + 100);
    });
  });
});
