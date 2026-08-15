import { Direction4, Direction8, Faction, TileType } from './types';

// Matrix of 16x16 pixels. Value is palette color index: -1 (transparent), 0 (darkest), 1 (dark), 2 (light), 3 (lightest)
export type SpriteMatrix = number[][];

// Helper to parse ascii art into 16x16 sprite matrix
// '.' = transparent (-1)
// '#' = 0 (darkest)
// 'x' = 1 (dark)
// 'o' = 2 (light)
// '+' = 3 (lightest)
export function parseAsciiSprite(ascii: string[]): SpriteMatrix {
  return ascii.map((row) =>
    row.split('').map((char) => {
      switch (char) {
        case '#': return 0;
        case 'x': return 1;
        case 'o': return 2;
        case '+': return 3;
        case '.':
        default: return -1;
      }
    })
  );
}

// 1. SPACE MARINE SPRITES (16x16)
// Power Armour, Mk.VII Helmet with eye lenses, Bolter rifle, Pauldrons
const MARINE_DOWN_1 = parseAsciiSprite([
  "....########....",
  "...#+++oo+++#...",
  "..#+ooo##ooo+#..",
  "..#+oo#..#oo+#..",
  "..#+oo####oo+#..",
  "...#+oooooo+#...",
  "...#xxxxxxxx#...",
  "..#x#oooooo#x#..",
  ".#xxx#oooo#xxx#.",
  ".#xxx#oooo#xxx#.",
  ".#xxx######xxx#.",
  "..#x#oo##oo#x#..",
  "...#xoo##oox#...",
  "...#xoo##oox#...",
  "...#xxx##xxx#...",
  "....###..###...."
]);

const MARINE_DOWN_2 = parseAsciiSprite([
  "....########....",
  "...#+++oo+++#...",
  "..#+ooo##ooo+#..",
  "..#+oo#..#oo+#..",
  "..#+oo####oo+#..",
  "...#+oooooo+#...",
  "...#xxxxxxxx#...",
  "..#x#oooooo#x#..",
  ".#xxx#oooo#xxx#.",
  ".#xxx#oooo#xxx#.",
  ".#xxx######xxx#.",
  "...#xoo##oo#x...",
  "...#xxo##oxx#...",
  "....#xo##ox#....",
  "....#xx##xx#....",
  ".....##..##....."
]);

const MARINE_UP = parseAsciiSprite([
  "....########....",
  "...#oooooooo#...",
  "..#oooooooooo#..",
  "..#oooooooooo#..",
  "..#oooooooooo#..",
  "...#oooooooo#...",
  "...#xxxxxxxx#...",
  "..#x#oooooo#x#..",
  ".#xxx#xooox#xxx#",
  ".#xxx#xooox#xxx#",
  ".#xxx######xxx#.",
  "..#x#oo##oo#x#..",
  "...#xoo##oox#...",
  "...#xoo##oox#...",
  "...#xxx##xxx#...",
  "....###..###...."
]);

const MARINE_SIDE = parseAsciiSprite([
  ".....#######....",
  "....#++++ooo#...",
  "...#++ooo##oo#..",
  "...#+oo##..#o#..",
  "...#+oo####oo#..",
  "....#+oooooo#...",
  "....#xxxxxxx#...",
  "...#xxx#oooo#...",
  "..#xxxx#oooo#...",
  "..#xxxx#oooo####",
  "..#xxxx#oooo#oo#",
  "...#xxxx####o###",
  "....#xooo#oox#..",
  "....#xooo#oox#..",
  "....#xxxx#xxx#..",
  ".....###..###..."
]);

// 2. ORK BOY SPRITES (16x16)
// Huge jaw with tusks, spiked iron helmet, hunchback muscle, Shoota / Choppa
const ORK_DOWN_1 = parseAsciiSprite([
  "...##########...",
  "..#xxxx##xxxx#..",
  ".#xxxxxxxxxxxx#.",
  ".#xxo#xxxx#oxx#.",
  ".#xxo######oxx#.",
  ".#xxxxxxxxxxxx#.",
  "..#xx#++++#xx#..",
  "..#xx#+##+#xx#..",
  "...#xxxxxxxx#...",
  "..#xx#oooo#xx#..",
  ".#xxxx#oo#xxxx#.",
  ".#xxxx####xxxx#.",
  "..#xx#oooo#xx#..",
  "..#xxx####xxx#..",
  "..#xxx#..#xxx#..",
  "...###....###..."
]);

