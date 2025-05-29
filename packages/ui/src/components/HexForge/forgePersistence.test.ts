import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveForgeConfiguration, loadForgeConfiguration } from './forgePersistence';
import { useForgeStore } from './useForgeLogic';
import { HexCardType as HexCard } from 'schema';

// Mock local storage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    getAll: () => store
  };
})();

// Replace the global localStorage object with our mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Forge Persistence', () => {
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

  beforeEach(() => {
    // Reset local storage and store between tests
    localStorageMock.clear();
    useForgeStore.getState().resetForge();
  });

  it('should save the current forge configuration', () => {
    // Place some cards in the forge
    const { placeCard } = useForgeStore.getState();
    placeCard(sampleCards[0], 0);
    placeCard(sampleCards[1], 2);
    placeCard(sampleCards[2], 4);

    // Save the configuration
    const savedId = saveForgeConfiguration('Test Configuration');
    expect(savedId).toBeDefined();
    
    // Check localStorage was called with the correct key
    expect(localStorageMock.setItem).toHaveBeenCalled();
    
    // The stored data should include the configuration name and cards
    const allStorage = localStorageMock.getAll();
    const keys = Object.keys(allStorage);
    const forgeConfigKey = keys.find(key => key.startsWith('hexforge-config-'));
    
    expect(forgeConfigKey).toBeDefined();
    
    const savedConfig = JSON.parse(allStorage[forgeConfigKey!]);
    expect(savedConfig.name).toBe('Test Configuration');
    expect(savedConfig.cards).toHaveLength(6);
    expect(savedConfig.cards[0]?.id).toBe('card1');
    expect(savedConfig.cards[1]).toBeNull();
    expect(savedConfig.cards[2]?.id).toBe('card2');
  });

  it('should load a forge configuration and update the store', () => {
    // First save a configuration
    const { placeCard } = useForgeStore.getState();
    placeCard(sampleCards[0], 0);
    placeCard(sampleCards[1], 2);
    placeCard(sampleCards[2], 4);
    const savedId = saveForgeConfiguration('Test Configuration');

    // Reset the store
    useForgeStore.getState().resetForge();
    expect(useForgeStore.getState().placedCards.filter(Boolean).length).toBe(0);

    // Load the configuration
    loadForgeConfiguration(savedId);

    // Check the store was updated
    const { placedCards } = useForgeStore.getState();
    expect(placedCards.filter(Boolean).length).toBe(3);
    expect(placedCards[0]?.id).toBe('card1');
    expect(placedCards[1]).toBeNull();
    expect(placedCards[2]?.id).toBe('card2');
    expect(placedCards[4]?.id).toBe('card3');
  });

  it('should throw an error when loading an invalid configuration', () => {
    expect(() => loadForgeConfiguration('invalid-id')).toThrow();
  });

  it('should list all saved configurations', () => {
    // Save multiple configurations
    const { placeCard, resetForge } = useForgeStore.getState();
    
    placeCard(sampleCards[0], 0);
    const id1 = saveForgeConfiguration('Config 1');
    
    resetForge();
    placeCard(sampleCards[1], 1);
    const id2 = saveForgeConfiguration('Config 2');
    
    resetForge();
    placeCard(sampleCards[2], 2);
    const id3 = saveForgeConfiguration('Config 3');

    // Get all configurations
    const configs = getAllSavedConfigurations();
    
    expect(configs).toHaveLength(3);
    expect(configs.map(c => c.id)).toContain(id1);
    expect(configs.map(c => c.id)).toContain(id2);
    expect(configs.map(c => c.id)).toContain(id3);
    expect(configs.map(c => c.name)).toContain('Config 1');
    expect(configs.map(c => c.name)).toContain('Config 2');
    expect(configs.map(c => c.name)).toContain('Config 3');
  });

  it('should delete a saved configuration', () => {
    // Save a configuration
    const { placeCard } = useForgeStore.getState();
    placeCard(sampleCards[0], 0);
    const savedId = saveForgeConfiguration('Test Configuration');

    // Delete it
    deleteForgeConfiguration(savedId);

    // It should be gone
    const configs = getAllSavedConfigurations();
    expect(configs.map(c => c.id)).not.toContain(savedId);
    
    // Trying to load it should throw an error
    expect(() => loadForgeConfiguration(savedId)).toThrow();
  });
});

// This function is needed to make the test pass but we'll implement it in forgePersistence.ts
function getAllSavedConfigurations(): Array<{id: string; name: string; timestamp: number}> {
  return [];
}

function deleteForgeConfiguration(id: string): void {
  // Implementation will be in forgePersistence.ts
}
