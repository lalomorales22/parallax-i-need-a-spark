import React, { useEffect, useRef } from 'react';

interface AsciiOrbProps {
  status: string;
  color: string;
}

const AsciiOrb: React.FC<AsciiOrbProps> = ({ status, color }) => {
  const preRef = useRef<HTMLPreElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Initialize Audio
  useEffect(() => {
    const initAudio = async () => {
      if (audioContextRef.current) return;
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 64; // Low resolution for ASCII
        sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
        sourceRef.current.connect(analyserRef.current);
        dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      } catch (err) {
        console.warn("Microphone access denied or error:", err);
      }
    };

    // Only init audio if we are listening or just once at start
    initAudio();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  // Animation Loop
  useEffect(() => {
    let animationFrameId: number;
    let angleX = 0;
    let angleY = 0;
    let time = 0;

    const render = () => {
      if (!preRef.current) return;

      // 1. Get Audio Data
      let audioLevel = 0;
      if (analyserRef.current && dataArrayRef.current) {
        // Cast to any to bypass the strict ArrayBuffer vs SharedArrayBuffer check in some TS configs
        analyserRef.current.getByteFrequencyData(dataArrayRef.current as any);
        const sum = dataArrayRef.current.reduce((a, b) => a + b, 0);
        audioLevel = sum / dataArrayRef.current.length; // 0 - 255
      }

      // 2. Determine Animation Parameters based on Status
      let rotationSpeed = 0.02;
      let radiusBase = 10;
      let radiusJitter = 0;
      let charSet = ['.', ',', '*', 'o', 'O', '@'];

      switch (status) {
        case 'LISTENING':
          rotationSpeed = 0.02;
          // React strongly to audio
          radiusJitter = (audioLevel / 255) * 5; 
          charSet = ['.', ':', '|', 'I', 'X', '#'];
          break;
        case 'THINKING':
          rotationSpeed = 0.15; // Fast spin
          radiusJitter = Math.sin(time * 0.5) * 2;
          charSet = ['/', '-', '\\', '|', '+', 'x'];
          break;
        case 'SPEAKING':
          rotationSpeed = 0.03;
          // Pulse rhythmically
          radiusJitter = Math.sin(time * 0.2) * 3;
          charSet = ['.', 'o', 'O', '0', '@', '#'];
          break;
        case 'IDLE':
        default:
          rotationSpeed = 0.01;
          radiusJitter = Math.sin(time * 0.05) * 1; // Slow breathe
          charSet = ['.', ',', '*', 'o', 'O', '@'];
          break;
      }

      angleX += rotationSpeed;
      angleY += rotationSpeed * 0.5;
      time += 1;

      // 3. Render ASCII Sphere
      const width = 60;
      const height = 28;
      const buffer = new Array(width * height).fill(' ');
      const zBuffer = new Array(width * height).fill(-Infinity);
      
      const K1 = 30; // Projection distance
      
      const r = radiusBase + radiusJitter;

      // Iterate over sphere surface
      // Decrease step for higher density
      for (let lat = 0; lat < Math.PI; lat += 0.15) {
        for (let lon = 0; lon < 2 * Math.PI; lon += 0.15) {
          const cx = r * Math.sin(lat) * Math.cos(lon);
          const cy = r * Math.sin(lat) * Math.sin(lon);
          const cz = r * Math.cos(lat);

          // Rotate
          const x1 = cx;
          const y1 = cy * Math.cos(angleX) - cz * Math.sin(angleX);
          const z1 = cy * Math.sin(angleX) + cz * Math.cos(angleX);

          const x2 = x1 * Math.cos(angleY) - z1 * Math.sin(angleY);
          const y2 = y1;
          const z2 = x1 * Math.sin(angleY) + z1 * Math.cos(angleY);

          // Project to 2D
          const ooz = 1 / (z2 + 60); // Depth offset
          const xp = Math.floor(width / 2 + K1 * ooz * x2 * 2);
          const yp = Math.floor(height / 2 - K1 * ooz * y2);

          const idx = xp + yp * width;
          if (idx >= 0 && idx < width * height) {
            if (ooz > zBuffer[idx]) {
              zBuffer[idx] = ooz;
              // Select char based on depth (z2)
              // z2 ranges roughly from -r to r
              const luminance = Math.floor(((z2 + r) / (2 * r)) * (charSet.length - 1));
              const charIdx = Math.max(0, Math.min(charSet.length - 1, luminance));
              buffer[idx] = charSet[charIdx];
            }
          }
        }
      }

      // 4. Output to DOM
      let output = '';
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          output += buffer[x + y * width];
        }
        output += '\n';
      }
      
      preRef.current.innerText = output;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [status]);

  return (
    <pre
      ref={preRef}
      style={{
        color: color,
        fontFamily: '"Courier New", Courier, monospace',
        fontSize: '10px',
        lineHeight: '10px',
        fontWeight: 'bold',
        textShadow: `0 0 5px ${color}`,
        margin: '20px 0',
        userSelect: 'none',
        pointerEvents: 'none' // Let clicks pass through if needed
      }}
    />
  );
};

export default AsciiOrb;