const ORK_DOWN_2 = parseAsciiSprite([
  "...##########...",
  "..#xxxx##xxxx#..",
  ".#xxxxxxxxxxxx#.",
  ".#xxo#xxxx#oxx#.",
  ".#xxo######oxx#.",
  ".#xxxxxxxxxxxx#.",
  "..#xx#++++#xx#..",
  "..#xx#+##+#xx#..",
  "...#xxxxxxxx#...",
  "..#xx#oooo#xx#..",
  ".#xxxx#oo#xxxx#.",
  ".#xxxx####xxxx#.",
  "...#xx#oo#xx#...",
  "...#xx####xx#...",
  "....#xx##xx#....",
  ".....##..##....."
]);

const ORK_UP = parseAsciiSprite([
  "...##########...",
  "..#xxxxxxxxxx#..",
  ".#xxxxxxxxxxxx#.",
  ".#xxxxxxxxxxxx#.",
  ".#xxxxxxxxxxxx#.",
  "..#xxxxxxxxxx#..",
  "...#xxxxxxxx#...",
  "..#xx#xxxx#xx#..",
  ".#xxxx#xx#xxxx#.",
  ".#xxxx####xxxx#.",
  "..#xx#oooo#xx#..",
  "..#xxx####xxx#..",
  "..#xxx#..#xxx#..",
  "...###....###..."
]);

const ORK_SIDE = parseAsciiSprite([
  "....#########...",
  "...#xxxxxxxxx#..",
  "..#xxo#xxxxxxx#.",
  "..#xxo########..",
  "..#xxx#++++#x#..",
  "...#xx#+##+#x#..",
  "....#xxxxxxx#...",
  "...#xxxx#ooo#...",
  "..#xxxxx#ooo###.",
  "..#xxxxx#ooo#o#.",
  "..#xxxxx####o##.",
  "...#xxxx#oox#...",
  "...#xxxx#oox#...",
  "...#xxxx#xxx#...",
  "....###..###...."
]);

// 3. TYRANID GAUNT SPRITES (16x16)
// Scything talons, chitinous spiked headcrest, segmented tail
const TYRANID_DOWN_1 = parseAsciiSprite([
  "......####......",
  ".....#oooo#.....",
  "....#o#oo#o#....",
  "...#ooo##ooo#...",
  "...#oo#..#oo#...",
  "....#oooooo#....",
  "....#xxxxxx#....",
  "..##xxxxxxxx##..",
  ".#o#xx#oo#xx#o#.",
  "#oo#xx#oo#xx#oo#",
  "#o#.#xxxxxx#.#o#",
  "##...#xxxx#...##",
  ".....#oooo#.....",
  ".....#x##x#.....",
  "......#..#......",
  ".....##..##....."
]);

const TYRANID_DOWN_2 = parseAsciiSprite([
  "......####......",
  ".....#oooo#.....",
  "....#o#oo#o#....",
  "...#ooo##ooo#...",
  "...#oo#..#oo#...",
  "....#oooooo#....",
  "....#xxxxxx#....",
  "..##xxxxxxxx##..",
  ".#o#xx#oo#xx#o#.",
  "#oo#xx#oo#xx#oo#",
  "#o#.#xxxxxx#.#o#",
  "##...#xxxx#...##",
  "......#oo#......",
  "......#xx#......",
  ".....##..##.....",
  "....###..###...."
]);

const TYRANID_SIDE = parseAsciiSprite([
  ".......#####....",
  "......#ooooo#...",
  ".....#o#ooooo#..",
  "....#ooo##oooo#.",
  "....#oo#..#ooo#.",
  ".....#oooooo##..",
  "....#xxxxxxx#...",
  "..##xxxx#xx#....",
  ".#o#xxxx#xx#....",
  "#oo#xxxx#xx###..",
  "#o#..#xxxx#oo#..",
  "##...#xxxx#o##..",
  ".....#oooo#.....",
  "....#x##xx#.....",
  "...##...###.....",
  "..##............"
]);

