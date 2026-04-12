// AI engine mirroring ML logic for recommendations
export function generateSuggestions(zones, stalls, gates) {
  const suggestions = [];
  let idAcc = 1;

  // Rule 1: Zone > 85 AND rising
  Object.keys(zones).forEach(z => {
    if (zones[z].density >= 85 && zones[z].trend === 'rising') {
      const conf = Math.round(Math.min(95, 60 + (zones[z].density - 70) * 1.2));
      suggestions.push({
        id: idAcc++,
        zone: `Zone ${z}`,
        action: `CRITICAL: Deploy 5 crowd marshals to Zone ${z} immediately. Predicted to hit 95% in 6 mins.`,
        confidence: conf,
        deployed: false
      });
    }
  });

  // Rule 2: Two adjacent zones > 75 (assuming alphabetically adjacent A-B, C-D... or general pairs)
  // We'll just define arbitrary neighbors: A-B, B-C, C-D, D-E, E-F, F-G, G-H
  const zoneIds = Object.keys(zones);
  for (let i = 0; i < zoneIds.length - 1; i++) {
    const z1 = zoneIds[i];
    const z2 = zoneIds[i + 1];
    if (zones[z1].density > 75 && zones[z2].density > 75) {
      const conf = Math.round(Math.min(95, 60 + ((zones[z1].density + zones[z2].density)/2 - 70) * 1.2));
      suggestions.push({
        id: idAcc++,
        zone: `Zone ${z1}-${z2}`,
        action: `Surge corridor detected between Zone ${z1} and ${z2}. Open connecting Gate ${i + 1} to distribute flow.`,
        confidence: conf,
        deployed: false
      });
      break; // Just one such rule at a time to prevent flutter
    }
  }

  // Rule 3: Stall wait time > 12 mins
  Object.keys(stalls).forEach(s => {
    if (stalls[s].waitTime > 12) {
      // find alternative stall with lowest wait time
      let altStall = null;
      let minWait = 999;
      Object.keys(stalls).forEach(alt => {
        if (alt !== s && stalls[alt].waitTime < minWait) {
          minWait = stalls[alt].waitTime;
          altStall = alt;
        }
      });
      
      const relatedZone = stalls[s].zone;
      const conf = Math.round(Math.min(95, 60 + (stalls[s].waitTime * 2)));
      suggestions.push({
        id: idAcc++,
        zone: `Zone ${relatedZone}`,
        action: `Queue critical at ${s} — activate backup counter or redirect to ${altStall} (currently ${minWait} min wait).`,
        confidence: conf,
        deployed: false
      });
    }
  });

  // Rule 4: Gate flow rate > 200/min
  Object.keys(gates).forEach(g => {
    if (gates[g].flowRate > 200) {
      const relatedZone = gates[g].zone;
      const conf = Math.round(Math.min(95, 60 + (gates[g].flowRate - 150) * 0.5));
      suggestions.push({
        id: idAcc++,
        zone: `Zone ${relatedZone}`,
        action: `Gate ${g} flow rate critical — assign 2 additional staff for queue management.`,
        confidence: conf,
        deployed: false
      });
    }
  });

  // Rule 5: Zone dropping from >80 to <60
  // Instead of tracking historical "dropping from >80" directly for each zone in state, we can detect if it's currently <60 and falling rapidly, or similar.
  // Actually, we'll track 'wasHigh' in state or just detect <60 and trend='falling'.
  const lowZones = [];
  const risingZones = [];
  Object.keys(zones).forEach(z => {
    if (zones[z].density < 60 && zones[z].trend === 'falling') lowZones.push(z);
    if (zones[z].density > 70 && zones[z].trend === 'rising') risingZones.push(z);
  });

  if (lowZones.length > 0 && risingZones.length > 0) {
    const lz = lowZones[0];
    const rz = risingZones[0];
    const conf = 88;
    suggestions.push({
      id: idAcc++,
      zone: `Zone ${lz}`,
      action: `Zone ${lz} clearing — redeploy 3 staff from ${lz} to rising Zone ${rz}.`,
      confidence: conf,
      deployed: false
    });
  }

  // Ensure minimum 3 suggestions by filling with generic ones if needed
  const defaultAction = "Monitor general crowd flow patterns; shift ushers from corridors to main seating if gaps appear.";
  while (suggestions.length < 3) {
    suggestions.push({
      id: idAcc++,
      zone: 'All Zones',
      action: defaultAction,
      confidence: 75 + suggestions.length * 2,
      deployed: false
    });
  }

  return suggestions.slice(0, 5); // limit max 5
}
