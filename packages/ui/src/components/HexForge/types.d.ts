/**
 * TypeScript declarations for HexForge components
 */

// Edge icon types
export type EdgeIcon = 'fire' | 'water' | 'earth' | 'air' | 'light' | 'dark' | 'link';

// Declare the schema module if it doesn't exist
declare module '@hexcard/schema' {
  export interface HexCard {
    id: string;
    name: string;
    type: string;
    edges: EdgeIcon[];
    stats: {
      power: number;
      defense: number;
      agility: number;
      magic: number;
    };
    artwork: string;
    description: string;
  }
}

// Style module declarations
declare module '*.module.css' {
  const styles: {
    [className: string]: string;
  };
  export default styles;
}

// Module declarations for CSS modules
declare module '*.css';

// Make TypeScript happy with JSX
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
