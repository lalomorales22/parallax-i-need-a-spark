import React, { useState, useEffect } from 'react';
import type { VisualizationSettings, WaveType, SymmetryMode, CharacterSet, ColorPreset } from '../types/visualization';

interface Device {
  device_id: string;
  name: string;
  address: string;
  port: number;
  role: string;
  status: string;
  personality: string;
  model: string;
  cpu_percent?: number;
  memory_percent?: number;
  gpu_info?: string;
  last_seen: string;
}

interface Personality {
  id?: number;
  device_id: string;
  name: string;
  backstory: string;
  traits: string;
  voice_style: string;
  response_style: string;
}

interface UnifiedDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  settings: VisualizationSettings;
  onSettingsChange: (settings: VisualizationSettings) => void;
  onRandomize: () => void;
  logs: string[];
  currentDeviceId: string;
  onStartHost: () => void;
  onStartClient: () => void;
  onStartVoice: () => void;
  autoListen: boolean;
  onAutoListenChange: (value: boolean) => void;
}

type TabType = 'visuals' | 'network' | 'personality' | 'logs' | 'controls';

const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  onRandomize,
  logs,
  currentDeviceId,
  onStartHost,
  onStartClient,
  onStartVoice,
  autoListen,
  onAutoListenChange
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('visuals');
  const [devices, setDevices] = useState<Device[]>([]);
  const [sparkMode, setSparkMode] = useState('standalone');
  const [parallaxHost, setParallaxHost] = useState('localhost');
  const [personality, setPersonality] = useState<Personality>({
    device_id: currentDeviceId,
    name: '',
    backstory: '',
    traits: '',
    voice_style: 'professional',
    response_style: 'balanced'
  });

  useEffect(() => {
    if (isOpen) {
      loadDevices();
      loadPersonality();
      loadSparkMode();
    }
  }, [isOpen, currentDeviceId]);

  const loadSparkMode = async () => {
    try {
      const mode = await window.ipcRenderer.invoke('get-spark-mode');
      const host = await window.ipcRenderer.invoke('get-parallax-host');
      setSparkMode(mode || 'standalone');
      setParallaxHost(host || 'localhost');
    } catch (e) {
      console.error('Failed to load spark mode:', e);
    }
  };

  const loadDevices = async () => {
    try {
      const allDevices = await window.ipcRenderer.getAllDevices();
      setDevices(allDevices || []);
    } catch (e) {
      console.error('Failed to load devices:', e);
    }
  };

  const loadPersonality = async () => {
    try {
      const p = await window.ipcRenderer.getPersonality(currentDeviceId);
      if (p) {
        setPersonality(p);
      }
    } catch (e) {
      console.error('Failed to load personality:', e);
    }
  };

  const savePersonality = async () => {
    try {
      await window.ipcRenderer.savePersonality(personality);
    } catch (e) {
      console.error('Failed to save personality:', e);
    }
  };

  const updateSetting = <K extends keyof VisualizationSettings>(
    key: K,
    value: VisualizationSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  if (!isOpen) return null;

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'visuals', label: 'Visuals', icon: '🎨' },
    { id: 'controls', label: 'Controls', icon: '🎮' },
    { id: 'network', label: 'Network', icon: '🌐' },
    { id: 'personality', label: 'Personality', icon: '✨' },
    { id: 'logs', label: 'Logs', icon: '📊' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'visuals':
        return <VisualsTab settings={settings} updateSetting={updateSetting} onRandomize={onRandomize} />;
      case 'controls':
        return (
          <ControlsTab
            onStartHost={() => {
              onStartHost();
              setSparkMode('host');
            }}
            onStartClient={() => {
              onStartClient();
              setSparkMode('client');
            }}
            onStartVoice={onStartVoice}
            autoListen={autoListen}
            onAutoListenChange={onAutoListenChange}
            sparkMode={sparkMode}
            parallaxHost={parallaxHost}
          />
        );
      case 'network':
        return <NetworkTab devices={devices} onRefresh={loadDevices} />;
      case 'personality':
        return (
          <PersonalityTab
            personality={personality}
            setPersonality={setPersonality}
            onSave={savePersonality}
          />
        );
      case 'logs':
        return <LogsTab logs={logs} />;
      default:
        return null;
    }
  };

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
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          zIndex: 1000,
        }}
      />

      {/* Dashboard Panel */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '700px',
        height: '80%',
        maxHeight: '600px',
        background: 'rgba(0, 10, 20, 0.98)',
        border: '1px solid #00ffcc',
        borderRadius: '16px',
        boxShadow: '0 0 50px rgba(0, 255, 204, 0.3)',
        zIndex: 1001,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'inherit',
        color: '#00ffcc'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px',
          borderBottom: '1px solid rgba(0, 255, 204, 0.3)',
          background: 'rgba(0, 255, 204, 0.05)'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '22px',
            textShadow: '0 0 10px #00ffcc',
            letterSpacing: '2px'
          }}>
            ⚙️ DASHBOARD
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 0, 85, 0.2)',
              border: '1px solid #ff0055',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              color: '#ff0055',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab Bar */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(0, 255, 204, 0.2)',
          background: 'rgba(0, 0, 0, 0.3)'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '12px 8px',
                background: activeTab === tab.id ? 'rgba(0, 255, 204, 0.15)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #00ffcc' : '2px solid transparent',
                color: activeTab === tab.id ? '#00ffcc' : 'rgba(0, 255, 204, 0.5)',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span style={{ fontSize: '18px' }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px'
        }} className="scrollable">
          {renderTabContent()}
        </div>
      </div>
    </>
  );
};

