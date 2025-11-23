import React, { useState } from 'react';
import type { VisualizationSettings, WaveType, SymmetryMode, CharacterSet, ColorPreset } from '../types/visualization';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: VisualizationSettings;
  onSettingsChange: (settings: VisualizationSettings) => void;
  onRandomize: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  onRandomize
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    visualization: true,
    app: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateSetting = <K extends keyof VisualizationSettings>(
    key: K,
    value: VisualizationSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease'
        }}
      />

      {/* Settings Panel */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '380px',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.95)',
        border: '1px solid #00ffcc',
        borderRight: 'none',
        boxShadow: '-5px 0 30px rgba(0, 255, 204, 0.3)',
        zIndex: 1001,
        padding: '20px',
        overflowY: 'auto',
        animation: 'slideInRight 0.3s ease',
        fontFamily: 'inherit',
        color: '#00ffcc'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px',
          paddingBottom: '15px',
          borderBottom: '1px solid rgba(0, 255, 204, 0.3)'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '24px',
            textShadow: '0 0 10px #00ffcc'
          }}>
            ⚙️ SETTINGS
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#ff0055',
              fontSize: '24px',
              cursor: 'pointer',
              padding: 0
            }}
          >
            ✕
          </button>
        </div>

        {/* Randomize Button */}
        <button
          onClick={onRandomize}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, rgba(0, 255, 204, 0.2), rgba(255, 0, 255, 0.2))',
            border: '2px solid #00ffcc',
            borderRadius: '8px',
            color: '#00ffcc',
            padding: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginBottom: '20px',
            transition: 'all 0.3s',
            boxShadow: '0 0 15px rgba(0, 255, 204, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 255, 204, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 255, 204, 0.3)';
          }}
        >
          🎲 RANDOMIZE VISUALS
        </button>

        {/* Visualization Settings Section */}
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => toggleSection('visualization')}
            style={{
              width: '100%',
              background: 'rgba(0, 255, 204, 0.1)',
              border: '1px solid rgba(0, 255, 204, 0.3)',
              borderRadius: '6px',
              color: '#00ffcc',
              padding: '10px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px'
            }}
          >
            <span>VISUALIZATION</span>
            <span>{expandedSections.visualization ? '▼' : '▶'}</span>
          </button>

          {expandedSections.visualization && (
            <div style={{ padding: '10px 0' }}>
              {/* Wave Type */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', opacity: 0.8 }}>
                  Pattern Type
                </label>
                <select
                  value={settings.waveType}
                  onChange={(e) => updateSetting('waveType', e.target.value as WaveType)}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid #00ffcc',
                    borderRadius: '4px',
                    color: '#00ffcc',
                    padding: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="sine">Sine Wave</option>
                  <option value="sawtooth">Sawtooth Wave</option>
                  <option value="square">Square Wave</option>
                  <option value="triangle">Triangle Wave</option>
                  <option value="hybrid">Hybrid (Complex)</option>
                </select>
              </div>

              {/* Wave Frequency */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', opacity: 0.8 }}>
                  Wave Frequency: {settings.waveFrequency.toFixed(1)} Hz
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={settings.waveFrequency}
                  onChange={(e) => updateSetting('waveFrequency', parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Wave Amplitude */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', opacity: 0.8 }}>
                  Wave Amplitude: {settings.waveAmplitude}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={settings.waveAmplitude}
                  onChange={(e) => updateSetting('waveAmplitude', parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Symmetry Mode */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', opacity: 0.8 }}>
                  Symmetry Mode
                </label>
                <select
                  value={settings.symmetryMode}
                  onChange={(e) => updateSetting('symmetryMode', e.target.value as SymmetryMode)}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid #00ffcc',
                    borderRadius: '4px',
                    color: '#00ffcc',
                    padding: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="none">None</option>
                  <option value="radial2">Radial 2x</option>
                  <option value="radial4">Radial 4x</option>
                  <option value="radial6">Radial 6x</option>
                  <option value="radial8">Radial 8x</option>
                  <option value="bilateral">Bilateral Mirror</option>
                  <option value="kaleidoscope">Kaleidoscope</option>
                </select>
              </div>

              {/* Rotation Speed */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', opacity: 0.8 }}>
                  Rotation Speed: {settings.rotationSpeed}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="1"
                  value={settings.rotationSpeed}
                  onChange={(e) => updateSetting('rotationSpeed', parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Rotation Axes */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', opacity: 0.8 }}>
                  Rotation Axes
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['x', 'y', 'z'].map((axis) => (
                    <label key={axis} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={settings.rotationAxes[axis as 'x' | 'y' | 'z']}
                        onChange={(e) => updateSetting('rotationAxes', {
                          ...settings.rotationAxes,
                          [axis]: e.target.checked
                        })}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '14px', textTransform: 'uppercase' }}>{axis}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Character Set */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', opacity: 0.8 }}>
                  Character Set
                </label>
                <select
                  value={settings.characterSet}
                  onChange={(e) => updateSetting('characterSet', e.target.value as CharacterSet)}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid #00ffcc',
                    borderRadius: '4px',
                    color: '#00ffcc',
                    padding: '8px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontFamily: 'monospace'
                  }}
                >
                  <option value="classic">Classic: .,:;*ox%@#</option>
                  <option value="blocks">Blocks: ░▒▓█▀▄▌▐■</option>
                  <option value="geometric">Geometric: ◢◣◤◥▲▼◀▶</option>
                  <option value="cyber">Cyber: 01▪▫■□▬</option>
                  <option value="organic">Organic: ~≈∿∽∾⌇</option>
                </select>
              </div>

              {/* Color Preset */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', opacity: 0.8 }}>
                  Color Scheme
                </label>
                <select
                  value={settings.colorPreset}
                  onChange={(e) => updateSetting('colorPreset', e.target.value as ColorPreset)}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid #00ffcc',
                    borderRadius: '4px',
                    color: '#00ffcc',
                    padding: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="neon-cyan">Neon Cyan</option>
                  <option value="matrix-green">Matrix Green</option>
                  <option value="hot-pink">Hot Pink</option>
                  <option value="sunset">Sunset Gradient</option>
                  <option value="ocean">Ocean Gradient</option>
                  <option value="fire">Fire Gradient</option>
                  <option value="rainbow">Rainbow (Animated)</option>
                </select>
              </div>

              {/* Audio Reactivity */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.audioReactive}
                    onChange={(e) => updateSetting('audioReactive', e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px' }}>Audio Reactivity</span>
                </label>
              </div>

              {/* Audio Sensitivity */}
              {settings.audioReactive && (
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', opacity: 0.8 }}>
                    Audio Sensitivity: {settings.audioSensitivity}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={settings.audioSensitivity}
                    onChange={(e) => updateSetting('audioSensitivity', parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* App Settings Section */}
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => toggleSection('app')}
            style={{
              width: '100%',
              background: 'rgba(0, 255, 204, 0.1)',
              border: '1px solid rgba(0, 255, 204, 0.3)',
              borderRadius: '6px',
              color: '#00ffcc',
              padding: '10px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px'
            }}
          >
            <span>APP SETTINGS</span>
            <span>{expandedSections.app ? '▼' : '▶'}</span>
          </button>

          {expandedSections.app && (
            <div style={{ padding: '10px 0' }}>
              <p style={{ fontSize: '12px', opacity: 0.7 }}>
                Additional app settings (window opacity, always on top, etc.) will be available here.
              </p>
            </div>
          )}
        </div>

        {/* Preset Actions */}
        <div style={{
          borderTop: '1px solid rgba(0, 255, 204, 0.3)',
          paddingTop: '15px',
          marginTop: '20px'
        }}>
          <button
            style={{
              width: '100%',
              background: 'rgba(0, 255, 204, 0.1)',
              border: '1px solid #00ffcc',
              borderRadius: '6px',
              color: '#00ffcc',
              padding: '10px',
              fontSize: '14px',
              cursor: 'pointer',
              marginBottom: '10px',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 255, 204, 0.2)';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 255, 204, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 255, 204, 0.1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            💾 Save as Preset
          </button>
          <button
            style={{
              width: '100%',
              background: 'rgba(0, 255, 204, 0.1)',
              border: '1px solid #00ffcc',
              borderRadius: '6px',
              color: '#00ffcc',
              padding: '10px',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 255, 204, 0.2)';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 255, 204, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 255, 204, 0.1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            📂 Load Preset
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          background: rgba(0, 255, 204, 0.2);
          border-radius: 3px;
          outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: #00ffcc;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 5px #00ffcc;
        }
        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #00ffcc;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 5px #00ffcc;
          border: none;
        }
        input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: #00ffcc;
        }
      `}</style>
    </>
  );
};

export default SettingsPanel;
