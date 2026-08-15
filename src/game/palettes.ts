import { GamePalette } from './types';

export const GAME_PALETTES: GamePalette[] = [
  {
    id: 'dmg_green',
    name: 'GameBoy Original (DMG)',
    // 0: Darkest, 1: Dark, 2: Light, 3: Lightest
    colors: ['#0f380f', '#306230', '#8bac0f', '#9bbc0f'],
  },
  {
    id: 'gb_pocket',
    name: 'GameBoy Pocket (B&W)',
    colors: ['#121212', '#4b5563', '#9ca3af', '#e5e7eb'],
  },
  {
    id: 'ultramarine',
    name: 'Ultramarine 40K',
    colors: ['#0c192c', '#1e3a8a', '#60a5fa', '#fef08a'],
  },
  {
    id: 'blood_angels',
    name: 'Blood Angels Red',
    colors: ['#2b0909', '#881337', '#f43f5e', '#fed7aa'],
  },
  {
    id: 'toxic_waaagh',
    name: 'Ork WAAAGH! Green',
    colors: ['#052e16', '#15803d', '#4ade80', '#bbf7d0'],
  },
  {
    id: 'tyranid_hive',
    name: 'Tyranid Hive Bio',
    colors: ['#2e1065', '#6b21a8', '#c084fc', '#f0abfc'],
  },
];

export const DEFAULT_PALETTE = GAME_PALETTES[0];
