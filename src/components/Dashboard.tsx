import React, { useState, useEffect } from 'react';

interface DashboardProps {
  onClose: () => void;
  logs: string[];
}

const Dashboard: React.FC<DashboardProps> = ({ onClose, logs }) => {
  const [activeTab, setActiveTab] = useState('ANALYTICS');
  const [history, setHistory] = useState<{role: string, content: string}[]>([]);

  useEffect(() => {
      // Mock fetching history
      // In a real app, we'd call window.ipcRenderer.invoke('get-history')
      setHistory([
          { role: 'user', content: 'Hello Spark' },
          { role: 'assistant', content: 'Greetings. Systems online.' }
      ]);
  }, []);

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.95)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      boxSizing: 'border-box',
      color: '#00ffcc',
      fontFamily: 'monospace'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, textShadow: '0 0 10px #00ffcc' }}>SYSTEM DASHBOARD</h2>
        <button 
          onClick={onClose}
          style={{
            background: 'transparent',
            border: '1px solid #ff0055',
            color: '#ff0055',
            cursor: 'pointer',
            padding: '5px 10px'
          }}
        >
          CLOSE
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {['ANALYTICS', 'LOGS', 'HISTORY'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab ? '#00ffcc' : 'transparent',
              color: activeTab === tab ? '#000' : '#00ffcc',
              border: '1px solid #00ffcc',
              padding: '5px 15px',
              cursor: 'pointer'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #333', padding: '10px' }}>
        {activeTab === 'ANALYTICS' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ border: '1px solid #333', padding: '10px' }}>
              <h3>COMPUTE LOAD</h3>
              <div style={{ width: '100%', height: '20px', background: '#333' }}>
                <div style={{ width: '75%', height: '100%', background: '#00ffcc', boxShadow: '0 0 10px #00ffcc' }}></div>
              </div>
              <p>75% - OPTIMAL</p>
            </div>
            <div style={{ border: '1px solid #333', padding: '10px' }}>
              <h3>NETWORK LATENCY</h3>
              <div style={{ width: '100%', height: '20px', background: '#333' }}>
                <div style={{ width: '12%', height: '100%', background: '#00ff00' }}></div>
              </div>
              <p>12ms - EXCELLENT</p>
            </div>
            <div style={{ border: '1px solid #333', padding: '10px' }}>
              <h3>TOKEN SPEED</h3>
              <h1>45 T/s</h1>
            </div>
            <div style={{ border: '1px solid #333', padding: '10px' }}>
              <h3>ACTIVE NODES</h3>
              <h1>3</h1>
            </div>
          </div>
        )}

        {activeTab === 'LOGS' && (
          <div style={{ fontSize: '12px' }}>
            {logs.map((log, i) => (
              <div key={i} style={{ marginBottom: '2px' }}>{log}</div>
            ))}
          </div>
        )}

        {activeTab === 'HISTORY' && (
          <div>
            {history.map((msg, i) => (
              <div key={i} style={{ marginBottom: '10px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                <span style={{ 
                    background: msg.role === 'user' ? '#333' : '#003333',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    color: msg.role === 'user' ? '#fff' : '#00ffcc'
                }}>
                    {msg.content}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