// 4. TYRANID EGG SPRITES (16x16)
// Pod with pulsing veins, spores, cracks when closer to hatching
const EGG_1 = parseAsciiSprite([
  "......####......",
  "....##oooo##....",
  "...#ooo##ooo#...",
  "..#oooo##oooo#..",
  ".#ooo#xxxx#ooo#.",
  ".#ooo#xxxx#ooo#.",
  "#oooo#xxxx#oooo#",
  "#oooo#xxxx#oooo#",
  "#oooo#xxxx#oooo#",
  "#oooo#xxxx#oooo#",
  ".#ooo#xxxx#ooo#.",
  ".#oooo####oooo#.",
  "..#oooooooooo#..",
  "...#oooooooo#...",
  "....##oooo##....",
  "......####......"
]);

const EGG_CRACKED = parseAsciiSprite([
  "......####......",
  "....##oooo##....",
  "...#ooo##ooo#...",
  "..#oooo##oooo#..",
  ".#ooo#x#xx#ooo#.",
  ".#ooo##x#x#ooo#.",
  "#oooo#x#xx#oooo#",
  "#oooo##x#x#oooo#",
  "#oooo#x#xx#oooo#",
  "#oooo##x#x#oooo#",
  ".#ooo#x#xx#ooo#.",
  ".#oooo####oooo#.",
  "..#oooooooooo#..",
  "...#oooooooo#...",
  "....##oooo##....",
  "......####......"
]);

// 5. TILES SPRITES (16x16)
const TILE_FLOOR_METAL = parseAsciiSprite([
  "################",
  "#oooooooooooooo#",
  "#o#x#x#x#x#x#x#o",
  "#ox#x#x#x#x#x#xo",
  "#o#x#x#x#x#x#x#o",
  "#ox#x#x#x#x#x#xo",
  "#o#x#x#x#x#x#x#o",
  "#ox#x#x#x#x#x#xo",
  "#o#x#x#x#x#x#x#o",
  "#ox#x#x#x#x#x#xo",
  "#o#x#x#x#x#x#x#o",
  "#ox#x#x#x#x#x#xo",
  "#o#x#x#x#x#x#x#o",
  "#ox#x#x#x#x#x#xo",
  "#oooooooooooooo#",
  "################"
]);

const TILE_FLOOR_RUINS = parseAsciiSprite([
  "................",
  "...#xx..........",
  "..#xxxx#...#x...",
  "..#xxxx#..#xxx#.",
  "...#xx#...#xxx#.",
  "...........#x#..",
  "....#x..........",
  "...#xxx#........",
  "...#xxx#..#x....",
  "....#x#..#xxx#..",
  ".........#xxx#..",
  "..#xx.....#x#...",
  ".#xxxx#.........",
  ".#xxxx#...#xx...",
  "..#xx#...#xxxx#.",
  "..........#xx#.."
]);

const TILE_FLOOR_HIVE = parseAsciiSprite([
  "x.x.x.x.x.x.x.x.",
  ".#.#.#.#.#.#.#.#",
  "x.x.o.o.o.o.x.x.",
  ".#.#o#o#o#o#.#.#",
  "x.o.o.x.x.o.o.x.",
  ".#o#o#x#x#o#o#.#",
  "o.o.x.x.x.x.o.o.",
  "#o#o#x#x#x#o#o#",
  "o.o.x.x.x.x.o.o.",
  ".#o#o#x#x#o#o#.#",
  "x.o.o.x.x.o.o.x.",
  ".#.#o#o#o#o#.#.#",
  "x.x.o.o.o.o.x.x.",
  ".#.#.#.#.#.#.#.#",
  "x.x.x.x.x.x.x.x.",
  ".#.#.#.#.#.#.#.#"
]);

