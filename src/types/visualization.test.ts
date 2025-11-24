import { describe, it, expect } from 'vitest';
import { defaultVisualizationSettings } from './visualization';
import type { VisualizationSettings, WaveType, SymmetryMode } from './visualization';

describe('Visualization Settings', () => {
  it('should have valid default settings', () => {
    expect(defaultVisualizationSettings).toBeDefined();
    expect(defaultVisualizationSettings.waveType).toBe('sine');
    expect(defaultVisualizationSettings.frequency).toBeGreaterThan(0);
    expect(defaultVisualizationSettings.amplitude).toBeGreaterThanOrEqual(0);
    expect(defaultVisualizationSettings.amplitude).toBeLessThanOrEqual(100);
  });

  it('should have valid rotation settings', () => {
    expect(defaultVisualizationSettings.rotationSpeed).toBeGreaterThanOrEqual(0);
    expect(defaultVisualizationSettings.rotationX).toBe(true);
    expect(defaultVisualizationSettings.rotationY).toBe(true);
    expect(typeof defaultVisualizationSettings.rotationZ).toBe('boolean');
  });

  it('should have valid audio reactivity settings', () => {
    expect(typeof defaultVisualizationSettings.audioReactive).toBe('boolean');
    expect(defaultVisualizationSettings.audioSensitivity).toBeGreaterThanOrEqual(0);
    expect(defaultVisualizationSettings.audioSensitivity).toBeLessThanOrEqual(100);
  });

  it('should have valid color and character settings', () => {
    expect(defaultVisualizationSettings.colorPreset).toBeDefined();
    expect(defaultVisualizationSettings.characterSet).toBeDefined();
    expect(typeof defaultVisualizationSettings.characterSet).toBe('string');
  });
});
