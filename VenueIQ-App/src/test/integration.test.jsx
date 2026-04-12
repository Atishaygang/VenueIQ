import React, { useContext } from 'react';
import { render, screen } from '@testing-library/react';
import { VenueProvider, VenueContext } from '../engine/VenueContext';
import { describe, it, expect } from 'vitest';

describe('Integration Tests', () => {
  it('VenueContext provides non-null state to consumers', () => {
    let capturedState = null;
    function TestConsumer() {
      capturedState = useContext(VenueContext);
      return <div data-testid="consumer" />;
    }

    render(
      <VenueProvider>
        <TestConsumer />
      </VenueProvider>
    );

    expect(screen.getByTestId('consumer')).not.toBeNull();
    expect(capturedState).not.toBeNull();
  });

  it('useVenue hook returns zones, match, stalls, alerts', () => {
    let state;
    function TestConsumer() {
      state = useContext(VenueContext);
      return null;
    }

    render(
      <VenueProvider>
        <TestConsumer />
      </VenueProvider>
    );

    expect(state).toHaveProperty('zones');
    expect(state).toHaveProperty('match');
    expect(state).toHaveProperty('stalls');
    expect(state).toHaveProperty('alerts');
  });

  it('zones object has all 8 keys A through H', () => {
    let state;
    function TestConsumer() {
      state = useContext(VenueContext);
      return null;
    }

    render(
      <VenueProvider>
        <TestConsumer />
      </VenueProvider>
    );

    const keys = Object.keys(state.zones);
    expect(keys).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
  });

  it('match object has required fields: team1, team2, score', () => {
    let state;
    function TestConsumer() {
      state = useContext(VenueContext);
      return null;
    }

    render(
      <VenueProvider>
        <TestConsumer />
      </VenueProvider>
    );

    expect(state.match).toHaveProperty('team1');
    expect(state.match).toHaveProperty('team2');
    expect(state.match).toHaveProperty('score');
  });
});
