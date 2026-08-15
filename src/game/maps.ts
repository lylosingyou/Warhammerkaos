import { GameMap, TileType, Unit } from './types';

// Helper to create a 20x15 grid of tiles
function createTileGrid(fillType: TileType, width = 20, height = 15): TileType[][] {
  const grid: TileType[][] = [];
  for (let y = 0; y < height; y++) {
    const row: TileType[] = [];
    for (let x = 0; x < width; x++) {
      // Border walls by default
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
        row.push('wall_gothic');
      } else {
        row.push(fillType);
      }
    }
    grid.push(row);
  }
  return grid;
}

// 1. Mission 1: Space Hulk Breach
export function getSpaceHulkMission(): GameMap {
  const tiles = createTileGrid('floor_metal');
  
  // Corridors & Bulkheads
  // Middle horizontal wall with doors
  for (let x = 3; x < 17; x++) {
    if (x !== 7 && x !== 13) {
      tiles[7][x] = 'wall_barricade';
    }
  }

  // Vertical partition top
  for (let y = 1; y < 7; y++) {
    if (y !== 3) {
      tiles[y][10] = 'wall_barricade';
    }
  }

  // Cover crates
  tiles[3][4] = 'cover_crate';
  tiles[4][4] = 'cover_crate';
  tiles[11][5] = 'cover_crate';
  tiles[11][14] = 'cover_crate';
  tiles[10][10] = 'cover_crate';

  // Spore chimneys in hive breach section
  tiles[2][16] = 'spore_chimney';
  tiles[4][17] = 'spore_chimney';

  const initialUnits: Partial<Unit>[] = [
    {
      id: 'marine_1',
      name: 'Brother Titus',
      faction: 'space_marine',
      team: 'player',
      x: 2,
      y: 11,
      facing: 'up',
      aimDirection: 'up',
      hp: 5,
      maxHp: 5,
      atk: 2,
      abilityName: 'Frag Grenade',
      abilityDescription: '3x3 AoE, 3 DMG (5 tile range)',
      abilityCooldown: 7,
      currentCooldown: 0,
      selected: true,
      kills: 0,
    },
    {
      id: 'marine_2',
      name: 'Brother Vorn',
      faction: 'space_marine',
      team: 'player',
      x: 3,
      y: 12,
      facing: 'up',
      aimDirection: 'up',
      hp: 5,
      maxHp: 5,
      atk: 2,
      abilityName: 'Frag Grenade',
      abilityDescription: '3x3 AoE, 3 DMG (5 tile range)',
      abilityCooldown: 7,
      currentCooldown: 0,
      selected: false,
      kills: 0,
    },
    // Enemies
    {
      id: 'ork_1',
      name: 'Ork Boy Grimgor',
      faction: 'ork',
      team: 'enemy',
      x: 5,
      y: 4,
      facing: 'down',
      aimDirection: 'down',
      hp: 4,
      maxHp: 4,
      atk: 2,
      abilityName: 'WAAAGH Rush',
      abilityDescription: 'Charges 3 tiles damaging in path',
      abilityCooldown: 6,
      currentCooldown: 2,
      kills: 0,
    },
    {
      id: 'ork_2',
      name: 'Ork Boy Skarfang',
      faction: 'ork',
      team: 'enemy',
      x: 14,
      y: 11,
      facing: 'left',
      aimDirection: 'left',
      hp: 4,
      maxHp: 4,
      atk: 2,
      abilityName: 'WAAAGH Rush',
      abilityDescription: 'Charges 3 tiles damaging in path',
      abilityCooldown: 6,
      currentCooldown: 3,
      kills: 0,
    },
    {
      id: 'tyranid_1',
      name: 'Tyranid Hormagaunt Alpha',
      faction: 'tyranid',
      team: 'enemy',
      x: 16,
      y: 3,
      facing: 'down',
      aimDirection: 'down',
      hp: 3,
      maxHp: 3,
      atk: 1,
      abilityName: 'Lay Egg',
      abilityDescription: 'Lays egg every 5 turns (3s tick)',
      abilityCooldown: 15,
      currentCooldown: 3,
      eggTimer: 1,
      kills: 0,
    },
  ];

  return {
    id: 'space_hulk',
    name: 'Mission 1: Space Hulk Breach',
    subtitle: 'Corridor Purge - Sector Theta',
    width: 20,
    height: 15,
    tiles,
    initialUnits,
    briefing: 'A splinter fleet bio-nest has breached the lower decks alongside invading Orks. Exterminate all xenos threats and prevent Tyranid egg incubation!',
  };
}

