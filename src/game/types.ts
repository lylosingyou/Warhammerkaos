export type Faction = 'space_marine' | 'ork' | 'tyranid' | 'egg';
export type Direction4 = 'up' | 'down' | 'left' | 'right';
export type Direction8 = 'up' | 'up-right' | 'right' | 'down-right' | 'down' | 'down-left' | 'left' | 'up-left';

export interface Position {
  x: number; // Grid X (0..19)
  y: number; // Grid Y (0..14)
}

export interface PixelPosition {
  x: number;
  y: number;
}

export interface Unit {
  id: string;
  name: string;
  faction: Faction;
  team: 'player' | 'enemy';
  x: number; // Current grid x
  y: number; // Current grid y
  renderX: number; // Smooth interpolated rendering pixel x
  renderY: number; // Smooth interpolated rendering pixel y
  targetX?: number; // Target moving grid x
  targetY?: number; // Target moving grid y
  isMoving: boolean;
  moveProgress: number; // 0..1
  facing: Direction4;
  aimDirection: Direction8;
  hp: number;
  maxHp: number;
  atk: number;
  abilityName: string;
  abilityDescription: string;
  abilityCooldown: number; // Max cooldown in seconds
  currentCooldown: number; // Remaining cooldown
  eggTimer?: number; // For Tyranid: counts up to 5 turns (every turn tick is 3s)
  eggTurnsToHatch?: number; // For Egg: counts down from 3 turns to hatch
  isDead: boolean;
  selected?: boolean;
  aiState?: 'patrol' | 'chase' | 'attack' | 'flee' | 'charging';
  chargeTarget?: Position;
  chargeStepsLeft?: number;
  animFrame: number;
  lastActionTime: number;
  kills: number;
}

export type TileType = 
  | 'floor_metal' 
  | 'floor_ruins' 
  | 'floor_hive' 
  | 'wall_gothic' 
  | 'wall_barricade' 
  | 'cover_crate' 
  | 'toxic_vat'
  | 'spore_chimney';

export interface Tile {
  type: TileType;
  walkable: boolean;
  blocksVision: boolean;
  destructible?: boolean;
  hp?: number;
  coverBonus?: number;
}

export interface GameMap {
  id: string;
  name: string;
  subtitle: string;
  width: number; // Default 20
  height: number; // Default 15
  tiles: TileType[][];
  initialUnits: Partial<Unit>[];
  briefing: string;
}

export interface Projectile {
  id: string;
  type: 'bolter' | 'grenade' | 'ork_shot' | 'spit' | 'charge_blast';
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  currentX: number;
  currentY: number;
  progress: number;
  duration: number; // in seconds
  arcHeight?: number;
  damage: number;
  aoeRadius?: number; // e.g. 1 for 3x3
  sourceId: string;
}

export interface VisualEffect {
  id: string;
  type: 'explosion_3x3' | 'hit_spark' | 'muzzle_flash' | 'blood_splatter' | 'dust_rush' | 'egg_hatch' | 'damage_number';
  x: number;
  y: number;
  duration: number;
  elapsed: number;
  text?: string;
  colorIndex?: number; // 0..3 (darkest to lightest)
  radius?: number;
}

export interface CombatLogEntry {
  id: string;
  timestamp: string;
  message: string;
  faction: Faction;
  type: 'info' | 'attack' | 'ability' | 'kill' | 'turn' | 'egg';
}

export interface GameStats {
  turnTickCount: number;
  secondsElapsed: number;
  marinesLost: number;
  orksKilled: number;
  tyranidsKilled: number;
  eggsDestroyed: number;
  eggsHatched: number;
  grenadesThrown: number;
  orkRushes: number;
}

export type GameStatus = 'title' | 'briefing' | 'playing' | 'paused' | 'victory' | 'defeat';

export interface GamePalette {
  id: string;
  name: string;
  colors: [string, string, string, string]; // [Darkest, Dark, Light, Lightest]
}
