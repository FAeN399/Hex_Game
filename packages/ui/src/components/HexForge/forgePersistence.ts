import { useForgeStore } from './useForgeLogic';

// Since we don't have direct access to @hexcard/schema, we'll use a simplified HexCard interface
// that matches what we need for the persistence functionality
interface HexCard {
  id: string;
  name: string;
  type: string;
  edges: string[];
  stats: {
    power: number;
    defense: number;
    agility: number;
    magic: number;
  };
  artwork: string;
  description: string;
}

/**
 * Configuration object structure for saved forge states
 */
export interface ForgeConfiguration {
  id: string;
  name: string;
  timestamp: number;
  cards: (HexCard | null)[];
}

/**
 * Prefix for localStorage keys storing forge configurations
 */
const STORAGE_KEY_PREFIX = 'hexforge-config-';

/**
 * Save the current forge configuration with a user-provided name
 * @param name User-friendly name for this configuration
 * @returns The unique ID of the saved configuration
 */
export function saveForgeConfiguration(name: string): string {
  // Get current state from the forge store
  const { placedCards } = useForgeStore.getState();
  
  // Create a new ID based on timestamp
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
  
  // Create the configuration object
  const config: ForgeConfiguration = {
    id,
    name,
    timestamp: Date.now(),
    cards: [...placedCards] // Create a copy of the cards array
  };
  
  // Save to localStorage
  localStorage.setItem(`${STORAGE_KEY_PREFIX}${id}`, JSON.stringify(config));
  
  return id;
}

/**
 * Load a saved configuration into the forge store
 * @param id The unique ID of the configuration to load
 * @throws Error if configuration doesn't exist
 */
export function loadForgeConfiguration(id: string): void {
  // Get the configuration from localStorage
  const configJson = localStorage.getItem(`${STORAGE_KEY_PREFIX}${id}`);
  
  if (!configJson) {
    throw new Error(`Forge configuration with ID ${id} not found`);
  }
  
  try {
    // Parse the JSON
    const config: ForgeConfiguration = JSON.parse(configJson);
    
    // Reset the forge and place each card
    const { resetForge, placeCard } = useForgeStore.getState();
    resetForge();
    
    // Place cards in their slots
    config.cards.forEach((card, index) => {
      if (card) {
        placeCard(card, index);
      }
    });
  } catch (error) {
    throw new Error(`Failed to load forge configuration: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get a list of all saved forge configurations
 * @returns Array of configuration metadata (id, name, timestamp)
 */
export function getAllSavedConfigurations(): Array<{id: string; name: string; timestamp: number}> {
  const configs: Array<{id: string; name: string; timestamp: number}> = [];
  
  // Iterate through localStorage keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    
    if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
      try {
        const configJson = localStorage.getItem(key);
        if (configJson) {
          const config: ForgeConfiguration = JSON.parse(configJson);
          configs.push({
            id: config.id,
            name: config.name,
            timestamp: config.timestamp
          });
        }
      } catch (error) {
        console.error(`Failed to parse saved configuration: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
  
  // Sort by timestamp (newest first)
  return configs.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Delete a saved forge configuration
 * @param id The unique ID of the configuration to delete
 */
export function deleteForgeConfiguration(id: string): void {
  localStorage.removeItem(`${STORAGE_KEY_PREFIX}${id}`);
}

/**
 * Export a forge configuration as JSON for sharing/backup
 * @param id The unique ID of the configuration to export
 * @returns JSON string of the configuration
 * @throws Error if configuration doesn't exist
 */
export function exportForgeConfiguration(id: string): string {
  const configJson = localStorage.getItem(`${STORAGE_KEY_PREFIX}${id}`);
  
  if (!configJson) {
    throw new Error(`Forge configuration with ID ${id} not found`);
  }
  
  return configJson;
}

/**
 * Import a forge configuration from JSON string
 * @param jsonConfig JSON string of the configuration
 * @returns The ID of the imported configuration
 * @throws Error if the import fails
 */
export function importForgeConfiguration(jsonConfig: string): string {
  try {
    // Parse the JSON to validate it
    const config: ForgeConfiguration = JSON.parse(jsonConfig);
    
    // Generate a new ID to avoid collisions
    const newId = `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
    config.id = newId;
    config.timestamp = Date.now(); // Update timestamp to now
    
    // Save to localStorage
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${newId}`, JSON.stringify(config));
    
    return newId;
  } catch (error) {
    throw new Error(`Failed to import forge configuration: ${error instanceof Error ? error.message : String(error)}`);
  }
}
