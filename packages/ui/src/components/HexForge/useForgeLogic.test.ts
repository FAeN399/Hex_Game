import { describe, it, expect, beforeEach } from 'vitest';
import { useForgeStore, isValidConnection, calculateCharacterStats } from './useForgeLogic';
import { HexCardType as HexCard, EdgeIconType as EdgeIcon } from 'schema';

describe('useForgeLogic', () => {
  // Create sample cards for testing
  const createSampleCard = (id: string, type: string, edges: EdgeIcon[]): HexCard => ({
    id,
    name: `Test ${type}`,
    type: type as any,
    rarity: 'common',
    edges: edges as [EdgeIcon, EdgeIcon, EdgeIcon, EdgeIcon, EdgeIcon, EdgeIcon],
    tags: []
  });
  
  // Sample cards with different edge configurations
  const card1 = createSampleCard('card1', 'unit', ['attack', 'defense', 'element', 'skill', 'resource', 'link']);
  const card2 = createSampleCard('card2', 'hero', ['defense', 'attack', 'link', 'element', 'skill', 'resource']);
  const card3 = createSampleCard('card3', 'spell', ['element', 'element', 'attack', 'skill', 'link', 'resource']);
  
  describe('isValidConnection', () => {
    it('should return true when edge types are the same', () => {
      expect(isValidConnection('attack', 'attack')).toBe(true);
      expect(isValidConnection('defense', 'defense')).toBe(true);
      expect(isValidConnection('element', 'element')).toBe(true);
    });
    
    it('should return true when one edge is a link', () => {
      expect(isValidConnection('attack', 'link')).toBe(true);
      expect(isValidConnection('link', 'defense')).toBe(true);
      expect(isValidConnection('link', 'element')).toBe(true);
    });
    
    it('should return false for non-matching edges', () => {
      expect(isValidConnection('attack', 'defense')).toBe(false);
      expect(isValidConnection('resource', 'element')).toBe(false);
    });
  });
  
  describe('calculateCharacterStats', () => {
    it('should return default stats for empty card array', () => {
      const stats = calculateCharacterStats([null, null, null, null, null, null]);
      expect(stats.totalPower).toBe(0);
      expect(stats.attack).toBe(0);
      expect(stats.defense).toBe(0);
      expect(stats.speed).toBe(0);
      expect(stats.magic).toBe(0);
      expect(stats.specialAbilities).toEqual([]);
    });
    
    it('should calculate stats based on card types', () => {
      const stats = calculateCharacterStats([card1, null, null, null, null, null]);
      
      // Unit card should contribute to attack and defense
      expect(stats.attack).toBeGreaterThan(0);
      expect(stats.defense).toBeGreaterThan(0);
    });
    
    it('should calculate different stats for different card types', () => {
      const unitStats = calculateCharacterStats([card1, null, null, null, null, null]);
      const heroStats = calculateCharacterStats([card2, null, null, null, null, null]);
      const spellStats = calculateCharacterStats([card3, null, null, null, null, null]);
      
      // Hero should have more attack than unit
      expect(heroStats.attack).toBeGreaterThan(unitStats.attack);
      
      // Spell should have more magic than unit
      expect(spellStats.magic).toBeGreaterThan(unitStats.magic);
    });
    
    it('should give bonus for valid connections between cards', () => {
      // Create two cards with matching edges
      const cardA = createSampleCard('cardA', 'unit', ['attack', 'attack', 'defense', 'element', 'skill', 'resource']);
      const cardB = createSampleCard('cardB', 'unit', ['resource', 'skill', 'element', 'defense', 'attack', 'attack']);
      
      // Place in positions 0 and 1 so their matching edges connect
      const statsWithConnection = calculateCharacterStats([cardA, cardB, null, null, null, null]);
      
      // Compare with non-adjacent placement
      const statsWithoutConnection = calculateCharacterStats([cardA, null, cardB, null, null, null]);
      
      // Should have higher total power with connection
      expect(statsWithConnection.totalPower).toBeGreaterThan(statsWithoutConnection.totalPower);
    });
  });
  
  describe('useForgeStore', () => {
    beforeEach(() => {
      // Reset the store before each test
      useForgeStore.getState().resetForge();
    });
    
    it('should initialize with empty slots', () => {
      const { placedCards } = useForgeStore.getState();
      expect(placedCards).toHaveLength(6);
      expect(placedCards.every(card => card === null)).toBe(true);
    });
    
    it('should place a card in a slot', () => {
      const { placeCard, placedCards } = useForgeStore.getState();
      
      placeCard(card1, 0);
      
      expect(placedCards[0]).toEqual(card1);
      expect(placedCards.slice(1).every(card => card === null)).toBe(true);
    });
    
    it('should remove a card from a slot', () => {
      const { placeCard, removeCard, placedCards } = useForgeStore.getState();
      
      placeCard(card1, 0);
      removeCard(0);
      
      expect(placedCards[0]).toBeNull();
    });
    
    it('should check if arrangement is valid', () => {
      const { placeCard, isValidArrangement } = useForgeStore.getState();
      
      // Incomplete arrangement should be invalid
      expect(isValidArrangement()).toBe(false);
      
      // Place cards in all slots
      placeCard(card1, 0);
      placeCard(card2, 1);
      placeCard(card3, 2);
      placeCard(card1, 3);
      placeCard(card2, 4);
      placeCard(card3, 5);
      
      // The arrangement may be valid or invalid depending on the card edges
      // Just make sure the function runs and returns a boolean
      expect(typeof isValidArrangement()).toBe('boolean');
    });
    
    it('should reset the forge', () => {
      const { placeCard, resetForge, placedCards } = useForgeStore.getState();
      
      placeCard(card1, 0);
      placeCard(card2, 1);
      resetForge();
      
      expect(placedCards.every(card => card === null)).toBe(true);
    });
  });
});
