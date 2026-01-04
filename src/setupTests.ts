console.log('setupTests.ts is being executed');
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});



// Mock framer-motion
jest.mock('framer-motion', () => require('../__mocks__/framer-motion'));

import React from 'react';

// Mock useTheme to avoid matchMedia issues
jest.mock('./hooks/useTheme', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({ isDarkMode: false, toggleTheme: jest.fn() }),
}));

// Mock Audio
const mockPlay = jest.fn().mockImplementation(() => Promise.resolve());
Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
  configurable: true,
  value: mockPlay,
});
Object.defineProperty(window.HTMLAudioElement.prototype, 'play', {
  configurable: true,
  value: mockPlay,
});
window.HTMLMediaElement.prototype.pause = jest.fn();
window.HTMLMediaElement.prototype.load = jest.fn();

// Mock Audio constructor
class MockAudio {
  play = jest.fn().mockResolvedValue(undefined);
  pause = jest.fn();
  load = jest.fn();
  addEventListener = jest.fn();
  removeEventListener = jest.fn();
  dispatchEvent = jest.fn();
  src = '';
  currentTime = 0;
  volume = 1;
  muted = false;
  loop = false;
  autoplay = false;
  paused = true;
  ended = false;
  error = null;
}

window.Audio = MockAudio as any;
global.Audio = MockAudio as any;