// 2. Mission 2: Hive Infestation Core
export function getHiveInfestationMission(): GameMap {
  const tiles = createTileGrid('floor_hive');

  // Toxic vats and Spore Chimneys
  tiles[4][4] = 'toxic_vat';
  tiles[4][5] = 'toxic_vat';
  tiles[10][14] = 'toxic_vat';
  tiles[10][15] = 'toxic_vat';

  tiles[2][10] = 'spore_chimney';
  tiles[6][10] = 'spore_chimney';
  tiles[8][5] = 'spore_chimney';
  tiles[12][9] = 'spore_chimney';

  // Gothic ruins cover
  tiles[6][6] = 'wall_gothic';
  tiles[6][7] = 'cover_crate';
  tiles[8][12] = 'wall_gothic';
  tiles[9][12] = 'cover_crate';

  const initialUnits: Partial<Unit>[] = [
    {
      id: 'marine_1',
      name: 'Sergeant Gabriel',
      faction: 'space_marine',
      team: 'player',
      x: 2,
      y: 2,
      facing: 'right',
      aimDirection: 'right',
      hp: 5,
      maxHp: 5,
      atk: 2,
      abilityName: 'Frag Grenade',
      abilityDescription: '3x3 AoE, 3 DMG (5 tile range)',
      abilityCooldown: 7,
      currentCooldown: 0,
      selected: true,
      kills: 0,
    },
    {
      id: 'marine_2',
      name: 'Brother Cassian',
      faction: 'space_marine',
      team: 'player',
      x: 2,
      y: 4,
      facing: 'right',
      aimDirection: 'right',
      hp: 5,
      maxHp: 5,
      atk: 2,
      abilityName: 'Frag Grenade',
      abilityDescription: '3x3 AoE, 3 DMG (5 tile range)',
      abilityCooldown: 7,
      currentCooldown: 0,
      selected: false,
      kills: 0,
    },
    // Tyranids with active incubator eggs
    {
      id: 'tyranid_1',
      name: 'Tyranid Gaunt 01',
      faction: 'tyranid',
      team: 'enemy',
      x: 15,
      y: 4,
      facing: 'left',
      aimDirection: 'left',
      hp: 3,
      maxHp: 3,
      atk: 1,
      abilityName: 'Lay Egg',
      abilityDescription: 'Lays egg every 5 turns',
      abilityCooldown: 15,
      currentCooldown: 2,
      eggTimer: 3,
      kills: 0,
    },
    {
      id: 'tyranid_2',
      name: 'Tyranid Gaunt 02',
      faction: 'tyranid',
      team: 'enemy',
      x: 16,
      y: 11,
      facing: 'left',
      aimDirection: 'left',
      hp: 3,
      maxHp: 3,
      atk: 1,
      abilityName: 'Lay Egg',
      abilityDescription: 'Lays egg every 5 turns',
      abilityCooldown: 15,
      currentCooldown: 4,
      eggTimer: 4,
      kills: 0,
    },
    {
      id: 'egg_1',
      name: 'Incubating Bio-Egg',
      faction: 'egg',
      team: 'enemy',
      x: 17,
      y: 3,
      facing: 'down',
      aimDirection: 'down',
      hp: 2,
      maxHp: 2,
      atk: 0,
      abilityName: 'Incubating',
      abilityDescription: 'Hatches in 2 turns!',
      abilityCooldown: 0,
      currentCooldown: 0,
      eggTurnsToHatch: 2,
      kills: 0,
    },
    {
      id: 'ork_1',
      name: 'Ork Nob Boggart',
      faction: 'ork',
      team: 'enemy',
      x: 10,
      y: 8,
      facing: 'up',
      aimDirection: 'up',
      hp: 4,
      maxHp: 4,
      atk: 2,
      abilityName: 'WAAAGH Rush',
      abilityDescription: 'Charges 3 tiles',
      abilityCooldown: 6,
      currentCooldown: 1,
      kills: 0,
    }
  ];

  return {
    id: 'hive_core',
    name: 'Mission 2: Hive Infestation Core',
    subtitle: 'Bio-Chamber Quarantine',
    width: 20,
    height: 15,
    tiles,
    initialUnits,
    briefing: 'High biological density detected. Destroy the active Tyranid Bio-Eggs before they hatch fresh reinforcements! Beware of berserk Ork scavengers!',
  };
}