// Visuals Tab Component
const VisualsTab: React.FC<{
  settings: VisualizationSettings;
  updateSetting: <K extends keyof VisualizationSettings>(key: K, value: VisualizationSettings[K]) => void;
  onRandomize: () => void;
}> = ({ settings, updateSetting, onRandomize }) => {
  const waveTypes: WaveType[] = ['sine', 'sawtooth', 'square', 'triangle', 'hybrid'];
  const symmetryModes: SymmetryMode[] = ['none', 'radial2', 'radial4', 'radial6', 'radial8', 'bilateral', 'kaleidoscope'];
  const characterSets: CharacterSet[] = ['classic', 'blocks', 'geometric', 'cyber', 'organic'];
  const colorPresets: ColorPreset[] = ['neon-cyan', 'matrix-green', 'hot-pink', 'sunset', 'ocean', 'fire', 'rainbow'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <button
        onClick={onRandomize}
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, rgba(0, 255, 204, 0.2), rgba(255, 0, 255, 0.2))',
          border: '2px solid #00ffcc',
          borderRadius: '8px',
          color: '#00ffcc',
          padding: '14px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'all 0.3s'
        }}
      >
        🎲 RANDOMIZE ALL
      </button>

      <SettingRow label="Wave Type">
        <select
          value={settings.waveType}
          onChange={(e) => updateSetting('waveType', e.target.value as WaveType)}
          style={selectStyle}
        >
          {waveTypes.map(w => <option key={w} value={w}>{w}</option>)}
        </select>
      </SettingRow>

      <SettingRow label="Wave Frequency">
        <input
          type="range"
          min="0.1"
          max="10"
          step="0.1"
          value={settings.waveFrequency}
          onChange={(e) => updateSetting('waveFrequency', parseFloat(e.target.value))}
          style={rangeStyle}
        />
        <span style={{ width: '40px', textAlign: 'right' }}>{settings.waveFrequency.toFixed(1)}</span>
      </SettingRow>

      <SettingRow label="Amplitude">
        <input
          type="range"
          min="10"
          max="100"
          value={settings.waveAmplitude}
          onChange={(e) => updateSetting('waveAmplitude', parseInt(e.target.value))}
          style={rangeStyle}
        />
        <span style={{ width: '40px', textAlign: 'right' }}>{settings.waveAmplitude}</span>
      </SettingRow>

      <SettingRow label="Symmetry">
        <select
          value={settings.symmetryMode}
          onChange={(e) => updateSetting('symmetryMode', e.target.value as SymmetryMode)}
          style={selectStyle}
        >
          {symmetryModes.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </SettingRow>

      <SettingRow label="Rotation Speed">
        <input
          type="range"
          min="0"
          max="200"
          value={settings.rotationSpeed}
          onChange={(e) => updateSetting('rotationSpeed', parseInt(e.target.value))}
          style={rangeStyle}
        />
        <span style={{ width: '40px', textAlign: 'right' }}>{settings.rotationSpeed}</span>
      </SettingRow>

      <SettingRow label="Characters">
        <select
          value={settings.characterSet}
          onChange={(e) => updateSetting('characterSet', e.target.value as CharacterSet)}
          style={selectStyle}
        >
          {characterSets.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </SettingRow>

      <SettingRow label="Color Theme">
        <select
          value={settings.colorPreset}
          onChange={(e) => updateSetting('colorPreset', e.target.value as ColorPreset)}
          style={selectStyle}
        >
          {colorPresets.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </SettingRow>

      <SettingRow label="Audio Reactive">
        <ToggleSwitch
          checked={settings.audioReactive}
          onChange={(v) => updateSetting('audioReactive', v)}
        />
      </SettingRow>

      {settings.audioReactive && (
        <SettingRow label="Audio Sensitivity">
          <input
            type="range"
            min="10"
            max="100"
            value={settings.audioSensitivity}
            onChange={(e) => updateSetting('audioSensitivity', parseInt(e.target.value))}
            style={rangeStyle}
          />
          <span style={{ width: '40px', textAlign: 'right' }}>{settings.audioSensitivity}</span>
        </SettingRow>
      )}
    </div>
  );
};

// Controls Tab Component
const ControlsTab: React.FC<{
  onStartHost: () => void;
  onStartClient: () => void;
  onStartVoice: () => void;
  autoListen: boolean;
  onAutoListenChange: (value: boolean) => void;
  sparkMode: string;
  parallaxHost: string;
}> = ({ onStartHost, onStartClient, onStartVoice, autoListen, onAutoListenChange, sparkMode, parallaxHost }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{
        padding: '16px',
        background: 'rgba(0, 255, 204, 0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(0, 255, 204, 0.2)'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', opacity: 0.8 }}>VOICE SETTINGS</h3>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div>
            <div style={{ fontWeight: 'bold' }}>Auto Listen</div>
            <div style={{ fontSize: '11px', opacity: 0.6 }}>Continuously listen for voice input</div>
          </div>
          <ToggleSwitch checked={autoListen} onChange={onAutoListenChange} />
        </div>

        <button
          onClick={onStartVoice}
          style={{
            ...buttonStyle,
            width: '100%',
            background: 'linear-gradient(135deg, rgba(0, 255, 204, 0.2), rgba(0, 255, 204, 0.3))'
          }}
        >
          🎤 Start Voice Assistant
        </button>
      </div>

      <div style={{
        padding: '16px',
        background: 'rgba(255, 0, 255, 0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 0, 255, 0.2)'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', opacity: 0.8, color: '#ff00ff' }}>NETWORK MODE</h3>
        
        {/* Show current mode based on how the app was started */}
        {sparkMode === 'host' ? (
          <div style={{
            padding: '16px',
            background: 'rgba(0, 255, 0, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(0, 255, 0, 0.3)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🧠</div>
            <div style={{ color: '#00ff00', fontWeight: 'bold' }}>Running as HOST</div>
            <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '8px' }}>
              Parallax scheduler is running. Clients can connect to this machine.
            </div>
          </div>
        ) : sparkMode === 'client' ? (
          <div style={{
            padding: '16px',
            background: 'rgba(255, 0, 255, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 0, 255, 0.3)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔌</div>
            <div style={{ color: '#ff00ff', fontWeight: 'bold' }}>Running as CLIENT</div>
            <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '8px' }}>
              Connected to host at {parallaxHost}:3001
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={onStartHost}
                style={{
                  ...buttonStyle,
                  flex: 1,
                  borderColor: '#ff00ff',
                  color: '#ff00ff'
                }}
              >
                🧠 Start as Host
              </button>
              <button
                onClick={onStartClient}
                style={{
                  ...buttonStyle,
                  flex: 1,
                  borderColor: '#ff00ff',
                  color: '#ff00ff'
                }}
              >
                🔌 Start as Client
              </button>
            </div>
            <p style={{ fontSize: '11px', opacity: 0.6, marginTop: '12px', marginBottom: 0 }}>
              Tip: Use ./run-host.sh or ./run-client.sh for better control.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

// Network Tab Component
const NetworkTab: React.FC<{
  devices: Device[];
  onRefresh: () => void;
}> = ({ devices, onRefresh }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '14px' }}>Connected Devices</h3>
        <button onClick={onRefresh} style={{ ...buttonStyle, padding: '8px 16px', fontSize: '12px' }}>
          🔄 Refresh
        </button>
      </div>

      {devices.length === 0 ? (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          opacity: 0.5,
          border: '1px dashed rgba(0, 255, 204, 0.3)',
          borderRadius: '8px'
        }}>
          No devices connected yet.<br />
          Start as Host or Client to begin.
        </div>
      ) : (
        devices.map(device => (
          <div key={device.device_id} style={{
            padding: '16px',
            background: 'rgba(0, 255, 204, 0.05)',
            borderRadius: '8px',
            border: '1px solid rgba(0, 255, 204, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>{device.name}</span>
              <span style={{
                color: device.status === 'online' ? '#00ff00' : '#ff0000',
                fontSize: '12px'
              }}>
                ● {device.status}
              </span>
            </div>
            <div style={{ fontSize: '11px', opacity: 0.7 }}>
              <div>Role: {device.role}</div>
              <div>Address: {device.address}:{device.port}</div>
              {device.model && <div>Model: {device.model}</div>}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// Personality Tab Component
const PersonalityTab: React.FC<{
  personality: Personality;
  setPersonality: (p: Personality) => void;
  onSave: () => void;
}> = ({ personality, setPersonality, onSave }) => {
  const updateField = (field: keyof Personality, value: string) => {
    setPersonality({ ...personality, [field]: value });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <SettingRow label="Name">
        <input
          type="text"
          value={personality.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="Assistant name..."
          style={inputStyle}
        />
      </SettingRow>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', opacity: 0.8 }}>Backstory</label>
        <textarea
          value={personality.backstory}
          onChange={(e) => updateField('backstory', e.target.value)}
          placeholder="Who is this AI? What's their story?"
          style={{ ...inputStyle, height: '80px', resize: 'vertical' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', opacity: 0.8 }}>Personality Traits</label>
        <textarea
          value={personality.traits}
          onChange={(e) => updateField('traits', e.target.value)}
          placeholder="e.g., helpful, witty, professional..."
          style={{ ...inputStyle, height: '60px', resize: 'vertical' }}
        />
      </div>

      <SettingRow label="Voice Style">
        <select
          value={personality.voice_style}
          onChange={(e) => updateField('voice_style', e.target.value)}
          style={selectStyle}
        >
          <option value="professional">Professional</option>
          <option value="casual">Casual</option>
          <option value="energetic">Energetic</option>
          <option value="calm">Calm</option>
          <option value="robotic">Robotic</option>
        </select>
      </SettingRow>

      <SettingRow label="Response Style">
        <select
          value={personality.response_style}
          onChange={(e) => updateField('response_style', e.target.value)}
          style={selectStyle}
        >
          <option value="concise">Concise</option>
          <option value="balanced">Balanced</option>
          <option value="detailed">Detailed</option>
          <option value="creative">Creative</option>
        </select>
      </SettingRow>

      <button onClick={onSave} style={{ ...buttonStyle, width: '100%', marginTop: '8px' }}>
        💾 Save Personality
      </button>
    </div>
  );
};

// Logs Tab Component
const LogsTab: React.FC<{ logs: string[] }> = ({ logs }) => {
  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.5)',
      borderRadius: '8px',
      padding: '16px',
      height: '100%',
      minHeight: '300px',
      fontFamily: 'monospace',
      fontSize: '11px',
      overflowY: 'auto'
    }} className="scrollable">
      {logs.length === 0 ? (
        <div style={{ opacity: 0.5, textAlign: 'center', paddingTop: '40px' }}>
          No logs yet. Start the assistant to see activity.
        </div>
      ) : (
        logs.map((log, i) => (
          <div key={i} style={{
            padding: '4px 0',
            borderBottom: '1px solid rgba(0, 255, 204, 0.1)',
            opacity: 0.6 + (i / logs.length) * 0.4
          }}>
            {log}
          </div>
        ))
      )}
    </div>
  );
};

// Helper Components
const SettingRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px'
  }}>
    <label style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>{label}</label>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'flex-end' }}>
      {children}
    </div>
  </div>
);

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (v: boolean) => void }> = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    style={{
      width: '50px',
      height: '26px',
      borderRadius: '13px',
      border: 'none',
      background: checked ? 'rgba(0, 255, 204, 0.5)' : 'rgba(255, 255, 255, 0.2)',
      position: 'relative',
      cursor: 'pointer',
      transition: 'all 0.2s'
    }}
  >
    <div style={{
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      background: checked ? '#00ffcc' : '#888',
      position: 'absolute',
      top: '3px',
      left: checked ? '27px' : '3px',
      transition: 'all 0.2s',
      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
    }} />
  </button>
);

// Shared Styles
const selectStyle: React.CSSProperties = {
  background: 'rgba(0, 0, 0, 0.5)',
  border: '1px solid rgba(0, 255, 204, 0.3)',
  borderRadius: '6px',
  color: '#00ffcc',
  padding: '8px 12px',
  fontSize: '13px',
  cursor: 'pointer',
  minWidth: '140px'
};

const inputStyle: React.CSSProperties = {
  background: 'rgba(0, 0, 0, 0.5)',
  border: '1px solid rgba(0, 255, 204, 0.3)',
  borderRadius: '6px',
  color: '#00ffcc',
  padding: '10px 12px',
  fontSize: '13px',
  width: '100%',
  boxSizing: 'border-box'
};

const rangeStyle: React.CSSProperties = {
  flex: 1,
  accentColor: '#00ffcc',
  cursor: 'pointer'
};

const buttonStyle: React.CSSProperties = {
  background: 'rgba(0, 255, 204, 0.1)',
  border: '1px solid #00ffcc',
  borderRadius: '8px',
  color: '#00ffcc',
  padding: '12px 20px',
  fontSize: '14px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.2s'
};

export default UnifiedDashboard;
