import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.ipcRenderer for tests
global.window = global.window || {};
(global.window as any).ipcRenderer = {
  on: vi.fn(),
  off: vi.fn(),
  send: vi.fn(),
  invoke: vi.fn(),
  getSetting: vi.fn(() => Promise.resolve(null)),
  saveSetting: vi.fn(() => Promise.resolve()),
  startHost: vi.fn(() => Promise.resolve('Host started')),
  stopHost: vi.fn(() => Promise.resolve('Host stopped')),
  startClient: vi.fn(() => Promise.resolve('Client started')),
  stopClient: vi.fn(() => Promise.resolve('Client stopped')),
  startVoice: vi.fn(() => Promise.resolve('Voice started')),
  stopVoice: vi.fn(() => Promise.resolve('Voice stopped')),
};
