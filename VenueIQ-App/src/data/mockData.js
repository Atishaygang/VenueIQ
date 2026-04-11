export const LIVE_SCORE = {
  team1: 'MI',
  score1: '142/3',
  overs: '16.2',
  team2: 'CSK',
  target: '189',
};

export const UPCOMING_EVENTS = [
  { id: 1, title: 'Toss', time: '7:00 PM', status: 'Completed' },
  { id: 2, title: 'Match Start', time: '7:30 PM', status: 'In Progress' },
  { id: 3, title: 'Halftime Show', time: '9:30 PM', status: 'Upcoming' },
];

export const PROACTIVE_ALERTS = [
  { id: 1, type: 'warning', message: '⚠️ Crowd building at Gate 7 — leave in 8 mins' },
  { id: 2, type: 'success', message: '🍔 Stall 14B wait time dropped to 3 mins' },
  { id: 3, type: 'info', message: '🚽 Nearest restroom at Block B is free' },
];

export const ROUTE_STEPS = [
  { id: 1, step: 'Enter Gate 3' },
  { id: 2, step: 'Take Corridor B' },
  { id: 3, step: 'Elevator to Level 2' },
  { id: 4, step: 'Turn right' },
  { id: 5, step: 'Block C Row 12' },
];

export const STALL_WAIT_TIMES = [
  { id: 1, name: 'Burger King Block A', wait: 12, status: 'Busy', trend: 'increasing' },
  { id: 2, name: 'Pizza Hut Block B', wait: 5, status: 'Free', trend: 'decreasing' },
  { id: 3, name: 'Local Snacks C', wait: 25, status: 'Very Busy', trend: 'increasing' },
  { id: 4, name: 'Beverages Stall 1', wait: 2, status: 'Free', trend: 'decreasing' },
  { id: 5, name: 'Stall 14B', wait: 3, status: 'Free', trend: 'decreasing' },
  { id: 6, name: 'Ice Cream Parlor', wait: 8, status: 'Busy', trend: 'increasing' },
  { id: 7, name: 'Popcorn Express', wait: 14, status: 'Busy', trend: 'increasing' },
  { id: 8, name: 'Hotdogs & More', wait: 1, status: 'Free', trend: 'decreasing' },
];

export const TOILET_WAIT_TIMES = [
  { id: 1, name: 'Block A Restrooms', wait: 2, status: 'Free', trend: 'decreasing' },
  { id: 2, name: 'Block B Restrooms', wait: 0, status: 'Free', trend: 'decreasing' },
  { id: 3, name: 'VIP Level Restrooms', wait: 5, status: 'Busy', trend: 'increasing' },
  { id: 4, name: 'Gate 3 Washrooms', wait: 15, status: 'Very Busy', trend: 'increasing' },
];

export const ALERT_HISTORY = [
  { id: 1, time: '7:15 PM', severity: 'Info', zone: 'Zone A', message: 'Gates opened for Block A.' },
  { id: 2, time: '7:30 PM', severity: 'Warning', zone: 'Zone C', message: 'High crowd density detected at Food Stall 14B.' },
  { id: 3, time: '7:42 PM', severity: 'Critical', zone: 'Gate 3', message: 'Medical emergency reported near Gate 3.' },
  { id: 4, time: '8:05 PM', severity: 'Info', zone: 'All', message: 'First half concluded.' },
  { id: 5, time: '8:30 PM', severity: 'Warning', zone: 'Zone F', message: 'Restroom queue exceeding 15 minutes.' },
  { id: 6, time: '8:45 PM', severity: 'Info', zone: 'Zone B', message: 'Crowd density returned to normal.' },
  { id: 7, time: '9:12 PM', severity: 'Warning', zone: 'Zone D', message: 'Spillage reported near Block D exit.' },
  { id: 8, time: '9:25 PM', severity: 'Critical', zone: 'Gate 5', message: 'Gate 5 temporarily restricted due to technical issue.' },
];

export const INITIAL_ZONES_DENSITY = {
  A: 45, B: 30, C: 85, D: 60,
  E: 90, F: 50, G: 25, H: 40
};

export const AI_SUGGESTIONS = [
  { id: 1, zone: 'Zone C', action: 'Move 3 staff from Zone A to Zone C — surge predicted in 11 mins', confidence: 92 },
  { id: 2, zone: 'Zone E', action: 'Divert gate 5 incoming traffic to gate 6', confidence: 85 },
  { id: 3, zone: 'Zone F', action: 'Deploy maintenance to clean spill near restroom', confidence: 98 },
];

