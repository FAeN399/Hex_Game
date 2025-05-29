import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock localStorage
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

// Mock the @hexcard/schema module since we might not have it during testing
vi.mock('@hexcard/schema', () => ({
  HexCard: {
    parse: vi.fn((card) => card),
    safeParse: vi.fn((card) => ({ success: true, data: card }))
  }
}));

// Add any other global mocks or setup here
