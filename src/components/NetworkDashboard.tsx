import React, { useState, useEffect } from 'react';

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

interface Model {
  model_id: string;
  name: string;
  size_mb: number;
  downloads?: number;
  likes?: number;
  description?: string;
  local_path?: string;
}

interface NetworkDashboardProps {
  onClose: () => void;
}

const NetworkDashboard: React.FC<NetworkDashboardProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'network' | 'models' | 'personality'>('network');
  const [devices, setDevices] = useState<Device[]>([]);
  const [localModels, setLocalModels] = useState<Model[]>([]);
  const [availableModels, setAvailableModels] = useState<Model[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState('');

  useEffect(() => {
    loadDevices();
    loadLocalModels();

    // Listen for device updates
    const devicesListener = (_event: any, updatedDevices: Device[]) => {
      setDevices(updatedDevices);
    };
    window.ipcRenderer.on('devices-updated', devicesListener);

    // Listen for model download progress
    const progressListener = (_event: any, progress: string) => {
      setDownloadProgress(progress);
    };
    window.ipcRenderer.on('model-download-progress', progressListener);

    const completeListener = (_event: any, _modelId: string) => {
      setDownloading(null);
      setDownloadProgress('');
      loadLocalModels();
    };
    window.ipcRenderer.on('model-download-complete', completeListener);

    return () => {
      window.ipcRenderer.off('devices-updated', devicesListener);
      window.ipcRenderer.off('model-download-progress', progressListener);
      window.ipcRenderer.off('model-download-complete', completeListener);
    };
  }, []);

  const loadDevices = async () => {
    const allDevices = await window.ipcRenderer.getAllDevices();
    setDevices(allDevices);
  };

  const loadLocalModels = async () => {
    const models = await window.ipcRenderer.getLocalModels();
    setLocalModels(models);
  };

  const browseModels = async () => {
    try {
      const models = await window.ipcRenderer.browseModels('text-generation', 15);
      setAvailableModels(models);
    } catch (error) {
      console.error('Failed to browse models:', error);
    }
  };

  const handleDownloadModel = async (modelId: string) => {
    setDownloading(modelId);
    await window.ipcRenderer.downloadModel(modelId);
  };

  const handleSetActiveModel = async (modelId: string) => {
    await window.ipcRenderer.setActiveModel(modelId);
    loadLocalModels();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#00ff00';
      case 'offline': return '#ff0000';
      default: return '#ffaa00';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.95)',
      backdropFilter: 'blur(20px)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        borderBottom: '1px solid rgba(0, 255, 204, 0.3)',
        paddingBottom: '15px'
      }}>
        <h2 style={{
          margin: 0,
          color: '#00ffcc',
          fontSize: '28px',
          fontWeight: 'bold',
          textShadow: '0 0 15px #00ffcc'
        }}>
          Network Intelligence Dashboard
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255, 0, 85, 0.2)',
            border: '1px solid #ff0055',
            borderRadius: '8px',
            color: '#ff0055',
            padding: '10px 20px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 0, 85, 0.4)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 0, 85, 0.2)'}
        >
          ✕ Close
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px'
      }}>
        {(['network', 'models', 'personality'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab
                ? 'linear-gradient(135deg, rgba(0, 255, 204, 0.3), rgba(0, 255, 204, 0.2))'
                : 'rgba(0, 255, 204, 0.1)',
              border: `1px solid ${activeTab === tab ? '#00ffcc' : 'rgba(0, 255, 204, 0.3)'}`,
              borderRadius: '8px',
              color: '#00ffcc',
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              transition: 'all 0.3s',
              boxShadow: activeTab === tab ? '0 0 20px rgba(0, 255, 204, 0.3)' : 'none'
            }}
          >
            {tab === 'network' && '🌐 Network'}
            {tab === 'models' && '🤖 Models'}
            {tab === 'personality' && '✨ Personality'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '10px'
      }}>
        {/* Network Tab */}
        {activeTab === 'network' && (
          <div>
            <h3 style={{ color: '#00ffcc', marginBottom: '15px' }}>Connected Devices</h3>
            {devices.length === 0 ? (
              <div style={{
                background: 'rgba(0, 255, 204, 0.1)',
                border: '1px solid rgba(0, 255, 204, 0.3)',
                borderRadius: '8px',
                padding: '40px',
                textAlign: 'center',
                color: '#00ffcc',
                opacity: 0.6
              }}>
                <p>No devices discovered yet.</p>
                <p style={{ fontSize: '12px', marginTop: '10px' }}>
                  Start network discovery from the main screen or setup wizard.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '15px' }}>
                {devices.map((device) => (
                  <div
                    key={device.device_id}
                    style={{
                      background: 'rgba(0, 255, 204, 0.05)',
                      border: `1px solid ${getStatusColor(device.status)}40`,
                      borderRadius: '12px',
                      padding: '20px',
                      transition: 'all 0.3s',
                      boxShadow: `0 0 15px ${getStatusColor(device.status)}20`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                      <div>
                        <h4 style={{ margin: 0, color: '#00ffcc', fontSize: '18px' }}>{device.name}</h4>
                        <span style={{
                          fontSize: '11px',
                          color: getStatusColor(device.status),
                          textTransform: 'uppercase',
                          fontWeight: 'bold',
                          letterSpacing: '1px'
                        }}>
                          ● {device.status}
                        </span>
                      </div>
                      <div style={{
                        background: device.role === 'host' ? 'rgba(255, 215, 0, 0.2)' : 'rgba(0, 255, 204, 0.2)',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: device.role === 'host' ? '#ffd700' : '#00ffcc'
                      }}>
                        {device.role?.toUpperCase() || 'UNKNOWN'}
                      </div>
                    </div>

                    <div style={{ fontSize: '12px', color: '#00ffcc', opacity: 0.8 }}>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Address:</strong> {device.address}:{device.port}
                      </div>
                      {device.model && (
                        <div style={{ marginBottom: '8px' }}>
                          <strong>Model:</strong> {device.model}
                        </div>
                      )}
                      {device.personality && (
                        <div style={{ marginBottom: '8px' }}>
                          <strong>Personality:</strong> {device.personality}
                        </div>
                      )}
                      {device.cpu_percent !== undefined && (
                        <div style={{ marginBottom: '8px' }}>
                          <strong>CPU:</strong> {device.cpu_percent.toFixed(1)}% | <strong>RAM:</strong> {device.memory_percent?.toFixed(1)}%
                        </div>
                      )}
                      {device.gpu_info && (
                        <div style={{ marginBottom: '8px' }}>
                          <strong>GPU:</strong> {device.gpu_info}
                        </div>
                      )}
                      <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '10px' }}>
                        Last seen: {new Date(device.last_seen).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Models Tab */}
        {activeTab === 'models' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: '#00ffcc', margin: 0 }}>Model Library</h3>
              <button
                onClick={browseModels}
                disabled={availableModels.length > 0}
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 255, 204, 0.2), rgba(0, 255, 204, 0.3))',
                  border: '1px solid #00ffcc',
                  borderRadius: '8px',
                  color: '#00ffcc',
                  padding: '10px 20px',
                  cursor: availableModels.length > 0 ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  opacity: availableModels.length > 0 ? 0.5 : 1
                }}
              >
                {availableModels.length > 0 ? '✓ Loaded' : '🔍 Browse HuggingFace'}
              </button>
            </div>

            {/* Local Models */}
            <div style={{ marginBottom: '30px' }}>
              <h4 style={{ color: '#00ffcc', fontSize: '16px', marginBottom: '15px' }}>📦 Local Models</h4>
              {localModels.length === 0 ? (
                <div style={{
                  background: 'rgba(0, 255, 204, 0.1)',
                  border: '1px solid rgba(0, 255, 204, 0.3)',
                  borderRadius: '8px',
                  padding: '20px',
                  textAlign: 'center',
                  color: '#00ffcc',
                  opacity: 0.6
                }}>
                  No models downloaded yet.
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '10px' }}>
                  {localModels.map((model: any) => (
                    <div
                      key={model.model_id}
                      style={{
                        background: 'rgba(0, 255, 204, 0.05)',
                        border: '1px solid rgba(0, 255, 204, 0.3)',
                        borderRadius: '8px',
                        padding: '15px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ color: '#00ffcc', fontWeight: 'bold', marginBottom: '5px' }}>
                          {model.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#00ffcc', opacity: 0.7 }}>
                          {model.size_mb} MB {model.is_active ? '• ACTIVE' : ''}
                        </div>
                      </div>
                      {!model.is_active && (
                        <button
                          onClick={() => handleSetActiveModel(model.model_id)}
                          style={{
                            background: 'rgba(0, 255, 204, 0.2)',
                            border: '1px solid #00ffcc',
                            borderRadius: '6px',
                            color: '#00ffcc',
                            padding: '8px 16px',
                            cursor: 'pointer',
                            fontSize: '11px'
                          }}
                        >
                          Set Active
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Available Models */}
            {availableModels.length > 0 && (
              <div>
                <h4 style={{ color: '#00ffcc', fontSize: '16px', marginBottom: '15px' }}>🌐 Available Models</h4>
                <div style={{ display: 'grid', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
                  {availableModels.map((model) => (
                    <div
                      key={model.model_id}
                      style={{
                        background: 'rgba(0, 255, 204, 0.05)',
                        border: '1px solid rgba(0, 255, 204, 0.2)',
                        borderRadius: '8px',
                        padding: '15px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: '#00ffcc', fontWeight: 'bold', marginBottom: '5px' }}>
                            {model.name}
                          </div>
                          <div style={{ fontSize: '10px', color: '#00ffcc', opacity: 0.6, marginBottom: '8px' }}>
                            {model.model_id}
                          </div>
                          {model.description && (
                            <div style={{ fontSize: '11px', color: '#00ffcc', opacity: 0.8, marginBottom: '10px' }}>
                              {model.description}
                            </div>
                          )}
                          <div style={{ fontSize: '11px', color: '#00ffcc', opacity: 0.7 }}>
                            {model.size_mb > 0 && `${model.size_mb.toFixed(0)} MB`}
                            {model.downloads && ` • ${model.downloads.toLocaleString()} downloads`}
                            {model.likes && ` • ${model.likes} likes`}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadModel(model.model_id)}
                          disabled={downloading === model.model_id}
                          style={{
                            background: downloading === model.model_id
                              ? 'rgba(255, 255, 0, 0.2)'
                              : 'linear-gradient(135deg, rgba(0, 255, 204, 0.2), rgba(0, 255, 204, 0.3))',
                            border: '1px solid #00ffcc',
                            borderRadius: '6px',
                            color: '#00ffcc',
                            padding: '8px 16px',
                            cursor: downloading === model.model_id ? 'not-allowed' : 'pointer',
                            fontSize: '11px',
                            whiteSpace: 'nowrap',
                            marginLeft: '15px'
                          }}
                        >
                          {downloading === model.model_id ? '⏳ Downloading...' : '⬇️ Download'}
                        </button>
                      </div>
                      {downloading === model.model_id && downloadProgress && (
                        <div style={{
                          marginTop: '10px',
                          fontSize: '10px',
                          color: '#ffaa00',
                          padding: '8px',
                          background: 'rgba(255, 170, 0, 0.1)',
                          borderRadius: '4px'
                        }}>
                          {downloadProgress}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Personality Tab */}
        {activeTab === 'personality' && (
          <div style={{
            background: 'rgba(0, 255, 204, 0.05)',
            border: '1px solid rgba(0, 255, 204, 0.3)',
            borderRadius: '12px',
            padding: '30px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#00ffcc', marginBottom: '15px' }}>✨ Personality Editor</h3>
            <p style={{ color: '#00ffcc', opacity: 0.7, marginBottom: '20px' }}>
              Customize your AI's personality, backstory, and traits.
            </p>
            <p style={{ color: '#00ffcc', opacity: 0.5, fontSize: '14px' }}>
              Coming soon in this phase...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkDashboard;