// 3. Mission 3: Armageddon Cathedral Ruins
export function getCathedralRuinsMission(): GameMap {
  const tiles = createTileGrid('floor_ruins');

  // Gothic Cathedral layout (Columns, nave, alter ruins)
  // Left pillar column
  tiles[3][5] = 'wall_gothic';
  tiles[6][5] = 'wall_gothic';
  tiles[9][5] = 'wall_gothic';
  tiles[12][5] = 'wall_gothic';

  // Right pillar column
  tiles[3][14] = 'wall_gothic';
  tiles[6][14] = 'wall_gothic';
  tiles[9][14] = 'wall_gothic';
  tiles[12][14] = 'wall_gothic';

  // Altar center cover
  tiles[7][9] = 'cover_crate';
  tiles[7][10] = 'cover_crate';
  tiles[8][9] = 'cover_crate';
  tiles[8][10] = 'cover_crate';

  const initialUnits: Partial<Unit>[] = [
    {
      id: 'marine_1',
      name: 'Captain Cortez',
      faction: 'space_marine',
      team: 'player',
      x: 3,
      y: 7,
      facing: 'right',
      aimDirection: 'right',
      hp: 5,
      maxHp: 5,
      atk: 2,
      abilityName: 'Frag Grenade',
      abilityDescription: '3x3 AoE, 3 DMG',
      abilityCooldown: 7,
      currentCooldown: 0,
      selected: true,
      kills: 0,
    },
    {
      id: 'marine_2',
      name: 'Brother Dante',
      faction: 'space_marine',
      team: 'player',
      x: 2,
      y: 8,
      facing: 'right',
      aimDirection: 'right',
      hp: 5,
      maxHp: 5,
      atk: 2,
      abilityName: 'Frag Grenade',
      abilityDescription: '3x3 AoE, 3 DMG',
      abilityCooldown: 7,
      currentCooldown: 0,
      selected: false,
      kills: 0,
    },
    // Heavy Ork squad + Tyranids
    {
      id: 'ork_1',
      name: 'Ork Boy Nazgrim',
      faction: 'ork',
      team: 'enemy',
      x: 16,
      y: 5,
      facing: 'left',
      aimDirection: 'left',
      hp: 4,
      maxHp: 4,
      atk: 2,
      abilityName: 'WAAAGH Rush',
      abilityDescription: 'Charges 3 tiles',
      abilityCooldown: 6,
      currentCooldown: 2,
      kills: 0,
    },
    {
      id: 'ork_2',
      name: 'Ork Boy Gorbad',
      faction: 'ork',
      team: 'enemy',
      x: 16,
      y: 9,
      facing: 'left',
      aimDirection: 'left',
      hp: 4,
      maxHp: 4,
      atk: 2,
      abilityName: 'WAAAGH Rush',
      abilityDescription: 'Charges 3 tiles',
      abilityCooldown: 6,
      currentCooldown: 4,
      kills: 0,
    },
    {
      id: 'tyranid_1',
      name: 'Hive Queen Drone',
      faction: 'tyranid',
      team: 'enemy',
      x: 17,
      y: 7,
      facing: 'left',
      aimDirection: 'left',
      hp: 3,
      maxHp: 3,
      atk: 1,
      abilityName: 'Lay Egg',
      abilityDescription: 'Lays egg every 5 turns',
      abilityCooldown: 15,
      currentCooldown: 1,
      eggTimer: 4,
      kills: 0,
    },
  ];

  return {
    id: 'cathedral_ruins',
    name: 'Mission 3: Gothic Cathedral Last Stand',
    subtitle: 'Holy Ground Retribution',
    width: 20,
    height: 15,
    tiles,
    initialUnits,
    briefing: 'Defend the sacred basilica relics against an overwhelming swarm of Orks and Tyranids. Use the ancient gothic pillars as tactical cover!',
  };
}

