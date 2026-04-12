import { getAssistantResponse } from '../engine/assistantEngine';
import { describe, it, expect } from 'vitest';

describe('assistantEngine', () => {
  const dummyState = {
    zones: {
      A: { density: 40 },
      B: { density: 50 },
      C: { density: 95 }
    },
    stalls: {
      "Pizza Hut Block B": { waitTime: 4, zone: 'B' },
      "Burger Stall": { waitTime: 12, zone: 'C' }
    },
    restrooms: {
      "Block B Restrooms": { status: 'Free', waitTime: 2 }
    },
    gates: {
      1: { open: true, flowRate: 40, zone: 'A' },
      7: { open: true, flowRate: 150, zone: 'C' }
    },
    match: {
      team1: 'MI',
      team2: 'CSK',
      batting: 1,
      score: 142,
      balls: 98,
      lastEvent: 'FOUR by Rohit Sharma'
    },
    formatOvers: (balls) => `${Math.floor(balls/6)}.${balls%6}`
  };

  it('all 8 intents return non-empty strings', () => {
    const intents = ['seat', 'crowd', 'food', 'toilet', 'exit', 'score', 'emergency', 'parking'];
    intents.forEach(intent => {
      const resp = getAssistantResponse(intent, dummyState);
      expect(typeof resp).toBe('string');
      expect(resp.length).toBeGreaterThan(0);
    });
  });

  it('unknown query returns default help message', () => {
    const resp = getAssistantResponse('what is the meaning of life', dummyState);
    expect(resp).toContain('I didn\'t quite catch that');
  });

  it('food intent returns stall name and wait time', () => {
    const resp = getAssistantResponse('hungry for food', dummyState);
    expect(resp).toContain('Pizza Hut Block B');
    expect(resp.toLowerCase()).toContain('wait');
  });

  it('parking intent returns zone and spot number', () => {
    const resp = getAssistantResponse('where is my car', dummyState);
    expect(resp).toContain('Zone P2');
    expect(resp).toContain('Spot E-47');
  });

  it('score intent returns team names', () => {
    const resp = getAssistantResponse('what is the score', dummyState);
    expect(resp).toContain('MI');
  });

  it('response always ends with punctuation', () => {
    const queries = ['seat', 'score', 'emergency'];
    queries.forEach(q => {
      const resp = getAssistantResponse(q, dummyState).trim();
      const lastChar = resp[resp.length - 1];
      expect(['.', '!', '?']).toContain(lastChar);
    });
  });
});