const TILE_WALL_GOTHIC = parseAsciiSprite([
  "################",
  "#+++++####+++++#",
  "#+ooo#xxxx#ooo+#",
  "#+oo#xxxxxx#oo+#",
  "#+o#xxxxxxxx#o+#",
  "#+#xxxxxxxxxx#+#",
  "#+#xxxxxxxxxx#+#",
  "#+#xxxxxxxxxx#+#",
  "#+#xxxxxxxxxx#+#",
  "#+#xxxxxxxxxx#+#",
  "#+#xxxxxxxxxx#+#",
  "#+#xxxxxxxxxx#+#",
  "#+o#xxxxxxxx#o+#",
  "#+oo########oo+#",
  "#+oooooooooooo+#",
  "################"
]);

const TILE_WALL_BARRICADE = parseAsciiSprite([
  "################",
  "#xxxxxxxxxxxxxx#",
  "#x#o#o#o#o#o#ox#",
  "#xo#o#o#o#o#o#ox#",
  "#x#o#o#o#o#o#ox#",
  "#xo#o#o#o#o#o#ox#",
  "#xxxxxxxxxxxxxx#",
  "################",
  "################",
  "#xxxxxxxxxxxxxx#",
  "#x#o#o#o#o#o#ox#",
  "#xo#o#o#o#o#o#ox#",
  "#x#o#o#o#o#o#ox#",
  "#xo#o#o#o#o#o#ox#",
  "#xxxxxxxxxxxxxx#",
  "################"
]);

const TILE_COVER_CRATE = parseAsciiSprite([
  "################",
  "#oooooooooooooo#",
  "#oxxxxxxxxxxxxo#",
  "#ox#xxxxxxxx#xo#",
  "#oxx#xxxxxx#xxo#",
  "#oxxx#xxxx#xxxo#",
  "#oxxxx####xxxxo#",
  "#oxxxx####xxxxo#",
  "#oxxx#xxxx#xxxo#",
  "#oxx#xxxxxx#xxo#",
  "#ox#xxxxxxxx#xo#",
  "#oxxxxxxxxxxxxo#",
  "#oooooooooooooo#",
  "################",
  "................",
  "................"
]);

const TILE_TOXIC_VAT = parseAsciiSprite([
  "..############..",
  ".#oooooooooooo#.",
  "#oxxxxxxxxxxxxo#",
  "#ox++++++++++xo#",
  "#ox+oo+oo+oo+xo#",
  "#ox++o++o++o+xo#",
  "#ox+oo+oo+oo+xo#",
  "#ox++o++o++o+xo#",
  "#ox+oo+oo+oo+xo#",
  "#ox++o++o++o+xo#",
  "#ox++++++++++xo#",
  "#oxxxxxxxxxxxxo#",
  ".#oooooooooooo#.",
  "..############..",
  "................",
  "................"
]);

const TILE_SPORE_CHIMNEY = parseAsciiSprite([
  "....########....",
  "...#oooooooo#...",
  "..#oxxxxxxxxo#..",
  "..#ox######xo#..",
  ".#ox#oooooo#xo#.",
  ".#ox#oxxxox#xo#.",
  "#ox#oxx++xxo#xo#",
  "#ox#ox++++xo#xo#",
  "#ox#oxx++xxo#xo#",
  "#ox#oxxxox#xo#.",
  ".#ox#oooooo#xo#.",
  ".#ox########xo#.",
  "..#oxxxxxxxxo#..",
  "...#oooooooo#...",
  "....########....",
  "................"
]);

// 6. UI & FX SPRITES (16x16 or 8x8)
export const SKULL_ICON = parseAsciiSprite([
  "....########....",
  "...#oooooooo#...",
  "..#oooooooooo#..",
  ".#oooooooooooo#.",
  ".#oo##oooo##oo#.",
  ".#oo##oooo##oo#.",
  ".#oooooooooooo#.",
  "..#oooo##oooo#..",
  "...#oo####oo#...",
  "...#oooooooo#...",
  "...#o#o#o#o#....",
  "...#o#o#o#o#....",
  "....########....",
  "................",
  "................",
  "................"
]);

export const GRENADE_SPRITE = parseAsciiSprite([
  "......####......",
  ".....#oooo#.....",
  "....#oxxxox#....",
  "...#ox#o#xox#...",
  "...#ox#o#xox#...",
  "...#oxxxxox#....",
  "....#oxxxox#....",
  ".....#oooo#.....",
  "......####......",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................"
]);

