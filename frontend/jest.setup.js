// Jest setup file
import '@testing-library/jest-dom';

// Mock Web Speech API
global.speechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  getVoices: jest.fn(() => []),
  onvoiceschanged: null
};

// Mock Web Audio API
global.AudioContext = jest.fn(() => ({
  createAnalyser: jest.fn(() => ({
    fftSize: 2048,
    getByteFrequencyData: jest.fn(),
    connect: jest.fn()
  })),
  createMediaElementSource: jest.fn(),
  createGain: jest.fn(() => ({
    gain: { value: 1 },
    connect: jest.fn()
  })),
  resume: jest.fn()
}));

// Mock Three.js
jest.mock('three', () => ({
  Scene: jest.fn(() => ({
    add: jest.fn(),
    remove: jest.fn()
  })),
  PerspectiveCamera: jest.fn(() => ({
    position: { set: jest.fn() },
    aspect: 1,
    updateProjectionMatrix: jest.fn()
  })),
  WebGLRenderer: jest.fn(() => ({
    setSize: jest.fn(),
    setPixelRatio: jest.fn(),
    render: jest.fn(),
    domElement: document.createElement('canvas')
  })),
  GLTFLoader: jest.fn(() => ({
    load: jest.fn((url, onLoad) => {
      // Simulate successful load
      setTimeout(() => {
        onLoad({
          scene: {
            traverse: jest.fn()
          },
          animations: []
        });
      }, 100);
    })
  })),
  OrbitControls: jest.fn(() => ({
    enableDamping: true,
    update: jest.fn()
  }))
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;
