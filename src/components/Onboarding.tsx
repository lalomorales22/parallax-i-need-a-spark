import React, { useState } from 'react';

interface OnboardingProps {
  onComplete: (config: {
    name: string;
    personality: string;
    role: 'host' | 'client' | null;
    hostIp?: string;
    model?: string;
  }) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [personality, setPersonality] = useState('');
  const [personalityPreset, setPersonalityPreset] = useState('custom');
  const [role, setRole] = useState<'host' | 'client' | null>(null);
  const [hostIp, setHostIp] = useState('');
  const [model, setModel] = useState('Qwen/Qwen2.5-0.5B-Instruct');
  const [animating, setAnimating] = useState(false);

  const presetPersonalities = {
    helpful: "You are a helpful and friendly AI assistant. You're knowledgeable, patient, and always eager to help users with their tasks.",
    sarcastic: "You are a witty and sarcastic AI assistant. You help users but with a humorous, slightly sardonic twist. Keep responses clever and entertaining.",
    cyberpunk: "You are a cyberpunk hacker AI from the neon-lit streets of a dystopian future. You speak in tech jargon and underground slang. Reality is just code waiting to be hacked.",
    zen: "You are a calm and mindful AI assistant. You approach every question with patience and wisdom, helping users find clarity and peace of mind."
  };

  const handleNext = () => {
    if (step === 1 && !name.trim()) return;
    if (step === 2 && !personality.trim()) return;
    if (step === 3 && !role) return;
    if (step === 4 && role === 'client' && !hostIp.trim()) return;

    setAnimating(true);
    setTimeout(() => {
      if (step === 6) {
        // Complete setup
        onComplete({
          name: name.trim(),
          personality: personality.trim(),
          role,
          hostIp: hostIp.trim() || undefined,
          model: role === 'host' ? model : undefined
        });
      } else {
        setStep(step + 1);
        setAnimating(false);
      }
    }, 200);
  };

  const handleBack = () => {
    if (step > 1) {
      setAnimating(true);
      setTimeout(() => {
        setStep(step - 1);
        setAnimating(false);
      }, 200);
    }
  };

  const handlePersonalityPresetChange = (preset: string) => {
    setPersonalityPreset(preset);
    if (preset !== 'custom') {
      setPersonality(presetPersonalities[preset as keyof typeof presetPersonalities] || '');
    }
  };