// Reticle / target box (16x16)
export const TARGET_RETICLE = parseAsciiSprite([
  "#+##........##+#",
  "+o............o+",
  "#..............#",
  "#..............#",
  "................",
  "................",
  "......#++#......",
  "......+oo+......",
  "......+oo+......",
  "......#++#......",
  "................",
  "................",
  "#..............#",
  "#..............#",
  "+o............o+",
  "#+##........##+#"
]);

// Helper to get unit sprite based on faction, direction, animation frame
export function getUnitSprite(unit: { faction: Faction; facing: Direction4; animFrame: number; isMoving: boolean; eggTurnsToHatch?: number }): { sprite: SpriteMatrix; flipH?: boolean } {
  const frame = Math.floor(unit.animFrame) % 2;

  if (unit.faction === 'space_marine') {
    switch (unit.facing) {
      case 'up':
        return { sprite: MARINE_UP };
      case 'left':
        return { sprite: MARINE_SIDE, flipH: true };
      case 'right':
        return { sprite: MARINE_SIDE, flipH: false };
      case 'down':
      default:
        return { sprite: frame === 0 ? MARINE_DOWN_1 : MARINE_DOWN_2 };
    }
  }

  if (unit.faction === 'ork') {
    switch (unit.facing) {
      case 'up':
        return { sprite: ORK_UP };
      case 'left':
        return { sprite: ORK_SIDE, flipH: true };
      case 'right':
        return { sprite: ORK_SIDE, flipH: false };
      case 'down':
      default:
        return { sprite: frame === 0 ? ORK_DOWN_1 : ORK_DOWN_2 };
    }
  }

  if (unit.faction === 'tyranid') {
    switch (unit.facing) {
      case 'up':
        return { sprite: TYRANID_DOWN_1 };
      case 'left':
        return { sprite: TYRANID_SIDE, flipH: true };
      case 'right':
        return { sprite: TYRANID_SIDE, flipH: false };
      case 'down':
      default:
        return { sprite: frame === 0 ? TYRANID_DOWN_1 : TYRANID_DOWN_2 };
    }
  }

  if (unit.faction === 'egg') {
    return { sprite: (unit.eggTurnsToHatch ?? 3) <= 1 ? EGG_CRACKED : EGG_1 };
  }

  return { sprite: MARINE_DOWN_1 };
}

// Get Tile Sprite
export function getTileSprite(type: TileType): SpriteMatrix {
  switch (type) {
    case 'floor_metal': return TILE_FLOOR_METAL;
    case 'floor_ruins': return TILE_FLOOR_RUINS;
    case 'floor_hive': return TILE_FLOOR_HIVE;
    case 'wall_gothic': return TILE_WALL_GOTHIC;
    case 'wall_barricade': return TILE_WALL_BARRICADE;
    case 'cover_crate': return TILE_COVER_CRATE;
    case 'toxic_vat': return TILE_TOXIC_VAT;
    case 'spore_chimney': return TILE_SPORE_CHIMNEY;
    default: return TILE_FLOOR_METAL;
  }
}

// Draw a Sprite Matrix directly to Canvas 2D Context
export function drawSprite(
  ctx: CanvasRenderingContext2D,
  sprite: SpriteMatrix,
  destX: number,
  destY: number,
  palette: [string, string, string, string],
  options?: { flipH?: boolean; scale?: number; opacity?: number }
) {
  const scale = options?.scale ?? 1;
  const flipH = options?.flipH ?? false;
  const opacity = options?.opacity ?? 1;

  ctx.save();
  ctx.globalAlpha = opacity;

  const width = sprite[0]?.length || 16;
  const height = sprite.length || 16;

  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      const colorIndex = sprite[r][c];
      if (colorIndex >= 0 && colorIndex <= 3) {
        ctx.fillStyle = palette[colorIndex];
        const px = flipH ? destX + (width - 1 - c) * scale : destX + c * scale;
        const py = destY + r * scale;
        ctx.fillRect(Math.floor(px), Math.floor(py), scale, scale);
      }
    }
  }

  ctx.restore();
}
