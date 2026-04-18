import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, set, get, child } from 'firebase/database';
import { db } from '../config/firebase';

export function useFirebase() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const connectedRef = ref(db, '.info/connected');
    const unsubscribe = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        setConnected(true);
      } else {
        setConnected(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const readInitialState = useCallback(async () => {
    try {
      const dbRef = ref(db);
      const snapshot = await get(child(dbRef, 'venue'));
      if (snapshot.exists()) {
        return snapshot.val();
      }
      return null;
    } catch (error) {
      console.warn("Error reading from Firebase:", error);
      return null;
    }
  }, []);

  const writeZoneDensity = useCallback((zone, density) => {
    if (!connected) return;
    set(ref(db, `venue/zones/${zone}/density`), density)
      .catch(err => console.warn('Failed to write density to Firebase:', err.message));
  }, [connected]);

  const writeMatchState = useCallback((matchState) => {
    if (!connected) return;
    set(ref(db, `venue/match`), matchState)
      .catch(err => console.warn('Failed to write match state to Firebase:', err.message));
  }, [connected]);

  return { connected, readInitialState, writeZoneDensity, writeMatchState };
}
