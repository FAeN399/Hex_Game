import { describe, it, expect } from 'vitest';
import { 
  HexCard, 
  Character,
  MapTile,
  EdgeIcon,
  Terrain
} from '../src';
import cardFixtures from './fixtures/cards.json';
import characterFixtures from './fixtures/characters.json';
import mapTileFixtures from './fixtures/map_tiles.json';

describe('Schema Models', () => {
  describe('HexCard', () => {
    it('should parse valid cards', () => {
      cardFixtures.forEach(card => {
        const result = HexCard.safeParse(card);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid cards', () => {
      const invalidCard = {
        id: 'not-a-uuid',
        name: 'Bad Card',
        type: 'invalid-type',
        rarity: 'legendary', // not in enum
        edges: ['attack', 'defense'] // not enough edges
      };
      
      const result = HexCard.safeParse(invalidCard);
      expect(result.success).toBe(false);
    });

    it('should validate edge types', () => {
      const validEdges: EdgeIcon[] = ['attack', 'defense', 'element', 'skill', 'resource', 'link'];
      
      validEdges.forEach(edge => {
        expect(EdgeIcon.safeParse(edge).success).toBe(true);
      });
      
      expect(EdgeIcon.safeParse('invalid-edge').success).toBe(false);
    });
  });

  describe('Character', () => {
    it('should parse valid characters', () => {
      characterFixtures.forEach(character => {
        const result = Character.safeParse(character);
        expect(result.success).toBe(true);
      });
    });

    it('should require exactly 6 card IDs', () => {
      const invalidCharacter = {
        ...characterFixtures[0],
        cardIds: [characterFixtures[0].cardIds[0]] // Only one card ID
      };
      
      const result = Character.safeParse(invalidCharacter);
      expect(result.success).toBe(false);
    });
  });

  describe('MapTile', () => {
    it('should parse valid map tiles', () => {
      mapTileFixtures.forEach(tile => {
        const result = MapTile.safeParse(tile);
        expect(result.success).toBe(true);
      });
    });

    it('should validate terrain types', () => {
      const validTerrains: Terrain[] = ['plains', 'forest', 'mountain', 'water', 'desert', 'swamp', 'city'];
      
      validTerrains.forEach(terrain => {
        expect(Terrain.safeParse(terrain).success).toBe(true);
      });
      
      expect(Terrain.safeParse('invalid-terrain').success).toBe(false);
    });

    it('should handle optional occupant IDs', () => {
      // Tile with occupant
      const tileWithOccupant = mapTileFixtures.find(tile => tile.occupantId);
      expect(MapTile.safeParse(tileWithOccupant).success).toBe(true);
      
      // Tile without occupant
      const tileWithoutOccupant = mapTileFixtures.find(tile => !tile.occupantId);
      expect(MapTile.safeParse(tileWithoutOccupant).success).toBe(true);
    });
  });
});