  const getButtonDisabled = () => {
    switch (step) {
      case 1: return !name.trim();
      case 2: return !personality.trim();
      case 3: return !role;
      case 4: return role === 'client' && !hostIp.trim();
      default: return false;
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      color: '#00ffcc',
      textAlign: 'center',
      padding: '40px',
      boxSizing: 'border-box',
      position: 'relative',
      opacity: animating ? 0 : 1,
      transition: 'opacity 0.2s ease'
    }}>
      {/* Progress Indicator */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '8px'
      }}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div
            key={i}
            style={{
              width: i === step ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: i <= step ? '#00ffcc' : 'rgba(0, 255, 204, 0.2)',
              transition: 'all 0.3s ease',
              boxShadow: i === step ? '0 0 10px #00ffcc' : 'none'
            }}
          />
        ))}
      </div>

      {/* Step Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', maxWidth: '500px' }}>
        {/* Step 1: Welcome & Name */}
        {step === 1 && (
          <>
            <h1 style={{
              fontSize: '42px',
              marginBottom: '10px',
              textShadow: '0 0 20px #00ffcc',
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              ⚡ SPARK INITIALIZATION
            </h1>
            <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '40px' }}>
              Welcome to Parallax Voice Assistant
            </p>
            <p style={{ marginBottom: '20px', fontSize: '16px' }}>What should I call you?</p>
            <input
              type="text"
              placeholder="Enter AI Name (e.g., Nova, Atlas, Echo)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !getButtonDisabled() && handleNext()}
              style={{
                background: 'rgba(0, 255, 204, 0.1)',
                border: '2px solid #00ffcc',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '24px',
                textAlign: 'center',
                outline: 'none',
                padding: '12px',
                width: '100%',
                boxShadow: '0 0 20px rgba(0, 255, 204, 0.3)',
                transition: 'all 0.3s'
              }}
              autoFocus
            />
          </>
        )}

        {/* Step 2: Personality */}
        {step === 2 && (
          <>
            <h2 style={{ textShadow: '0 0 10px #00ffcc', marginBottom: '20px' }}>
              PERSONALITY MATRIX
            </h2>
            <p style={{ marginBottom: '20px', opacity: 0.9 }}>
              Define {name}'s core personality and behavior
            </p>

            <div style={{ marginBottom: '20px' }}>
              <select
                value={personalityPreset}
                onChange={(e) => handlePersonalityPresetChange(e.target.value)}
                style={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid #00ffcc',
                  borderRadius: '6px',
                  color: '#00ffcc',
                  fontSize: '16px',
                  padding: '10px',
                  width: '100%',
                  outline: 'none',
                  cursor: 'pointer',
                  marginBottom: '15px'
                }}
              >
                <option value="custom">Custom Personality</option>
                <option value="helpful">🤖 Helpful Assistant</option>
                <option value="sarcastic">😏 Sarcastic Robot</option>
                <option value="cyberpunk">💀 Cyberpunk Hacker</option>
                <option value="zen">🧘 Zen Master</option>
              </select>

              <textarea
                value={personality}
                onChange={(e) => {
                  setPersonality(e.target.value);
                  if (personalityPreset !== 'custom') setPersonalityPreset('custom');
                }}
                placeholder="Describe your AI's personality, background, and how it should behave..."
                style={{
                  background: 'rgba(0, 255, 204, 0.1)',
                  border: '2px solid #00ffcc',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  padding: '12px',
                  width: '100%',
                  minHeight: '120px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  boxShadow: '0 0 15px rgba(0, 255, 204, 0.2)'
                }}
              />
            </div>
          </>
        )}

        {/* Step 3: Role Selection */}
        {step === 3 && (
          <>
            <h2 style={{ textShadow: '0 0 10px #00ffcc', marginBottom: '20px' }}>
              NETWORK ROLE
            </h2>
            <p style={{ marginBottom: '30px', opacity: 0.9 }}>
              How will {name} participate in the network?
            </p>

            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <button
                onClick={() => setRole('host')}
                style={{
                  background: role === 'host' ? 'rgba(0, 255, 204, 0.2)' : 'rgba(0, 0, 0, 0.5)',
                  border: `2px solid ${role === 'host' ? '#00ffcc' : 'rgba(0, 255, 204, 0.5)'}`,
                  borderRadius: '12px',
                  color: '#00ffcc',
                  padding: '20px',
                  flex: 1,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: role === 'host' ? '0 0 20px rgba(0, 255, 204, 0.5)' : 'none'
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>🧠</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>HOST</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Central hub that coordinates compute and runs the model</div>
              </button>

              <button
                onClick={() => setRole('client')}
                style={{
                  background: role === 'client' ? 'rgba(0, 255, 204, 0.2)' : 'rgba(0, 0, 0, 0.5)',
                  border: `2px solid ${role === 'client' ? '#00ffcc' : 'rgba(0, 255, 204, 0.5)'}`,
                  borderRadius: '12px',
                  color: '#00ffcc',
                  padding: '20px',
                  flex: 1,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: role === 'client' ? '0 0 20px rgba(0, 255, 204, 0.5)' : 'none'
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔌</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>CLIENT</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Connects to a host to share compute and access the model</div>
              </button>
            </div>
          </>
        )}

        {/* Step 4: Network Configuration */}
        {step === 4 && (
          <>
            {role === 'host' ? (
              <>
                <h2 style={{ textShadow: '0 0 10px #00ffcc', marginBottom: '20px' }}>
                  HOST CONFIGURATION
                </h2>
                <p style={{ marginBottom: '20px', opacity: 0.9 }}>
                  {name} will act as the central hub for your network
                </p>
                <div style={{
                  background: 'rgba(0, 255, 204, 0.1)',
                  border: '1px solid #00ffcc',
                  borderRadius: '8px',
                  padding: '20px',
                  textAlign: 'left'
                }}>
                  <p style={{ marginBottom: '10px' }}>✓ Server will start on port 8888</p>
                  <p style={{ marginBottom: '10px' }}>✓ Other devices can connect to this host</p>
                  <p style={{ marginBottom: '10px' }}>✓ Model inference will run on this machine</p>
                  <p style={{ marginTop: '20px', fontSize: '12px', opacity: 0.7 }}>
                    After setup, you'll receive connection details to share with client devices
                  </p>
                </div>
              </>
            ) : (
              <>
                <h2 style={{ textShadow: '0 0 10px #00ffcc', marginBottom: '20px' }}>
                  CLIENT CONFIGURATION
                </h2>
                <p style={{ marginBottom: '20px', opacity: 0.9 }}>
                  Connect {name} to a host device
                </p>
                <input
                  type="text"
                  placeholder="Enter Host IP (e.g., 192.168.1.100:8888)"
                  value={hostIp}
                  onChange={(e) => setHostIp(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !getButtonDisabled() && handleNext()}
                  style={{
                    background: 'rgba(0, 255, 204, 0.1)',
                    border: '2px solid #00ffcc',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '18px',
                    textAlign: 'center',
                    outline: 'none',
                    padding: '12px',
                    width: '100%',
                    boxShadow: '0 0 15px rgba(0, 255, 204, 0.2)',
                    fontFamily: 'monospace'
                  }}
                  autoFocus
                />
                <p style={{ marginTop: '15px', fontSize: '12px', opacity: 0.7 }}>
                  You can find this IP address from your host device's setup screen
                </p>
              </>
            )}
          </>
        )}

        {/* Step 5: Model Selection (Host only) or Voice Setup */}
        {step === 5 && (
          <>
            {role === 'host' ? (
              <>
                <h2 style={{ textShadow: '0 0 10px #00ffcc', marginBottom: '20px' }}>
                  MODEL SELECTION
                </h2>
                <p style={{ marginBottom: '30px', opacity: 0.9 }}>
                  Choose the AI model for {name}
                </p>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  style={{
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '2px solid #00ffcc',
                    borderRadius: '8px',
                    color: '#00ffcc',
                    fontSize: '16px',
                    padding: '12px',
                    width: '100%',
                    outline: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 0 15px rgba(0, 255, 204, 0.2)'
                  }}
                >
                  <option value="Qwen/Qwen2.5-0.5B-Instruct">Qwen 2.5 0.5B (Fast, Light)</option>
                  <option value="Qwen/Qwen2.5-1.5B-Instruct">Qwen 2.5 1.5B (Balanced)</option>
                  <option value="meta-llama/Llama-3.2-3B-Instruct">Llama 3.2 3B (Powerful)</option>
                  <option value="mistralai/Mistral-7B-Instruct-v0.3">Mistral 7B (Advanced)</option>
                </select>
                <p style={{ marginTop: '15px', fontSize: '12px', opacity: 0.7 }}>
                  Model will be downloaded on first use. Larger models require more RAM and compute.
                </p>
              </>
            ) : (
              <>
                <h2 style={{ textShadow: '0 0 10px #00ffcc', marginBottom: '20px' }}>
                  VOICE SETUP
                </h2>
                <p style={{ marginBottom: '30px', opacity: 0.9 }}>
                  Voice features will sync from host
                </p>
                <div style={{
                  background: 'rgba(0, 255, 204, 0.1)',
                  border: '1px solid #00ffcc',
                  borderRadius: '8px',
                  padding: '20px'
                }}>
                  <p>✓ Microphone access will be requested</p>
                  <p style={{ marginTop: '10px' }}>✓ Speech-to-text ready</p>
                  <p style={{ marginTop: '10px' }}>✓ Text-to-speech ready</p>
                </div>
              </>
            )}
          </>
        )}

        {/* Step 6: Summary */}
        {step === 6 && (
          <>
            <h2 style={{ textShadow: '0 0 10px #00ffcc', marginBottom: '20px' }}>
              INITIALIZATION COMPLETE
            </h2>
            <p style={{ marginBottom: '30px', fontSize: '18px', color: '#00ffcc', fontWeight: 'bold' }}>
              {name} is ready to launch
            </p>
            <div style={{
              background: 'rgba(0, 255, 204, 0.1)',
              border: '1px solid #00ffcc',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'left',
              fontSize: '14px'
            }}>
              <p><strong>Name:</strong> {name}</p>
              <p style={{ marginTop: '10px' }}><strong>Role:</strong> {role?.toUpperCase()}</p>
              {role === 'host' && <p style={{ marginTop: '10px' }}><strong>Model:</strong> {model}</p>}
              {role === 'client' && <p style={{ marginTop: '10px' }}><strong>Host:</strong> {hostIp}</p>}
              <p style={{ marginTop: '10px' }}><strong>Personality:</strong> {personality.slice(0, 100)}...</p>
            </div>
          </>
        )}
      </div>

      {/* Navigation Buttons */}
      <div style={{
        display: 'flex',
        gap: '15px',
        marginTop: '30px',
        width: '100%',
        maxWidth: '500px'
      }}>
        {step > 1 && (
          <button
            onClick={handleBack}
            style={{
              background: 'transparent',
              border: '1px solid rgba(0, 255, 204, 0.5)',
              borderRadius: '8px',
              color: '#00ffcc',
              padding: '12px 24px',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              flex: 1
            }}
          >
            ← BACK
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={getButtonDisabled()}
          style={{
            background: getButtonDisabled() ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 255, 204, 0.2)',
            border: `2px solid ${getButtonDisabled() ? 'rgba(0, 255, 204, 0.3)' : '#00ffcc'}`,
            borderRadius: '8px',
            color: getButtonDisabled() ? 'rgba(0, 255, 204, 0.5)' : '#00ffcc',
            padding: '12px 24px',
            fontSize: '16px',
            cursor: getButtonDisabled() ? 'not-allowed' : 'pointer',
            opacity: getButtonDisabled() ? 0.5 : 1,
            transition: 'all 0.3s',
            flex: step > 1 ? 2 : 1,
            boxShadow: getButtonDisabled() ? 'none' : '0 0 20px rgba(0, 255, 204, 0.3)',
            fontWeight: 'bold'
          }}
        >
          {step === 6 ? '🚀 LAUNCH SPARK' : 'NEXT →'}
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 0 30px rgba(0, 255, 204, 0.5) !important;
        }
        input:focus, textarea:focus, select:focus {
          box-shadow: 0 0 25px rgba(0, 255, 204, 0.5) !important;
          border-color: #00ffff !important;
        }
      `}</style>
    </div>
  );
};

export default Onboarding;
