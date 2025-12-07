import { useState, useEffect, useMemo, useCallback } from 'react';
import AsciiOrb from './components/AsciiOrb';
import Onboarding from './components/Onboarding';
import UnifiedDashboard from './components/UnifiedDashboard';
import type { VisualizationSettings, WaveType, SymmetryMode, CharacterSet, ColorPreset } from './types/visualization';
import { defaultVisualizationSettings } from './types/visualization';

function App() {
  const [status, setStatus] = useState('IDLE');
  const [assistantName, setAssistantName] = useState('Spark');
  const [logs, setLogs] = useState<string[]>([]);
  const [isSetup, setIsSetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDashboard, setShowDashboard] = useState(false);
  const [vizSettings, setVizSettings] = useState<VisualizationSettings>(defaultVisualizationSettings);
  const [currentDeviceId, setCurrentDeviceId] = useState('');
  const [autoListen, setAutoListen] = useState(false);

  useEffect(() => {
    // Check if setup is complete
    if (!window.ipcRenderer) {
      console.error('ipcRenderer is not available');
      setLogs(prev => [...prev, 'ERROR: ipcRenderer is not available. Preload script might have failed.']);
      setLoading(false);
      return;
    }

    window.ipcRenderer.getSetting('setup_complete').then(async (val) => {
      if (val === 'true') {
        setIsSetup(true);
        // Load name
        const name = await window.ipcRenderer.getSetting('assistant_name');
        if (name) {
          setAssistantName(name);
          setCurrentDeviceId(name); // Use assistant name as device ID
        }

        // Load visualization settings
        const settingsStr = await window.ipcRenderer.getSetting('viz_settings');
        if (settingsStr) {
          try {
            const loadedSettings = JSON.parse(settingsStr);
            setVizSettings({ ...defaultVisualizationSettings, ...loadedSettings });
          } catch (e) {
            console.error('Failed to parse viz settings:', e);
          }
        }

        // Auto-start network discovery AND Parallax processes if SPARK_MODE is set
        try {
          const sparkMode = await window.ipcRenderer.invoke('get-spark-mode');
          if (sparkMode === 'host' || sparkMode === 'client') {
            console.log(`Auto-starting services as ${sparkMode}...`);
            const personality = await window.ipcRenderer.getSetting('assistant_personality') || '';
            const model = await window.ipcRenderer.getSetting('model') || 'Qwen/Qwen3-0.6B';

            // Start Network Discovery
            await window.ipcRenderer.startNetworkDiscovery(name || 'Spark', sparkMode, personality, model);
            console.log('Network discovery started automatically');

            // Start Parallax Process (Client only - Host is handled by run-host.sh)
            if (sparkMode === 'client') {
              const res = await window.ipcRenderer.startClient();
              setLogs(prev => [...prev, res]);
            }
          }
        } catch (e) {
          console.error('Failed to auto-start services:', e);
        }
      }
      setLoading(false);
    });

    // Listen for logs
    const logListener = (_event: any, message: string) => {
      setLogs(prev => [...prev.slice(-19), message]); // Keep last 20 lines
    };
    window.ipcRenderer.on('log-update', logListener);

    // Listen for state updates
    const stateListener = (_event: any, newState: string) => {
      setStatus(newState);
    };
    window.ipcRenderer.on('state-update', stateListener);

    return () => {
      window.ipcRenderer.off('log-update', logListener);
      window.ipcRenderer.off('state-update', stateListener);
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

    // Start network discovery as host
    try {
      const personality = await window.ipcRenderer.getSetting('assistant_personality') || '';
      const model = await window.ipcRenderer.getSetting('model') || 'Qwen/Qwen3-0.6B';
      await window.ipcRenderer.startNetworkDiscovery(assistantName, 'host', personality, model);
      setLogs(prev => [...prev, 'Network discovery started (host mode)']);
    } catch (e) {
      console.error('Failed to start network discovery:', e);
    }
  };

  const handleStartClient = async () => {
    setStatus('STARTING CLIENT...');
    const res = await window.ipcRenderer.startClient();
    setLogs(prev => [...prev, res]);

    // Start network discovery as client
    try {
      const personality = await window.ipcRenderer.getSetting('assistant_personality') || '';
      const model = await window.ipcRenderer.getSetting('model') || '';
      await window.ipcRenderer.startNetworkDiscovery(assistantName, 'client', personality, model);
      setLogs(prev => [...prev, 'Network discovery started (client mode)']);
    } catch (e) {
      console.error('Failed to start network discovery:', e);
    }
  };

  const handleStartVoice = async () => {
    setStatus('STARTING VOICE...');
    const res = await window.ipcRenderer.startVoice();
    setLogs(prev => [...prev, res]);
  };

  const handleStopVoice = async () => {
    setStatus('STOPPING VOICE...');
    const res = await window.ipcRenderer.stopVoice();
    setLogs(prev => [...prev, res]);
    setAutoListen(false);
  };

  const handleClose = () => {
    window.ipcRenderer.closeApp();
  };

  const handleSettingsChange = (newSettings: VisualizationSettings) => {
    setVizSettings(newSettings);
    // Save to localStorage/database
    window.ipcRenderer.saveSetting('viz_settings', JSON.stringify(newSettings));
  };

  const randomizeVisualization = useCallback(() => {
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
  }, []);

  // Determine orb color based on status (memoized for performance)
  const getOrbColor = useMemo(() => {
    switch (status) {
      case 'LISTENING': return '#00ff00'; // Green
      case 'THINKING': return '#ffff00'; // Yellow
      case 'SPEAKING': return '#ff00ff'; // Magenta
      case 'IDLE': return '#00ffcc'; // Cyan
      default: return '#00ffcc';
    }
  }, [status]);

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
        background: `radial-gradient(circle at 50% 50%, ${getOrbColor}15 0%, transparent 60%)`,
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

      {/* Settings Gear Icon - Opens Unified Dashboard */}
      <button
        onClick={() => setShowDashboard(!showDashboard)}
        style={{
          position: 'absolute',
          top: '20px',
          right: '70px',
          background: showDashboard ? 'rgba(0, 255, 204, 0.3)' : 'rgba(0, 255, 204, 0.2)',
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
          boxShadow: showDashboard ? '0 0 25px rgba(0, 255, 204, 0.5)' : '0 0 15px rgba(0, 255, 204, 0.3)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0, 255, 204, 0.4)';
          e.currentTarget.style.transform = 'rotate(90deg) scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = showDashboard ? 'rgba(0, 255, 204, 0.3)' : 'rgba(0, 255, 204, 0.2)';
          e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
        }}
      >
        ⚙️
      </button>

      {/* Unified Dashboard */}
      <UnifiedDashboard
        isOpen={showDashboard}
        onClose={() => setShowDashboard(false)}
        settings={vizSettings}
        onSettingsChange={handleSettingsChange}
        onRandomize={randomizeVisualization}
        logs={logs}
        currentDeviceId={currentDeviceId}
        onStartHost={handleStartHost}
        onStartClient={handleStartClient}
        onStartVoice={handleStartVoice}
        onStopVoice={handleStopVoice}
        autoListen={autoListen}
        onAutoListenChange={setAutoListen}
      />

      {/* ASCII Orb */}
      <AsciiOrb status={status} color={status !== 'IDLE' ? getOrbColor : undefined} settings={vizSettings} />

      <h1 style={{
        margin: '0 0 10px 0',
        textShadow: `0 0 15px ${getOrbColor}`,
        color: getOrbColor,
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
        color: getOrbColor,
        textShadow: `0 0 10px ${getOrbColor}`,
        letterSpacing: '2px',
        transition: 'all 0.5s ease'
      }}>
        STATUS: {status}
      </p>

      {/* Auto Listen Toggle */}
      <button
        onClick={() => {
          setAutoListen(!autoListen);
          if (!autoListen) {
            handleStartVoice();
          }
        }}
        style={{
          marginTop: '20px',
          background: autoListen
            ? 'linear-gradient(135deg, rgba(0, 255, 100, 0.3), rgba(0, 255, 204, 0.3))'
            : 'linear-gradient(135deg, rgba(0, 255, 204, 0.1), rgba(0, 255, 204, 0.2))',
          border: `2px solid ${autoListen ? '#00ff64' : '#00ffcc'}`,
          borderRadius: '30px',
          color: autoListen ? '#00ff64' : '#00ffcc',
          padding: '14px 28px',
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: '16px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          transition: 'all 0.3s',
          boxShadow: autoListen
            ? '0 0 30px rgba(0, 255, 100, 0.5)'
            : '0 0 15px rgba(0, 255, 204, 0.3)',
          animation: autoListen ? 'pulse 2s ease-in-out infinite' : 'none'
        }}
      >
        {autoListen ? '🎤 LISTENING...' : '🎤 TAP TO SPEAK'}
      </button>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.8; box-shadow: 0 0 20px rgba(0, 255, 100, 0.4); }
          50% { opacity: 1; box-shadow: 0 0 40px rgba(0, 255, 100, 0.7); }
        }
      `}</style>
    </div>
  );
}

export default App;
