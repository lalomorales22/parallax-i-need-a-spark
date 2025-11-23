export type WaveType = 'sine' | 'sawtooth' | 'square' | 'triangle' | 'hybrid';
export type SymmetryMode = 'none' | 'radial2' | 'radial4' | 'radial6' | 'radial8' | 'bilateral' | 'kaleidoscope';
export type CharacterSet = 'classic' | 'blocks' | 'geometric' | 'cyber' | 'organic';
export type ColorPreset = 'neon-cyan' | 'matrix-green' | 'hot-pink' | 'sunset' | 'ocean' | 'fire' | 'rainbow';

export interface VisualizationSettings {
  waveType: WaveType;
  waveFrequency: number; // 0.1 - 10
  waveAmplitude: number; // 0 - 100
  symmetryMode: SymmetryMode;
  rotationSpeed: number; // 0 - 200
  rotationAxes: {
    x: boolean;
    y: boolean;
    z: boolean;
  };
  characterSet: CharacterSet;
  colorPreset: ColorPreset;
  customColor?: string;
  audioReactive: boolean;
  audioSensitivity: number; // 0 - 100
}

export const defaultVisualizationSettings: VisualizationSettings = {
  waveType: 'sine',
  waveFrequency: 1,
  waveAmplitude: 50,
  symmetryMode: 'none',
  rotationSpeed: 100,
  rotationAxes: {
    x: true,
    y: true,
    z: false
  },
  characterSet: 'classic',
  colorPreset: 'neon-cyan',
  audioReactive: true,
  audioSensitivity: 50
};

export const CHARACTER_SETS: Record<CharacterSet, string[]> = {
  classic: ['.', ',', ':', ';', '*', 'o', 'x', '%', '@', '#'],
  blocks: [' ', '░', '▒', '▓', '█', '▀', '▄', '▌', '▐', '■'],
  geometric: [' ', '◢', '◣', '◤', '◥', '▲', '▼', '◀', '▶', '◆'],
  cyber: ['0', '1', '▪', '▫', '■', '□', '▬', '▭', '▮', '▯'],
  organic: [' ', '~', '≈', '∿', '∽', '∾', '⌇', '⌢', '⌣', '◡']
};

export const COLOR_PRESETS: Record<ColorPreset, string | string[]> = {
  'neon-cyan': '#00ffcc',
  'matrix-green': '#00ff00',
  'hot-pink': '#ff006f',
  'sunset': ['#ff6b35', '#ff8c42', '#ffa600'],
  'ocean': ['#006994', '#0099cc', '#00ccff'],
  'fire': ['#ff0000', '#ff6600', '#ffaa00'],
  'rainbow': 'rainbow' // Special case for HSL cycling
};
