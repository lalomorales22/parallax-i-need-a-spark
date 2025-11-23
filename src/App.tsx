import React, { useState, useEffect } from 'react';
import AsciiOrb from './components/AsciiOrb';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import NetworkDashboard from './components/NetworkDashboard';
import PersonalityEditor from './components/PersonalityEditor';
import SettingsPanel from './components/SettingsPanel';
import type { VisualizationSettings, WaveType, SymmetryMode, CharacterSet, ColorPreset } from './types/visualization';
import { defaultVisualizationSettings } from './types/visualization';

function App() {
  const [status, setStatus] = useState('IDLE');
  const [assistantName, setAssistantName] = useState('Spark');
  const [logs, setLogs] = useState<string[]>([]);
  const [isSetup, setIsSetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showNetworkDashboard, setShowNetworkDashboard] = useState(false);
  const [showPersonalityEditor, setShowPersonalityEditor] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [vizSettings, setVizSettings] = useState<VisualizationSettings>(defaultVisualizationSettings);
  const [currentDeviceId, setCurrentDeviceId] = useState('');

  useEffect(() => {
    // Check if setup is complete
    if (!window.ipcRenderer) {
      console.error('ipcRenderer is not available');
      setLogs(prev => [...prev, 'ERROR: ipcRenderer is not available. Preload script might have failed.']);
      setLoading(false);
      return;
    }

    window.ipcRenderer.getSetting('setup_complete').then((val) => {
      if (val === 'true') {
        setIsSetup(true);
        // Load name
        window.ipcRenderer.getSetting('assistant_name').then((name) => {
          if (name) {
            setAssistantName(name);
            setCurrentDeviceId(name); // Use assistant name as device ID
          }
        });

        // Load visualization settings
        window.ipcRenderer.getSetting('viz_settings').then((settingsStr) => {
          if (settingsStr) {
            try {
              const loadedSettings = JSON.parse(settingsStr);
              setVizSettings({ ...defaultVisualizationSettings, ...loadedSettings });
            } catch (e) {
              console.error('Failed to parse viz settings:', e);
            }
          }
        });
      }
      setLoading(false);
    });

    // Listen for logs
    window.ipcRenderer.on('log-update', (_event, message) => {
      setLogs(prev => [...prev.slice(-19), message]); // Keep last 20 lines
    });

    // Listen for state updates
    window.ipcRenderer.on('state-update', (_event, newState) => {
      setStatus(newState);
    });

    return () => {
      window.ipcRenderer.off('log-update');
      window.ipcRenderer.off('state-update');
    };
  }, []);

  const handleOnboardingComplete = async (config: {
    name: string;
    personality: string;
    role: 'host' | 'client' | null;
    hostIp?: string;
    model?: string;
  }) => {
    await window.ipcRenderer.saveSetting('assistant_name', config.name);
    await window.ipcRenderer.saveSetting('assistant_personality', config.personality);
    await window.ipcRenderer.saveSetting('device_role', config.role || '');
    if (config.hostIp) {
      await window.ipcRenderer.saveSetting('host_ip', config.hostIp);
    }
    if (config.model) {
      await window.ipcRenderer.saveSetting('model', config.model);
    }
    await window.ipcRenderer.saveSetting('setup_complete', 'true');
    setAssistantName(config.name);
    setIsSetup(true);
  };

  const handleStartHost = async () => {
    setStatus('STARTING HOST...');
    const res = await window.ipcRenderer.startHost();
    setLogs(prev => [...prev, res]);
  };

  const handleStartClient = async () => {
    setStatus('STARTING CLIENT...');
    const res = await window.ipcRenderer.startClient();
    setLogs(prev => [...prev, res]);
  };

  const handleStartVoice = async () => {
    setStatus('STARTING VOICE...');
    const res = await window.ipcRenderer.startVoice();
    setLogs(prev => [...prev, res]);
  };

  const handleClose = () => {
    window.ipcRenderer.closeApp();
  };

  const handleSettingsChange = (newSettings: VisualizationSettings) => {
    setVizSettings(newSettings);
    // Save to localStorage/database
    window.ipcRenderer.saveSetting('viz_settings', JSON.stringify(newSettings));
  };

  const randomizeVisualization = () => {
    const waveTypes: WaveType[] = ['sine', 'sawtooth', 'square', 'triangle', 'hybrid'];
    const symmetryModes: SymmetryMode[] = ['none', 'radial2', 'radial4', 'radial6', 'radial8', 'bilateral', 'kaleidoscope'];
    const characterSets: CharacterSet[] = ['classic', 'blocks', 'geometric', 'cyber', 'organic'];
    const colorPresets: ColorPreset[] = ['neon-cyan', 'matrix-green', 'hot-pink', 'sunset', 'ocean', 'fire', 'rainbow'];

    const random = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

    const randomSettings: VisualizationSettings = {
      waveType: random(waveTypes),
      waveFrequency: Math.random() * 9.9 + 0.1, // 0.1 - 10
      waveAmplitude: Math.floor(Math.random() * 70) + 30, // 30 - 100
      symmetryMode: random(symmetryModes),
      rotationSpeed: Math.floor(Math.random() * 150) + 50, // 50 - 200
      rotationAxes: {
        x: Math.random() > 0.3,
        y: Math.random() > 0.3,
        z: Math.random() > 0.5
      },
      characterSet: random(characterSets),
      colorPreset: random(colorPresets),
      audioReactive: Math.random() > 0.3,
      audioSensitivity: Math.floor(Math.random() * 60) + 30 // 30 - 90
    };

    handleSettingsChange(randomSettings);
  };

  // Determine orb color based on status
  const getOrbColor = () => {
    switch (status) {
      case 'LISTENING': return '#00ff00'; // Green
      case 'THINKING': return '#ffff00'; // Yellow
      case 'SPEAKING': return '#ff00ff'; // Magenta
      case 'IDLE': return '#00ffcc'; // Cyan
      default: return '#00ffcc';
    }
  };

  if (loading) return null;

  if (!isSetup) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(0, 20, 40, 0.95) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 204, 0.1) 0%, transparent 50%)',
          animation: 'pulse 3s ease-in-out infinite'
        }} />

        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '40px',
            background: 'none',
            border: 'none',
            color: '#ff0055',
            fontSize: '24px',
            cursor: 'pointer',
            fontWeight: 'bold',
            zIndex: 10,
            transition: 'all 0.3s'
          }}
        >
          ✕
        </button>
        <Onboarding onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 20, 40, 0.9) 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Glassmorphic background effect */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `radial-gradient(circle at 50% 50%, ${getOrbColor()}15 0%, transparent 60%)`,
        transition: 'background 0.5s ease'
      }} />

      {/* Close Button */}
      <button
        onClick={handleClose}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(255, 0, 85, 0.2)',
          border: '1px solid #ff0055',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          color: '#ff0055',
          fontSize: '20px',
          cursor: 'pointer',
          fontWeight: 'bold',
          zIndex: 10,
          transition: 'all 0.3s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(255, 0, 85, 0.3)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 0, 85, 0.4)';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 0, 85, 0.2)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        ✕
      </button>

      {/* Settings Gear Icon */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        style={{
          position: 'absolute',
          top: '20px',
          right: '70px',
          background: showSettings ? 'rgba(0, 255, 204, 0.3)' : 'rgba(0, 255, 204, 0.2)',
          border: '1px solid #00ffcc',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          color: '#00ffcc',
          fontSize: '20px',
          cursor: 'pointer',
          zIndex: 10,
          transition: 'all 0.3s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: showSettings ? '0 0 25px rgba(0, 255, 204, 0.5)' : '0 0 15px rgba(0, 255, 204, 0.3)',
          animation: showSettings ? 'none' : 'undefined'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0, 255, 204, 0.4)';
          e.currentTarget.style.transform = 'rotate(90deg) scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = showSettings ? 'rgba(0, 255, 204, 0.3)' : 'rgba(0, 255, 204, 0.2)';
          e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
        }}
      >
        ⚙️
      </button>

      {/* Dashboard Buttons */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 10
      }}>
        <button
          onClick={() => setShowNetworkDashboard(true)}
          style={{
            background: 'linear-gradient(135deg, rgba(0, 255, 204, 0.2), rgba(0, 255, 204, 0.3))',
            border: '1px solid #00ffcc',
            borderRadius: '8px',
            color: '#00ffcc',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            padding: '10px 16px',
            transition: 'all 0.3s',
            boxShadow: '0 0 15px rgba(0, 255, 204, 0.3)',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 255, 204, 0.3), rgba(0, 255, 204, 0.4))';
            e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 255, 204, 0.5)';
            e.currentTarget.style.transform = 'translateX(5px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 255, 204, 0.2), rgba(0, 255, 204, 0.3))';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 255, 204, 0.3)';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          🌐 Network
        </button>

        <button
          onClick={() => setShowPersonalityEditor(true)}
          style={{
            background: 'linear-gradient(135deg, rgba(255, 0, 255, 0.2), rgba(255, 0, 255, 0.3))',
            border: '1px solid #ff00ff',
            borderRadius: '8px',
            color: '#ff00ff',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            padding: '10px 16px',
            transition: 'all 0.3s',
            boxShadow: '0 0 15px rgba(255, 0, 255, 0.3)',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 0, 255, 0.3), rgba(255, 0, 255, 0.4))';
            e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 0, 255, 0.5)';
            e.currentTarget.style.transform = 'translateX(5px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 0, 255, 0.2), rgba(255, 0, 255, 0.3))';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 0, 255, 0.3)';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          ✨ Personality
        </button>

        <button
          onClick={() => setShowDashboard(true)}
          style={{
            background: 'rgba(0, 255, 204, 0.1)',
            border: '1px solid rgba(0, 255, 204, 0.3)',
            borderRadius: '8px',
            color: '#00ffcc',
            fontSize: '11px',
            cursor: 'pointer',
            padding: '8px 14px',
            transition: 'all 0.3s',
            boxShadow: '0 0 10px rgba(0, 255, 204, 0.2)',
            opacity: 0.7
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 255, 204, 0.2)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 204, 0.4)';
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'translateX(5px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 255, 204, 0.1)';
            e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 255, 204, 0.2)';
            e.currentTarget.style.opacity = '0.7';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          📊 Logs
        </button>
      </div>

      {showDashboard && <Dashboard onClose={() => setShowDashboard(false)} logs={logs} />}
      {showNetworkDashboard && <NetworkDashboard onClose={() => setShowNetworkDashboard(false)} />}
      {showPersonalityEditor && (
        <PersonalityEditor
          deviceId={currentDeviceId}
          onClose={() => setShowPersonalityEditor(false)}
          onSave={() => {
            // Reload personality or update UI
            console.log('Personality saved!');
          }}
        />
      )}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={vizSettings}
        onSettingsChange={handleSettingsChange}
        onRandomize={randomizeVisualization}
      />

      {/* ASCII Orb */}
      <AsciiOrb status={status} color={status !== 'IDLE' ? getOrbColor() : undefined} settings={vizSettings} />

      <h1 style={{
        margin: '0 0 10px 0',
        textShadow: `0 0 15px ${getOrbColor()}`,
        color: getOrbColor(),
        fontSize: '36px',
        fontWeight: 'bold',
        letterSpacing: '3px',
        transition: 'all 0.5s ease'
      }}>
        {assistantName}
      </h1>
      <p style={{
        fontSize: '14px',
        opacity: 0.9,
        color: getOrbColor(),
        textShadow: `0 0 10px ${getOrbColor()}`,
        letterSpacing: '2px',
        transition: 'all 0.5s ease'
      }}>
        STATUS: {status}
      </p>

      {/* Log Output */}
      <div style={{
        width: '85%',
        maxWidth: '600px',
        height: '120px',
        overflowY: 'auto',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${getOrbColor()}30`,
        borderRadius: '8px',
        padding: '10px',
        fontSize: '11px',
        fontFamily: 'monospace',
        color: getOrbColor(),
        marginBottom: '15px',
        marginTop: '20px',
        textAlign: 'left',
        transition: 'border-color 0.5s, color 0.5s',
        boxShadow: `0 0 20px ${getOrbColor()}20`
      }}>
        {logs.map((log, i) => (
          <div key={i} style={{ opacity: 0.6 + (i / logs.length) * 0.4 }}>{log}</div>
        ))}
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
        <button
          onClick={handleStartHost}
          style={{
            background: 'linear-gradient(135deg, rgba(0, 255, 204, 0.1), rgba(0, 255, 204, 0.2))',
            border: '1px solid #00ffcc',
            borderRadius: '8px',
            color: '#00ffcc',
            padding: '10px 20px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '14px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            transition: 'all 0.3s',
            boxShadow: '0 0 15px rgba(0, 255, 204, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 255, 204, 0.3), rgba(0, 255, 204, 0.4))';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 255, 204, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 255, 204, 0.1), rgba(0, 255, 204, 0.2))';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 255, 204, 0.2)';
          }}
        >
          🧠 Host
        </button>
        <button
          onClick={handleStartClient}
          style={{
            background: 'linear-gradient(135deg, rgba(0, 255, 204, 0.1), rgba(0, 255, 204, 0.2))',
            border: '1px solid #00ffcc',
            borderRadius: '8px',
            color: '#00ffcc',
            padding: '10px 20px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '14px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            transition: 'all 0.3s',
            boxShadow: '0 0 15px rgba(0, 255, 204, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 255, 204, 0.3), rgba(0, 255, 204, 0.4))';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 255, 204, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 255, 204, 0.1), rgba(0, 255, 204, 0.2))';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 255, 204, 0.2)';
          }}
        >
          🔌 Client
        </button>
        <button
          onClick={handleStartVoice}
          style={{
            background: 'linear-gradient(135deg, rgba(0, 255, 204, 0.1), rgba(0, 255, 204, 0.2))',
            border: '1px solid #00ffcc',
            borderRadius: '8px',
            color: '#00ffcc',
            padding: '10px 20px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '14px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            transition: 'all 0.3s',
            boxShadow: '0 0 15px rgba(0, 255, 204, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 255, 204, 0.3), rgba(0, 255, 204, 0.4))';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 255, 204, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 255, 204, 0.1), rgba(0, 255, 204, 0.2))';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 255, 204, 0.2)';
          }}
        >
          🎤 Voice
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default App;