// 4. Procedural Skirmish Generator
export function generateSkirmishMap(seed = Date.now(), orkCount = 3, tyranidCount = 2): GameMap {
  const floorTypes: TileType[] = ['floor_metal', 'floor_ruins', 'floor_hive'];
  const baseFloor = floorTypes[Math.floor(Math.random() * floorTypes.length)];
  const tiles = createTileGrid(baseFloor);

  // Random obstacles (15-25 crates/walls)
  const obstacleTypes: TileType[] = ['wall_gothic', 'wall_barricade', 'cover_crate', 'spore_chimney'];
  for (let i = 0; i < 20; i++) {
    const ox = Math.floor(Math.random() * 14) + 3;
    const oy = Math.floor(Math.random() * 11) + 2;
    // Don't place on player spawn zone (x: 1..4, y: 1..5)
    if (ox < 5 && oy < 6) continue;
    tiles[oy][ox] = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
  }

  const initialUnits: Partial<Unit>[] = [
    {
      id: 'marine_1',
      name: 'Brother Titus',
      faction: 'space_marine',
      team: 'player',
      x: 2,
      y: 3,
      facing: 'right',
      aimDirection: 'right',
      hp: 5,
      maxHp: 5,
      atk: 2,
      abilityName: 'Frag Grenade',
      abilityDescription: '3x3 AoE, 3 DMG',
      abilityCooldown: 7,
      currentCooldown: 0,
      selected: true,
      kills: 0,
    },
    {
      id: 'marine_2',
      name: 'Brother Vorn',
      faction: 'space_marine',
      team: 'player',
      x: 2,
      y: 5,
      facing: 'right',
      aimDirection: 'right',
      hp: 5,
      maxHp: 5,
      atk: 2,
      abilityName: 'Frag Grenade',
      abilityDescription: '3x3 AoE, 3 DMG',
      abilityCooldown: 7,
      currentCooldown: 0,
      selected: false,
      kills: 0,
    },
  ];

  // Spawn Orks
  for (let i = 0; i < orkCount; i++) {
    const ox = Math.floor(Math.random() * 8) + 10;
    const oy = Math.floor(Math.random() * 11) + 2;
    tiles[oy][ox] = baseFloor; // Clear spot
    initialUnits.push({
      id: `ork_${i + 1}`,
      name: `Ork Boy #${i + 1}`,
      faction: 'ork',
      team: 'enemy',
      x: ox,
      y: oy,
      facing: 'left',
      aimDirection: 'left',
      hp: 4,
      maxHp: 4,
      atk: 2,
      abilityName: 'WAAAGH Rush',
      abilityDescription: 'Charges 3 tiles',
      abilityCooldown: 6,
      currentCooldown: Math.floor(Math.random() * 4),
      kills: 0,
    });
  }

  // Spawn Tyranids
  for (let i = 0; i < tyranidCount; i++) {
    const tx = Math.floor(Math.random() * 6) + 12;
    const ty = Math.floor(Math.random() * 11) + 2;
    tiles[ty][tx] = baseFloor;
    initialUnits.push({
      id: `tyranid_${i + 1}`,
      name: `Tyranid Gaunt #${i + 1}`,
      faction: 'tyranid',
      team: 'enemy',
      x: tx,
      y: ty,
      facing: 'left',
      aimDirection: 'left',
      hp: 3,
      maxHp: 3,
      atk: 1,
      abilityName: 'Lay Egg',
      abilityDescription: 'Lays egg every 5 turns',
      abilityCooldown: 15,
      currentCooldown: 2,
      eggTimer: Math.floor(Math.random() * 3),
      kills: 0,
    });
  }

  return {
    id: `skirmish_${seed}`,
    name: 'Skirmish: Procedural Battlefield',
    subtitle: 'Sector Patrol Elimination',
    width: 20,
    height: 15,
    tiles,
    initialUnits,
    briefing: 'Randomized tactical sector. Purge all hostiles, neutralize eggs, and secure the perimeter for the Emperor!',
  };
}

export const CAMPAIGN_MISSIONS: GameMap[] = [
  getSpaceHulkMission(),
  getHiveInfestationMission(),
  getCathedralRuinsMission(),
];
