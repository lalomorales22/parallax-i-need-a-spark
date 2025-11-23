import React, { useEffect, useRef } from 'react';
import type { VisualizationSettings, WaveType, SymmetryMode } from '../types/visualization';
import { CHARACTER_SETS, COLOR_PRESETS, defaultVisualizationSettings } from '../types/visualization';

interface AsciiOrbProps {
  status: string;
  color?: string;
  settings?: Partial<VisualizationSettings>;
}

const AsciiOrb: React.FC<AsciiOrbProps> = ({ status, color, settings }) => {
  const preRef = useRef<HTMLPreElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Merge settings with defaults
  const vizSettings = { ...defaultVisualizationSettings, ...settings };

  // Initialize Audio
  useEffect(() => {
    const initAudio = async () => {
      if (audioContextRef.current || !vizSettings.audioReactive) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256; // Higher resolution for better frequency analysis
        sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
        sourceRef.current.connect(analyserRef.current);
        dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      } catch (err) {
        console.warn("Microphone access denied or error:", err);
      }
    };

    initAudio();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [vizSettings.audioReactive]);

  // Wave functions
  const getWaveValue = (t: number, type: WaveType): number => {
    switch (type) {
      case 'sine':
        return Math.sin(t);
      case 'sawtooth':
        return 2 * (t / (2 * Math.PI) - Math.floor(t / (2 * Math.PI) + 0.5));
      case 'square':
        return Math.sin(t) >= 0 ? 1 : -1;
      case 'triangle':
        return Math.asin(Math.sin(t)) * (2 / Math.PI);
      case 'hybrid':
        return (Math.sin(t) + Math.sin(t * 2) / 2 + Math.sin(t * 4) / 4) / 1.75;
      default:
        return Math.sin(t);
    }
  };

  // Apply symmetry transformations
  const applySymmetry = (x: number, y: number, mode: SymmetryMode): Array<[number, number]> => {
    const points: Array<[number, number]> = [[x, y]];

    switch (mode) {
      case 'radial2':
        points.push([-x, -y]);
        break;
      case 'radial4':
        points.push([-x, y], [x, -y], [-x, -y]);
        break;
      case 'radial6':
        const angle60 = Math.PI / 3;
        for (let i = 1; i < 6; i++) {
          const angle = angle60 * i;
          const nx = x * Math.cos(angle) - y * Math.sin(angle);
          const ny = x * Math.sin(angle) + y * Math.cos(angle);
          points.push([nx, ny]);
        }
        break;
      case 'radial8':
        const angle45 = Math.PI / 4;
        for (let i = 1; i < 8; i++) {
          const angle = angle45 * i;
          const nx = x * Math.cos(angle) - y * Math.sin(angle);
          const ny = x * Math.sin(angle) + y * Math.cos(angle);
          points.push([nx, ny]);
        }
        break;
      case 'bilateral':
        points.push([-x, y]);
        break;
      case 'kaleidoscope':
        // Combine radial and bilateral
        points.push([-x, y], [-x, -y], [x, -y]);
        const angle90 = Math.PI / 2;
        for (let i = 1; i < 4; i++) {
          const angle = angle90 * i;
          const nx = x * Math.cos(angle) - y * Math.sin(angle);
          const ny = x * Math.sin(angle) + y * Math.cos(angle);
          points.push([nx, ny], [-nx, ny]);
        }
        break;
      case 'none':
      default:
        // No symmetry
        break;
    }

    return points;
  };

  // Get color based on preset
  const getColor = (): string => {
    if (color) return color; // Override with prop color

    const preset = COLOR_PRESETS[vizSettings.colorPreset];
    if (typeof preset === 'string') {
      if (preset === 'rainbow') {
        // Will be handled in render loop
        return '#00ffcc';
      }
      return preset;
    }
    // Gradient - return first color for now
    return preset[0];
  };

  // Animation Loop
  useEffect(() => {
    let animationFrameId: number;
    let angleX = 0;
    let angleY = 0;
    let angleZ = 0;
    let time = 0;
    let hue = 0; // For rainbow mode

    const render = () => {
      if (!preRef.current) return;

      // 1. Get Audio Data
      let bassLevel = 0;
      let midLevel = 0;
      let highLevel = 0;

      if (analyserRef.current && dataArrayRef.current && vizSettings.audioReactive) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current as any);

        // Split into frequency bands
        const third = Math.floor(dataArrayRef.current.length / 3);
        bassLevel = dataArrayRef.current.slice(0, third).reduce((a, b) => a + b, 0) / third / 255;
        midLevel = dataArrayRef.current.slice(third, third * 2).reduce((a, b) => a + b, 0) / third / 255;
        highLevel = dataArrayRef.current.slice(third * 2).reduce((a, b) => a + b, 0) / third / 255;

        // Apply sensitivity
        const sensitivity = vizSettings.audioSensitivity / 50; // 0-2 range
        bassLevel *= sensitivity;
        midLevel *= sensitivity;
        highLevel *= sensitivity;
      }

      // 2. Determine Animation Parameters based on Status
      let baseRotationSpeed = (vizSettings.rotationSpeed / 100) * 0.02;
      let radiusBase = 10;
      let radiusJitter = 0;

      const charSet = CHARACTER_SETS[vizSettings.characterSet];

      switch (status) {
        case 'LISTENING':
          baseRotationSpeed *= 1.5;
          radiusJitter = bassLevel * 5; // Bass affects size
          break;
        case 'THINKING':
          baseRotationSpeed *= 7.5; // Fast spin
          radiusJitter = getWaveValue(time * 0.1 * vizSettings.waveFrequency, vizSettings.waveType) * vizSettings.waveAmplitude * 0.05;
          break;
        case 'SPEAKING':
          baseRotationSpeed *= 2;
          radiusJitter = getWaveValue(time * 0.05 * vizSettings.waveFrequency, vizSettings.waveType) * vizSettings.waveAmplitude * 0.05;
          break;
        case 'IDLE':
        default:
          radiusJitter = getWaveValue(time * 0.02 * vizSettings.waveFrequency, vizSettings.waveType) * vizSettings.waveAmplitude * 0.02;
          break;
      }

      // Apply rotation speed to axes
      if (vizSettings.rotationAxes.x) angleX += baseRotationSpeed;
      if (vizSettings.rotationAxes.y) angleY += baseRotationSpeed * 0.7;
      if (vizSettings.rotationAxes.z) angleZ += baseRotationSpeed * 0.5;

      time += 1;

      // Rainbow mode
      if (vizSettings.colorPreset === 'rainbow') {
        hue = (hue + 1) % 360;
      }

      // 3. Render ASCII Sphere
      const width = 70;
      const height = 32;
      const buffer = new Array(width * height).fill(' ');
      const zBuffer = new Array(width * height).fill(-Infinity);

      const K1 = 30; // Projection distance

      const r = radiusBase + radiusJitter;

      // Iterate over sphere surface
      const step = 0.12 - (highLevel * 0.05); // High frequencies affect detail
      for (let lat = 0; lat < Math.PI; lat += step) {
        for (let lon = 0; lon < 2 * Math.PI; lon += step) {
          const cx = r * Math.sin(lat) * Math.cos(lon);
          const cy = r * Math.sin(lat) * Math.sin(lon);
          const cz = r * Math.cos(lat);

          // Apply symmetry
          const symmetryPoints = applySymmetry(cx, cy, vizSettings.symmetryMode);

          for (const [sx, sy] of symmetryPoints) {
            // Rotate around X
            let x1 = sx;
            let y1 = sy * Math.cos(angleX) - cz * Math.sin(angleX);
            let z1 = sy * Math.sin(angleX) + cz * Math.cos(angleX);

            // Rotate around Y
            let x2 = x1 * Math.cos(angleY) - z1 * Math.sin(angleY);
            let y2 = y1;
            let z2 = x1 * Math.sin(angleY) + z1 * Math.cos(angleY);

            // Rotate around Z
            const x3 = x2 * Math.cos(angleZ) - y2 * Math.sin(angleZ);
            const y3 = x2 * Math.sin(angleZ) + y2 * Math.cos(angleZ);
            const z3 = z2;

            // Project to 2D
            const ooz = 1 / (z3 + 60); // Depth offset
            const xp = Math.floor(width / 2 + K1 * ooz * x3 * 2);
            const yp = Math.floor(height / 2 - K1 * ooz * y3);

            const idx = xp + yp * width;
            if (idx >= 0 && idx < width * height) {
              if (ooz > zBuffer[idx]) {
                zBuffer[idx] = ooz;
                // Select char based on depth (z3)
                const luminance = Math.floor(((z3 + r) / (2 * r)) * (charSet.length - 1));
                const charIdx = Math.max(0, Math.min(charSet.length - 1, luminance));
                buffer[idx] = charSet[charIdx];
              }
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

      // Update color for rainbow mode
      if (vizSettings.colorPreset === 'rainbow' && preRef.current) {
        preRef.current.style.color = `hsl(${hue}, 100%, 60%)`;
        preRef.current.style.textShadow = `0 0 10px hsl(${hue}, 100%, 60%)`;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [status, vizSettings]);

  const currentColor = getColor();

  return (
    <pre
      ref={preRef}
      style={{
        color: vizSettings.colorPreset === 'rainbow' ? currentColor : currentColor,
        fontFamily: '"Courier New", Courier, monospace',
        fontSize: '9px',
        lineHeight: '9px',
        fontWeight: 'bold',
        textShadow: `0 0 8px ${currentColor}`,
        margin: '20px 0',
        userSelect: 'none',
        pointerEvents: 'none',
        whiteSpace: 'pre',
        letterSpacing: '2px'
      }}
    />
  );
};

export default AsciiOrb;
