import React, { useState } from 'react';

interface OnboardingProps {
  onComplete: (name: string, personality: string) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [personality, setPersonality] = useState('Helpful Assistant');

  const handleNext = () => {
    if (step === 1 && name.trim()) {
      setStep(2);
    } else if (step === 2) {
      onComplete(name, personality);
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
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      {step === 1 && (
        <>
          <h2 style={{ textShadow: '0 0 10px #00ffcc' }}>INITIALIZING...</h2>
          <p>Identify yourself, Assistant.</p>
          <input
            type="text"
            placeholder="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: '2px solid #00ffcc',
              color: '#fff',
              fontSize: '24px',
              textAlign: 'center',
              outline: 'none',
              marginTop: '20px',
              width: '80%'
            }}
            autoFocus
          />
        </>
      )}

      {step === 2 && (
        <>
          <h2 style={{ textShadow: '0 0 10px #00ffcc' }}>PERSONALITY PROTOCOL</h2>
          <p>Define your core directive.</p>
          <select
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            style={{
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid #00ffcc',
              color: '#00ffcc',
              fontSize: '18px',
              padding: '10px',
              marginTop: '20px',
              outline: 'none',
              width: '80%'
            }}
          >
            <option value="Helpful Assistant">Helpful Assistant</option>
            <option value="Sarcastic Robot">Sarcastic Robot</option>
            <option value="Cyberpunk Hacker">Cyberpunk Hacker</option>
            <option value="Zen Master">Zen Master</option>
          </select>
        </>
      )}

      <button
        onClick={handleNext}
        disabled={step === 1 && !name.trim()}
        style={{
          marginTop: '40px',
          background: 'transparent',
          border: '1px solid #00ffcc',
          color: '#00ffcc',
          padding: '10px 30px',
          fontSize: '16px',
          cursor: 'pointer',
          opacity: (step === 1 && !name.trim()) ? 0.5 : 1,
          transition: 'all 0.3s'
        }}
      >
        {step === 2 ? 'INITIALIZE' : 'NEXT >'}
      </button>
      
      <style>{`
        button:hover:not(:disabled) {
          background: #00ffcc !important;
          color: #000 !important;
          box-shadow: 0 0 15px #00ffcc;
        }
      `}</style>
    </div>
  );
};

export default Onboarding;
