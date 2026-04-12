import { generateSuggestions } from '../engine/suggestionEngine';
import { describe, it, expect } from 'vitest';

describe('suggestionEngine', () => {
  const mockZones = {
    A: { density: 40, trend: 'stable' },
    B: { density: 50, trend: 'stable' },
    C: { density: 95, trend: 'rising' }, // high density
    D: { density: 60, trend: 'stable' }
  };
  const mockStalls = {};
  const mockGates = {};

  it('returns minimum 3 suggestions always', () => {
    const suggestions = generateSuggestions(mockZones, mockStalls, mockGates);
    expect(suggestions.length).toBeGreaterThanOrEqual(3);
  });

  it('confidence never exceeds 95', () => {
    const suggestions = generateSuggestions(mockZones, mockStalls, mockGates);
    suggestions.forEach(s => {
      expect(s.confidence).toBeLessThanOrEqual(95);
    });
  });

  it('confidence never below 60', () => {
    const suggestions = generateSuggestions(mockZones, mockStalls, mockGates);
    suggestions.forEach(s => {
      expect(s.confidence).toBeGreaterThanOrEqual(60);
    });
  });

  it('high density zone always appears in suggestion text', () => {
    const suggestions = generateSuggestions(mockZones, mockStalls, mockGates);
    const textHasC = suggestions.some(s => s.action.includes('Zone C') || s.zone === 'Zone C');
    expect(textHasC).toBe(true);
  });

  it('empty zone state returns default suggestions gracefully', () => {
    const emptyZones = {};
    const suggestions = generateSuggestions(emptyZones, mockStalls, mockGates);
    expect(suggestions.length).toBeGreaterThanOrEqual(3);
  });
});
