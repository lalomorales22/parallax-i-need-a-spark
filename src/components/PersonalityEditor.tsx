import React, { useState, useEffect } from 'react';

interface PersonalityEditorProps {
  deviceId: string;
  onClose: () => void;
  onSave: () => void;
}

interface Personality {
  id?: number;
  device_id: string;
  name: string;
  backstory: string;
  traits: string;
  voice_settings: string;
  system_prompt: string;
}

const PersonalityEditor: React.FC<PersonalityEditorProps> = ({ deviceId, onClose, onSave }) => {
  const [personality, setPersonality] = useState<Personality>({
    device_id: deviceId,
    name: '',
    backstory: '',
    traits: '',
    voice_settings: '',
    system_prompt: ''
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPersonality();
  }, [deviceId]);

  const loadPersonality = async () => {
    try {
      const existing = await window.ipcRenderer.getPersonality(deviceId);
      if (existing) {
        setPersonality(existing);
      }
    } catch (error) {
      console.error('Failed to load personality:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (personality.id) {
        await window.ipcRenderer.updatePersonality(personality.id, {
          name: personality.name,
          backstory: personality.backstory,
          traits: personality.traits,
          voice_settings: personality.voice_settings,
          system_prompt: personality.system_prompt
        });
      } else {
        await window.ipcRenderer.savePersonality(personality);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save personality:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const traitPresets = [
    { name: 'Formal', value: 'formal, professional, precise' },
    { name: 'Casual', value: 'casual, friendly, relaxed' },
    { name: 'Humorous', value: 'humorous, witty, playful' },
    { name: 'Technical', value: 'technical, detailed, analytical' },
    { name: 'Creative', value: 'creative, imaginative, artistic' },
    { name: 'Empathetic', value: 'empathetic, supportive, understanding' }
  ];

  const inputStyle = {
    width: '100%',
    background: 'rgba(0, 0, 0, 0.6)',
    border: '1px solid rgba(0, 255, 204, 0.3)',
    borderRadius: '8px',
    padding: '12px',
    color: '#00ffcc',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'all 0.3s',
    resize: 'vertical' as const
  };

  const labelStyle = {
    display: 'block',
    color: '#00ffcc',
    fontSize: '14px',
    fontWeight: 'bold' as const,
    marginBottom: '8px',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px'
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
      zIndex: 2000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(0, 20, 40, 0.9))',
        border: '1px solid rgba(0, 255, 204, 0.3)',
        borderRadius: '16px',
        padding: '30px',
        maxWidth: '700px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 0 40px rgba(0, 255, 204, 0.2)'
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
            color: '#00ffcc',
            fontSize: '24px',
            fontWeight: 'bold',
            textShadow: '0 0 15px #00ffcc'
          }}>
            ✨ Personality Editor
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#ff0055',
              fontSize: '24px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Name */}
          <div>
            <label style={labelStyle}>AI Name</label>
            <input
              type="text"
              value={personality.name}
              onChange={(e) => setPersonality({ ...personality, name: e.target.value })}
              placeholder="e.g., Atlas, Nova, Echo..."
              style={inputStyle}
              onFocus={(e) => e.currentTarget.style.borderColor = '#00ffcc'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0, 255, 204, 0.3)'}
            />
          </div>

          {/* Backstory */}
          <div>
            <label style={labelStyle}>Backstory</label>
            <textarea
              value={personality.backstory}
              onChange={(e) => setPersonality({ ...personality, backstory: e.target.value })}
              placeholder="Tell the story of who this AI is, where they come from, and what drives them..."
              rows={4}
              style={inputStyle}
              onFocus={(e) => e.currentTarget.style.borderColor = '#00ffcc'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0, 255, 204, 0.3)'}
            />
          </div>

          {/* Traits */}
          <div>
            <label style={labelStyle}>Personality Traits</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
              {traitPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setPersonality({ ...personality, traits: preset.value })}
                  style={{
                    background: personality.traits === preset.value
                      ? 'rgba(0, 255, 204, 0.3)'
                      : 'rgba(0, 255, 204, 0.1)',
                    border: '1px solid rgba(0, 255, 204, 0.3)',
                    borderRadius: '6px',
                    color: '#00ffcc',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 255, 204, 0.3)'}
                  onMouseLeave={(e) => {
                    if (personality.traits !== preset.value) {
                      e.currentTarget.style.background = 'rgba(0, 255, 204, 0.1)';
                    }
                  }}
                >
                  {preset.name}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={personality.traits}
              onChange={(e) => setPersonality({ ...personality, traits: e.target.value })}
              placeholder="e.g., friendly, helpful, enthusiastic"
              style={inputStyle}
              onFocus={(e) => e.currentTarget.style.borderColor = '#00ffcc'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0, 255, 204, 0.3)'}
            />
          </div>

          {/* System Prompt */}
          <div>
            <label style={labelStyle}>System Prompt</label>
            <textarea
              value={personality.system_prompt}
              onChange={(e) => setPersonality({ ...personality, system_prompt: e.target.value })}
              placeholder="You are a helpful AI assistant..."
              rows={3}
              style={inputStyle}
              onFocus={(e) => e.currentTarget.style.borderColor = '#00ffcc'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0, 255, 204, 0.3)'}
            />
          </div>

          {/* Voice Settings (JSON) */}
          <div>
            <label style={labelStyle}>Voice Settings (JSON)</label>
            <textarea
              value={personality.voice_settings}
              onChange={(e) => setPersonality({ ...personality, voice_settings: e.target.value })}
              placeholder='{"rate": 1.0, "pitch": 1.0, "volume": 1.0}'
              rows={3}
              style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '12px' }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#00ffcc'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0, 255, 204, 0.3)'}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          marginTop: '25px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(0, 255, 204, 0.3)'
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 0, 85, 0.2)',
              border: '1px solid #ff0055',
              borderRadius: '8px',
              color: '#ff0055',
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 0, 85, 0.4)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 0, 85, 0.2)'}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !personality.name}
            style={{
              background: 'linear-gradient(135deg, rgba(0, 255, 204, 0.3), rgba(0, 255, 204, 0.4))',
              border: '1px solid #00ffcc',
              borderRadius: '8px',
              color: '#00ffcc',
              padding: '12px 24px',
              cursor: isSaving || !personality.name ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'all 0.3s',
              opacity: isSaving || !personality.name ? 0.5 : 1,
              boxShadow: '0 0 20px rgba(0, 255, 204, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (!isSaving && personality.name) {
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {isSaving ? '💾 Saving...' : '💾 Save Personality'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonalityEditor;