export const ACTIVE_INCIDENTS = [
  { id: 'INC-001', zone: 'Gate 3', type: 'Medical', desc: 'Attendee fainted', reportedAt: '7:42 PM', status: 'In Progress', assigned: 'Med-Team 2' },
  { id: 'INC-002', zone: 'Zone D', type: 'Structural', desc: 'Spillage on stairs', reportedAt: '9:12 PM', status: 'Open', assigned: 'Maintenance' },
  { id: 'INC-003', zone: 'Gate 5', type: 'Security', desc: 'Technical issue with scanner', reportedAt: '9:25 PM', status: 'Open', assigned: 'Tech Staff' },
  { id: 'INC-004', zone: 'Zone C', type: 'Crowd', desc: 'Overcrowding at stall 3', reportedAt: '7:30 PM', status: 'Resolved', assigned: 'Usher Team 4' },
  { id: 'INC-005', zone: 'Zone F', type: 'Crowd', desc: 'Long wait at restrooms', reportedAt: '8:30 PM', status: 'In Progress', assigned: 'Usher Team 1' },
];

export const GATE_STATUS = [
  { gate: 1, status: 'Open', flow: 120 },
  { gate: 2, status: 'Open', flow: 85 },
  { gate: 3, status: 'Restricted', flow: 40 },
  { gate: 4, status: 'Open', flow: 150 },
  { gate: 5, status: 'Closed', flow: 0 },
  { gate: 6, status: 'Open', flow: 110 },
  { gate: 7, status: 'Open', flow: 95 },
  { gate: 8, status: 'Open', flow: 140 },
  { gate: 9, status: 'Closed', flow: 0 },
  { gate: 10, status: 'Open', flow: 130 },
  { gate: 11, status: 'Closed', flow: 0 },
  { gate: 12, status: 'Closed', flow: 0 },
];

export const parkingZones = [
  { id: 'P1', label: 'Zone P1 — North Wing', capacity: 500, occupied: 420, pricePerHour: 80, linkedSeats: ['A', 'B'], entryGate: 'Gate 1', walkTime: '4 min' },
  { id: 'P2', label: 'Zone P2 — East Stand', capacity: 400, occupied: 180, pricePerHour: 60, linkedSeats: ['C', 'D'], entryGate: 'Gate 3', walkTime: '2 min' },
  { id: 'P3', label: 'Zone P3 — South End', capacity: 350, occupied: 340, pricePerHour: 70, linkedSeats: ['E', 'F'], entryGate: 'Gate 7', walkTime: '6 min' },
  { id: 'P4', label: 'Zone P4 — West Lot', capacity: 300, occupied: 90, pricePerHour: 50, linkedSeats: ['G', 'H'], entryGate: 'Gate 10', walkTime: '8 min' },
  { id: 'P5', label: 'VIP Zone — Central', capacity: 150, occupied: 148, pricePerHour: 200, linkedSeats: ['VIP'], entryGate: 'Gate 2', walkTime: '1 min' },
];

export const publicTransport = [
  { type: 'Metro', icon: 'Train', name: 'Wankhede Metro Station', distance: '350m', walkTime: '5 min', lines: ['Line 3 — Aqua'], frequency: 'Every 8 mins', status: 'operational' },
  { type: 'Bus Stop', icon: 'Bus', name: 'Marine Lines Bus Depot', distance: '600m', walkTime: '8 min', lines: ['Bus 103', 'Bus 21C', 'Bus 65'], frequency: 'Every 12 mins', status: 'operational' },
  { type: 'Auto/Cab Zone', icon: 'Car', name: 'Pickup Zone Alpha', distance: '200m', walkTime: '3 min', lines: ['Ola', 'Uber', 'Auto'], frequency: 'On demand', status: 'busy' },
  { type: 'Auto/Cab Zone', icon: 'Car', name: 'Pickup Zone Beta', distance: '500m', walkTime: '6 min', lines: ['Ola', 'Uber'], frequency: 'On demand', status: 'operational' },
  { type: 'Bus Stop', icon: 'Bus', name: 'Churchgate Express Stop', distance: '900m', walkTime: '12 min', lines: ['Bus 70', 'Bus 83'], frequency: 'Every 20 mins', status: 'operational' },
];

export const userParking = {
  zone: 'P2',
  spot: 'E-47',
  entryTime: '6:15 PM',
  estimatedCost: '₹180',
  entryGate: 'Gate 3',
  walkToSeat: '2 min walk to Block C',
};
