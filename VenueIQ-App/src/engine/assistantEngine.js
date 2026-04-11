// src/engine/assistantEngine.js
import { parkingZones, publicTransport } from '../data/mockData';

export function getAssistantResponse(query, venueState) {
  const q = query.toLowerCase();
  
  // Seat intent
  if (q.includes('where is my seat') || q.includes('seat') || q.includes('block')) {
    return "Your seat is in Block C, Row 12, Seat 4. From Gate 3, take Corridor B, elevator to Level 2, turn right.";
  }
  
  // Crowd intent
  if (q.includes('crowd') || q.includes('how busy') || q.includes('which zone')) {
    const cZone = venueState.zones['C'];
    let lowestZone = 'A';
    let lowestDens = 100;
    Object.keys(venueState.zones).forEach(z => {
      if (venueState.zones[z].density < lowestDens) {
        lowestDens = venueState.zones[z].density;
        lowestZone = `Zone ${z}`;
      }
    });
    return `Zone C where you are is at ${cZone.density}% capacity right now and ${cZone.trend}. Least crowded zone is ${lowestZone} at ${lowestDens}%.`;
  }
  
  // Food intent
  if (q.includes('food') || q.includes('eat') || q.includes('stall') || q.includes('hungry')) {
    const cStalls = Object.keys(venueState.stalls).filter(s => venueState.stalls[s].zone === 'C');
    const nearestStall = cStalls.length > 0 ? cStalls[0] : null;
    
    // Find min wait in another zone
    let minWait = 100;
    let minStall = null;
    let minZone = '';
    Object.keys(venueState.stalls).forEach(s => {
      if (venueState.stalls[s].zone !== 'C' && venueState.stalls[s].waitTime < minWait) {
        minWait = venueState.stalls[s].waitTime;
        minStall = s;
        minZone = venueState.stalls[s].zone;
      }
    });

    if (nearestStall) {
      return `Nearest stall to you is ${nearestStall} with a ${venueState.stalls[nearestStall].waitTime} minute wait. Stall ${minStall} in Zone ${minZone} has only ${minWait} minutes wait right now.`;
    }
  }
  
  // Toilet intent
  if (q.includes('toilet') || q.includes('restroom') || q.includes('washroom')) {
    const bbRestroom = venueState.restrooms['Block B Restrooms'];
    if (bbRestroom) {
      return `Nearest restroom is Block B, currently ${bbRestroom.status} with a ${bbRestroom.waitTime} minute wait.`;
    }
    return `Nearest restroom has a short wait.`;
  }
  
  // Exit intent
  if (q.includes('exit') || q.includes('leave') || q.includes('gate') || q.includes('go out')) {
    let bestGate = '1';
    let minFlow = 9999;
    Object.keys(venueState.gates).forEach(g => {
      if(venueState.gates[g].open && venueState.gates[g].flowRate < minFlow) {
        minFlow = venueState.gates[g].flowRate;
        bestGate = g;
      }
    });
    const bestGateZone = venueState.gates[bestGate].zone;
    const bestGateDens = venueState.zones[bestGateZone].density;
    return `Best exit from your seat is Gate ${bestGate} via Zone ${bestGateZone}, currently at ${bestGateDens}% — low crowd. Avoid Gate 7, Zone C is busy.`;
  }

  // Score intent
  if (q.includes('score') || q.includes('match') || q.includes('cricket')) {
    const m = venueState.match;
    const team = m.batting === 1 ? m.team1 : m.team2;
    return `Current score: ${team} ${m.score} in ${venueState.formatOvers(m.balls)} overs. ${m.lastEvent}.`;
  }

  // Safe intent
  if (q.includes('safe') || q.includes('emergency') || q.includes('help')) {
    return "Nearest medical aid is at Block A entrance. Security is stationed at Gates 2, 5, and 9. Stay calm and follow staff instructions.";
  }

  const now = new Date();
  const entryDate = new Date();
  entryDate.setHours(18, 15, 0, 0); 
  let liveCostText = '180';
  if (now > entryDate) {
    const elapsedMinutes = Math.floor((now - entryDate) / 60000);
    const cost = Math.max(60, Math.round((elapsedMinutes * 1) / 10) * 10);
    liveCostText = cost.toString();
  }

  if (q.includes('how much') || q.includes('cost') || q.includes('parking fee')) {
    return `Your current parking cost is approximately ₹${liveCostText} based on entry at 6:15 PM. Your zone charges ₹60 per hour.`;
  }

  if (q.includes('cheapest parking') || q.includes('available parking') || q.includes('free parking')) {
    let minOcc = 100;
    let bz = parkingZones[0];
    parkingZones.forEach(pz => {
      const occPct = pz.occupied / pz.capacity;
      if(occPct < minOcc) {
        minOcc = occPct;
        bz = pz;
      }
    });
    return `Least crowded zone right now is ${bz.label} at ${Math.round(minOcc*100)}% capacity, priced at ₹${bz.pricePerHour} per hour. Nearest public option is Wankhede Metro at 350 metres.`;
  }

  if (q.includes('metro') || q.includes('bus') || q.includes('cab') || q.includes('uber') || q.includes('ola') || q.includes('auto')) {
    const alpha = publicTransport.find(p => p.name === 'Pickup Zone Alpha');
    return `Nearest metro is Wankhede Metro Station, 350 metres away, 5 minute walk. Pickup Zone Alpha for cabs is 200 metres, 3 minute walk. Currently ${alpha ? alpha.status : 'busy'}.`;
  }

  if (q.includes('parking') || q.includes('car') || q.includes('vehicle') || q.includes('where did i park')) {
    return `Your car is in Zone P2, East Stand, Spot E-47. Entry was at 6:15 PM via Gate 3. Current estimated cost is ₹${liveCostText}. Walk time back to your car is 2 minutes.`;
  }

  // Default
  return "I didn't quite catch that. You can ask me about your seat, food stalls, crowd levels, exits, or the live score!";
}
