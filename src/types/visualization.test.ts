import { describe, it, expect } from 'vitest';
import { defaultVisualizationSettings } from './visualization';

describe('Visualization Settings', () => {
  it('should have valid default settings', () => {
    expect(defaultVisualizationSettings).toBeDefined();
    expect(defaultVisualizationSettings.waveType).toBe('sine');
    expect(defaultVisualizationSettings.waveFrequency).toBeGreaterThan(0);
    expect(defaultVisualizationSettings.waveAmplitude).toBeGreaterThanOrEqual(0);
    expect(defaultVisualizationSettings.waveAmplitude).toBeLessThanOrEqual(100);
  });

  it('should have valid rotation settings', () => {
    expect(defaultVisualizationSettings.rotationSpeed).toBeGreaterThanOrEqual(0);
    expect(defaultVisualizationSettings.rotationAxes.x).toBe(true);
    expect(defaultVisualizationSettings.rotationAxes.y).toBe(true);
    expect(typeof defaultVisualizationSettings.rotationAxes.z).toBe('boolean');
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
