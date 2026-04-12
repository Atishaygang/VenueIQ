import { speechSupported, speak, cancelSpeech } from '../engine/voiceEngine';
import { describe, it, expect } from 'vitest';

describe('voiceEngine', () => {
  it('speechSupported returns boolean', () => {
    expect(typeof speechSupported()).toBe('boolean');
  });

  it('speak called with empty string does not throw', () => {
    expect(() => {
      speak('');
    }).not.toThrow();
  });

  it('cancelSpeech does not throw when nothing is playing', () => {
    expect(() => {
      cancelSpeech();
    }).not.toThrow();
  });
});
