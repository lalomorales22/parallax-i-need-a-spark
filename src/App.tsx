import React, { useState, useEffect } from 'react';
import AsciiOrb from './components/AsciiOrb';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';

function App() {
  const [status, setStatus] = useState('IDLE');
  const [assistantName, setAssistantName] = useState('Spark');
  const [logs, setLogs] = useState<string[]>([]);
  const [isSetup, setIsSetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDashboard, setShowDashboard] = useState(false);

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
          if (name) setAssistantName(name);
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

  const handleOnboardingComplete = async (name: string, personality: string) => {
    await window.ipcRenderer.saveSetting('assistant_name', name);
    await window.ipcRenderer.saveSetting('assistant_personality', personality);
    await window.ipcRenderer.saveSetting('setup_complete', 'true');
    setAssistantName(name);
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

  // Determine animation speed
  const getAnimationSpeed = () => {
    switch (status) {
      case 'LISTENING': return '5s';
      case 'THINKING': return '0.5s'; // Fast spin
      case 'SPEAKING': return '2s'; // Pulse-like
      default: return '10s';
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
        background: 'rgba(0, 0, 0, 0.9)',
        borderRadius: '50%',
        border: '2px solid #00ffcc',
        boxShadow: '0 0 20px #00ffcc',
        position: 'relative',
        overflow: 'hidden'
      }}>
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
            zIndex: 10
          }}
        >
          X
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
      background: 'rgba(0, 0, 0, 0.8)', // Semi-transparent background
      borderRadius: '50%', // Circular UI
      border: `2px solid ${getOrbColor()}`,
      boxShadow: `0 0 20px ${getOrbColor()}`,
      position: 'relative',
      transition: 'border-color 0.5s, box-shadow 0.5s'
    }}>
      {/* Close Button */}
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
          zIndex: 10
        }}
      >
        X
      </button>

      {/* Dashboard Toggle */}
      <button
        onClick={() => setShowDashboard(true)}
        style={{
          position: 'absolute',
          top: '25px',
          left: '40px',
          background: 'none',
          border: '1px solid #00ffcc',
          color: '#00ffcc',
          fontSize: '10px',
          cursor: 'pointer',
          padding: '2px 5px',
          zIndex: 10
        }}
      >
        DASHBOARD
      </button>

      {showDashboard && <Dashboard onClose={() => setShowDashboard(false)} logs={logs} />}

      {/* ASCII Orb */}
      <AsciiOrb status={status} color={getOrbColor()} />

      <h1 style={{ margin: '0 0 10px 0', textShadow: `0 0 10px ${getOrbColor()}`, color: getOrbColor() }}>{assistantName}</h1>
      <p style={{ fontSize: '12px', opacity: 0.8, color: getOrbColor() }}>STATUS: {status}</p>

      {/* Log Output */}
      <div style={{
        width: '80%',
        height: '100px',
        overflowY: 'auto',
        background: 'rgba(0,0,0,0.5)',
        border: `1px solid ${getOrbColor()}`,
        borderRadius: '4px',
        padding: '5px',
        fontSize: '10px',
        fontFamily: 'monospace',
        color: getOrbColor(),
        marginBottom: '10px',
        textAlign: 'left',
        transition: 'border-color 0.5s, color 0.5s'
      }}>
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button
          onClick={handleStartHost}
          style={{
            background: 'transparent',
            border: '1px solid #00ffcc',
            color: '#00ffcc',
            padding: '8px 16px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            transition: 'all 0.3s'
          }}
        >
          Host
        </button>
        <button
          onClick={handleStartClient}
          style={{
            background: 'transparent',
            border: '1px solid #00ffcc',
            color: '#00ffcc',
            padding: '8px 16px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            transition: 'all 0.3s'
          }}
        >
          Client
        </button>
        <button
          onClick={handleStartVoice}
          style={{
            background: 'transparent',
            border: '1px solid #00ffcc',
            color: '#00ffcc',
            padding: '8px 16px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            transition: 'all 0.3s'
          }}
        >
          Voice
        </button>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        button:hover {
          background: #00ffcc !important;
          color: #000 !important;
          box-shadow: 0 0 15px #00ffcc;
        }
      `}</style>
    </div>
  );
}

export default App;
