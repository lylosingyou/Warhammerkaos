import { soundEngine } from './audio';
import {
  CombatLogEntry,
  Direction4,
  Direction8,
  Faction,
  GameMap,
  GameStats,
  GameStatus,
  PixelPosition,
  Position,
  Projectile,
  TileType,
  Unit,
  VisualEffect,
} from './types';

// Constants
export const TILE_SIZE = 16;
export const VIEWPORT_WIDTH = 160;
export const VIEWPORT_HEIGHT = 144;
export const MAP_GRID_WIDTH = 20;
export const MAP_GRID_HEIGHT = 15;
export const MAP_PIXEL_WIDTH = MAP_GRID_WIDTH * TILE_SIZE; // 320
export const MAP_PIXEL_HEIGHT = MAP_GRID_HEIGHT * TILE_SIZE; // 240
export const TURN_TICK_INTERVAL = 3.0; // 3 seconds per global turn tick

export class TacticalEngine {
  public map: GameMap;
  public units: Unit[] = [];
  public projectiles: Projectile[] = [];
  public visualEffects: VisualEffect[] = [];
  public combatLog: CombatLogEntry[] = [];
  public status: GameStatus = 'playing';
  public stats: GameStats = {
    turnTickCount: 0,
    secondsElapsed: 0,
    marinesLost: 0,
    orksKilled: 0,
    tyranidsKilled: 0,
    eggsDestroyed: 0,
    eggsHatched: 0,
    grenadesThrown: 0,
    orkRushes: 0,
  };

  // Turn Tick Timer (3s countdown)
  public turnTickTimer: number = TURN_TICK_INTERVAL;
  public selectedUnitId: string | null = null;
  public targetingMode: 'none' | 'shoot' | 'grenade' = 'none';
  public targetAimPos: Position = { x: 0, y: 0 };
  public targetAimDir: Direction8 = 'up';

  // Smooth Camera Coordinates (top-left of viewport in map pixels)
  public cameraX: number = 0;
  public cameraY: number = 0;
  public targetCameraX: number = 0;
  public targetCameraY: number = 0;
  public screenShake: number = 0;

  // Listeners for UI state updates
  private onStateChangeCallbacks: Array<() => void> = [];

  constructor(map: GameMap) {
    this.map = map;
    this.initFromMap(map);
  }

  public subscribe(callback: () => void) {
    this.onStateChangeCallbacks.push(callback);
    return () => {
      this.onStateChangeCallbacks = this.onStateChangeCallbacks.filter((cb) => cb !== callback);
    };
  }

  private notifyStateChange() {
    for (const cb of this.onStateChangeCallbacks) {
      cb();
    }
  }

  public initFromMap(map: GameMap) {
    this.map = map;
    this.projectiles = [];
    this.visualEffects = [];
    this.combatLog = [];
    this.turnTickTimer = TURN_TICK_INTERVAL;
    this.status = 'playing';
    this.targetingMode = 'none';

    this.units = map.initialUnits.map((u, index) => {
      const isPlayer = u.team === 'player';
      return {
        id: u.id || `unit_${index}`,
        name: u.name || 'Soldier',
        faction: u.faction || 'space_marine',
        team: u.team || 'player',
        x: u.x || 2,
        y: u.y || 2,
        renderX: (u.x || 2) * TILE_SIZE,
        renderY: (u.y || 2) * TILE_SIZE,
        isMoving: false,
        moveProgress: 0,
        facing: u.facing || 'down',
        aimDirection: u.aimDirection || 'down',
        hp: u.hp || 5,
        maxHp: u.maxHp || u.hp || 5,
        atk: u.atk || 2,
        abilityName: u.abilityName || (isPlayer ? 'Frag Grenade' : 'Ability'),
        abilityDescription: u.abilityDescription || '',
        abilityCooldown: u.abilityCooldown || 7,
        currentCooldown: u.currentCooldown || 0,
        eggTimer: u.eggTimer ?? (u.faction === 'tyranid' ? 0 : undefined),
        eggTurnsToHatch: u.eggTurnsToHatch ?? (u.faction === 'egg' ? 3 : undefined),
        isDead: false,
        selected: isPlayer && index === 0,
        animFrame: 0,
        lastActionTime: 0,
        kills: 0,
        aiState: 'patrol',
      };
    });

    const firstMarine = this.units.find((u) => u.team === 'player');
    if (firstMarine) {
      this.selectedUnitId = firstMarine.id;
      this.targetCameraX = firstMarine.x * TILE_SIZE - VIEWPORT_WIDTH / 2 + TILE_SIZE / 2;
      this.targetCameraY = firstMarine.y * TILE_SIZE - VIEWPORT_HEIGHT / 2 + TILE_SIZE / 2;
      this.cameraX = this.targetCameraX;
      this.cameraY = this.targetCameraY;
    }

    this.addLog('SYSTEM: Tactical Crusade initialized. Purge all hostiles!', 'space_marine', 'info');
    this.notifyStateChange();
  }

  public getSelectedUnit(): Unit | undefined {
    return this.units.find((u) => u.id === this.selectedUnitId && !u.isDead);
  }

  public selectNextMarine() {
    const marines = this.units.filter((u) => u.team === 'player' && !u.isDead);
    if (marines.length === 0) return;
    const currentIndex = marines.findIndex((u) => u.id === this.selectedUnitId);
    const nextIndex = (currentIndex + 1) % marines.length;
    this.selectUnit(marines[nextIndex].id);
  }

  public selectUnit(unitId: string) {
    this.units.forEach((u) => {
      u.selected = u.id === unitId;
    });
    this.selectedUnitId = unitId;
    this.targetingMode = 'none';
    soundEngine.playUiClick();
    this.notifyStateChange();
  }

  public addLog(message: string, faction: Faction, type: CombatLogEntry['type']) {
    const time = new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' });
    this.combatLog.unshift({
      id: `log_${Date.now()}_${Math.random()}`,
      timestamp: time,
      message,
      faction,
      type,
    });
    if (this.combatLog.length > 30) {
      this.combatLog.pop();
    }
  }

  public isWalkable(gridX: number, gridY: number, ignoreUnitId?: string): boolean {
    if (gridX < 0 || gridX >= MAP_GRID_WIDTH || gridY < 0 || gridY >= MAP_GRID_HEIGHT) {
      return false;
    }
    const tileType = this.map.tiles[gridY]?.[gridX];
    if (!tileType) return false;

    // Obstacles that block walking
    if (
      tileType === 'wall_gothic' ||
      tileType === 'wall_barricade' ||
      tileType === 'cover_crate' ||
      tileType === 'toxic_vat' ||
      tileType === 'spore_chimney'
    ) {
      return false;
    }

    // Occupied by alive unit
    const unitAtTile = this.units.find(
      (u) => !u.isDead && u.id !== ignoreUnitId && (
        (u.x === gridX && u.y === gridY) ||
        (u.isMoving && u.targetX === gridX && u.targetY === gridY)
      )
    );

    return !unitAtTile;
  }

  // --- ACTIONS ---

  // Move Unit in 4 directions
  public moveSelectedUnit(dir: Direction4) {
    const unit = this.getSelectedUnit();
    if (!unit || unit.isMoving || unit.isDead || this.status !== 'playing') return;

    let dx = 0;
    let dy = 0;
    switch (dir) {
      case 'up': dy = -1; break;
      case 'down': dy = 1; break;
      case 'left': dx = -1; break;
      case 'right': dx = 1; break;
    }

    unit.facing = dir;
    unit.aimDirection = dir;

    const targetX = unit.x + dx;
    const targetY = unit.y + dy;

    if (this.isWalkable(targetX, targetY, unit.id)) {
      unit.isMoving = true;
      unit.moveProgress = 0;
      unit.targetX = targetX;
      unit.targetY = targetY;
      soundEngine.playUiClick();
    }
  }

  // Aim in 8 directions
  public aimSelectedUnit(dir: Direction8) {
    const unit = this.getSelectedUnit();
    if (!unit || unit.isDead) return;
    unit.aimDirection = dir;
    // Map to cardinal facing for sprite
    if (dir === 'up' || dir === 'up-right' || dir === 'up-left') unit.facing = 'up';
    else if (dir === 'down' || dir === 'down-right' || dir === 'down-left') unit.facing = 'down';
    else if (dir === 'left') unit.facing = 'left';
    else if (dir === 'right') unit.facing = 'right';
    this.notifyStateChange();
  }

  // Attack in aimed direction (8 directions, up to 6 tiles)
  public performPlayerAttack() {
    const unit = this.getSelectedUnit();
    if (!unit || unit.isDead || this.status !== 'playing') return;

    const dir = unit.aimDirection;
    const dirVector = this.getDirectionVector(dir);

    // Calculate line of sight
    let hitTarget: Unit | null = null;
    let endX = unit.x;
    let endY = unit.y;

    for (let step = 1; step <= 6; step++) {
      const checkX = Math.round(unit.x + dirVector.x * step);
      const checkY = Math.round(unit.y + dirVector.y * step);

      if (checkX < 0 || checkX >= MAP_GRID_WIDTH || checkY < 0 || checkY >= MAP_GRID_HEIGHT) break;

      const tile = this.map.tiles[checkY]?.[checkX];
      if (tile === 'wall_gothic' || tile === 'wall_barricade') {
        endX = checkX;
        endY = checkY;
        break;
      }

      const target = this.units.find((u) => !u.isDead && u.x === checkX && u.y === checkY);
      if (target) {
        hitTarget = target;
        endX = checkX;
        endY = checkY;
        break;
      }
      endX = checkX;
      endY = checkY;
    }

    soundEngine.playBolterFire();

    // Spawn bolter projectile
    this.projectiles.push({
      id: `proj_${Date.now()}`,
      type: 'bolter',
      startX: unit.x * TILE_SIZE + 8,
      startY: unit.y * TILE_SIZE + 8,
      targetX: endX * TILE_SIZE + 8,
      targetY: endY * TILE_SIZE + 8,
      currentX: unit.x * TILE_SIZE + 8,
      currentY: unit.y * TILE_SIZE + 8,
      progress: 0,
      duration: 0.15,
      damage: unit.atk,
      sourceId: unit.id,
    });

    // Muzzle flash visual
    this.visualEffects.push({
      id: `muzzle_${Date.now()}`,
      type: 'muzzle_flash',
      x: unit.x * TILE_SIZE + 8 + dirVector.x * 6,
      y: unit.y * TILE_SIZE + 8 + dirVector.y * 6,
      duration: 0.1,
      elapsed: 0,
    });

    this.addLog(`${unit.name.toUpperCase()} fires Bolter (${dir.toUpperCase()})!`, 'space_marine', 'attack');
  }

  // Trigger Frag Grenade (3x3 AoE, 3 DMG, range 5 tiles)
  public triggerFragGrenade(targetTile: Position) {
    const unit = this.getSelectedUnit();
    if (!unit || unit.isDead || unit.currentCooldown > 0 || this.status !== 'playing') return;

    // Check distance (max 5 tiles)
    const dist = Math.hypot(targetTile.x - unit.x, targetTile.y - unit.y);
    if (dist > 6) {
      this.addLog('Target out of grenade throwing range!', 'space_marine', 'info');
      return;
    }

    unit.currentCooldown = unit.abilityCooldown;
    this.targetingMode = 'none';
    this.stats.grenadesThrown++;

    soundEngine.playGrenadeThrow();

    // Spawn grenade projectile with arc
    this.projectiles.push({
      id: `grenade_${Date.now()}`,
      type: 'grenade',
      startX: unit.x * TILE_SIZE + 8,
      startY: unit.y * TILE_SIZE + 8,
      targetX: targetTile.x * TILE_SIZE + 8,
      targetY: targetTile.y * TILE_SIZE + 8,
      currentX: unit.x * TILE_SIZE + 8,
      currentY: unit.y * TILE_SIZE + 8,
      progress: 0,
      duration: 0.45,
      arcHeight: 28,
      damage: 3,
      aoeRadius: 1, // 3x3
      sourceId: unit.id,
    });

    this.addLog(`${unit.name.toUpperCase()} hurls Frag Grenade at [${targetTile.x}, ${targetTile.y}]!`, 'space_marine', 'ability');
  }

  // Helper direction vector
  public getDirectionVector(dir: Direction8): { x: number; y: number } {
    switch (dir) {
      case 'up': return { x: 0, y: -1 };
      case 'up-right': return { x: 0.707, y: -0.707 };
      case 'right': return { x: 1, y: 0 };
      case 'down-right': return { x: 0.707, y: 0.707 };
      case 'down': return { x: 0, y: 1 };
      case 'down-left': return { x: -0.707, y: 0.707 };
      case 'left': return { x: -1, y: 0 };
      case 'up-left': return { x: -0.707, y: -0.707 };
      default: return { x: 0, y: 1 };
    }
  }

  // --- ENGINE UPDATE LOOP (Called every RAF delta) ---
  public update(delta: number) {
    if (this.status !== 'playing' && this.status !== 'briefing') return;

    this.stats.secondsElapsed += delta;

    // 1. Update Turn Tick Timer (every 3 seconds)
    this.turnTickTimer -= delta;
    if (this.turnTickTimer <= 0) {
      this.turnTickTimer += TURN_TICK_INTERVAL;
      this.handleTurnTick();
    }

    // 2. Update Units (Movement interpolation, animation, cooldowns, AI)
    for (const unit of this.units) {
      if (unit.isDead) continue;

      // Cooldown timer decay
      if (unit.currentCooldown > 0) {
        unit.currentCooldown = Math.max(0, unit.currentCooldown - delta);
      }

      // Anim frame
      unit.animFrame += delta * 4;

      // Moving interpolation
      if (unit.isMoving && unit.targetX !== undefined && unit.targetY !== undefined) {
        unit.moveProgress += delta * 4.5; // ~0.22s per tile
        if (unit.moveProgress >= 1) {
          unit.moveProgress = 1;
          unit.x = unit.targetX;
          unit.y = unit.targetY;
          unit.renderX = unit.x * TILE_SIZE;
          unit.renderY = unit.y * TILE_SIZE;
          unit.isMoving = false;
          unit.targetX = undefined;
          unit.targetY = undefined;
        } else {
          unit.renderX = (unit.x + (unit.targetX - unit.x) * unit.moveProgress) * TILE_SIZE;
          unit.renderY = (unit.y + (unit.targetY - unit.y) * unit.moveProgress) * TILE_SIZE;
        }
      } else {
        unit.renderX = unit.x * TILE_SIZE;
        unit.renderY = unit.y * TILE_SIZE;
      }

      // Enemy AI decision step
      if (unit.team === 'enemy' && !unit.isMoving) {
        this.updateEnemyAI(unit, delta);
      }
    }

    // 3. Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.progress += delta / p.duration;

      if (p.progress >= 1) {
        p.progress = 1;
        this.handleProjectileImpact(p);
        this.projectiles.splice(i, 1);
      } else {
        p.currentX = p.startX + (p.targetX - p.startX) * p.progress;
        p.currentY = p.startY + (p.targetY - p.startY) * p.progress;
      }
    }

    // 4. Update Visual Effects
    for (let i = this.visualEffects.length - 1; i >= 0; i--) {
      const effect = this.visualEffects[i];
      effect.elapsed += delta;
      if (effect.elapsed >= effect.duration) {
        this.visualEffects.splice(i, 1);
      }
    }

    // 5. Screen shake decay
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - delta * 15);
    }

    // 6. Smooth Camera Tracking
    const selected = this.getSelectedUnit();
    if (selected) {
      this.targetCameraX = selected.renderX - VIEWPORT_WIDTH / 2 + TILE_SIZE / 2;
      this.targetCameraY = selected.renderY - VIEWPORT_HEIGHT / 2 + TILE_SIZE / 2;
    }

    // Clamp camera within map bounds
    const maxCamX = MAP_PIXEL_WIDTH - VIEWPORT_WIDTH;
    const maxCamY = MAP_PIXEL_HEIGHT - VIEWPORT_HEIGHT;
    this.targetCameraX = Math.max(0, Math.min(maxCamX, this.targetCameraX));
    this.targetCameraY = Math.max(0, Math.min(maxCamY, this.targetCameraY));

    // Lerp camera
    this.cameraX += (this.targetCameraX - this.cameraX) * 0.12;
    this.cameraY += (this.targetCameraY - this.cameraY) * 0.12;

    // 7. Win / Loss Condition Check
    this.checkWinLoss();
  }

  // --- TURN TICK (Every 3.0 Seconds) ---
  private handleTurnTick() {
    this.stats.turnTickCount++;
    soundEngine.playTurnTick();

    this.addLog(`[TURN ${this.stats.turnTickCount}] Global Turn Tick (3s)`, 'space_marine', 'turn');

    // 1. Tyranid Egg Incubation & Laying Check
    for (const unit of [...this.units]) {
      if (unit.isDead) continue;

      // Tyranid: Lay egg every 5 turns
      if (unit.faction === 'tyranid') {
        unit.eggTimer = (unit.eggTimer ?? 0) + 1;
        if (unit.eggTimer >= 5) {
          unit.eggTimer = 0;
          this.layTyranidEgg(unit);
        }
      }

      // Bio-Egg: Incubate countdown (3 turns to hatch)
      if (unit.faction === 'egg') {
        if (unit.eggTurnsToHatch !== undefined) {
          unit.eggTurnsToHatch -= 1;
          this.addLog(`Bio-Egg incubates... (${unit.eggTurnsToHatch} turns left to hatch)`, 'tyranid', 'egg');

          if (unit.eggTurnsToHatch <= 0) {
            this.hatchTyranidEgg(unit);
          }
        }
      }
    }

    this.notifyStateChange();
  }

  // Lay Tyranid Egg on adjacent empty tile
  private layTyranidEgg(parent: Unit) {
    const adjTiles = [
      { x: parent.x + 1, y: parent.y },
      { x: parent.x - 1, y: parent.y },
      { x: parent.x, y: parent.y + 1 },
      { x: parent.x, y: parent.y - 1 },
    ];

    const freeTile = adjTiles.find((t) => this.isWalkable(t.x, t.y));
    if (freeTile) {
      const newEgg: Unit = {
        id: `egg_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        name: 'Incubating Bio-Egg',
        faction: 'egg',
        team: 'enemy',
        x: freeTile.x,
        y: freeTile.y,
        renderX: freeTile.x * TILE_SIZE,
        renderY: freeTile.y * TILE_SIZE,
        isMoving: false,
        moveProgress: 0,
        facing: 'down',
        aimDirection: 'down',
        hp: 2,
        maxHp: 2,
        atk: 0,
        abilityName: 'Incubating',
        abilityDescription: 'Hatches into Tyranid Gaunt in 3 turns',
        abilityCooldown: 0,
        currentCooldown: 0,
        eggTurnsToHatch: 3,
        isDead: false,
        animFrame: 0,
        lastActionTime: 0,
        kills: 0,
      };

      this.units.push(newEgg);
      soundEngine.playTyranidEgg();
      this.visualEffects.push({
        id: `egg_spawn_${Date.now()}`,
        type: 'dust_rush',
        x: freeTile.x * TILE_SIZE + 8,
        y: freeTile.y * TILE_SIZE + 8,
        duration: 0.3,
        elapsed: 0,
      });

      this.addLog(`${parent.name} lays a Bio-Egg! Destroy it within 3 turns!`, 'tyranid', 'egg');
    }
  }

  // Hatch Egg into a new Tyranid Gaunt
  private hatchTyranidEgg(egg: Unit) {
    egg.isDead = true;
    this.stats.eggsHatched++;
    soundEngine.playTyranidEgg();

    const newTyranid: Unit = {
      id: `tyranid_hatched_${Date.now()}`,
      name: 'Spawned Tyranid Gaunt',
      faction: 'tyranid',
      team: 'enemy',
      x: egg.x,
      y: egg.y,
      renderX: egg.x * TILE_SIZE,
      renderY: egg.y * TILE_SIZE,
      isMoving: false,
      moveProgress: 0,
      facing: 'down',
      aimDirection: 'down',
      hp: 3,
      maxHp: 3,
      atk: 1,
      abilityName: 'Lay Egg',
      abilityDescription: 'Lays egg every 5 turns',
      abilityCooldown: 15,
      currentCooldown: 3,
      eggTimer: 0,
      isDead: false,
      animFrame: 0,
      lastActionTime: 0,
      kills: 0,
    };

    this.units.push(newTyranid);

    this.visualEffects.push({
      id: `hatch_fx_${Date.now()}`,
      type: 'egg_hatch',
      x: egg.x * TILE_SIZE + 8,
      y: egg.y * TILE_SIZE + 8,
      duration: 0.5,
      elapsed: 0,
    });

    this.addLog('WARNING: A Bio-Egg has HATCHED into a new Tyranid Gaunt!', 'tyranid', 'egg');
  }

  // --- ENEMY AI ---
  private updateEnemyAI(enemy: Unit, delta: number) {
    if (enemy.faction === 'egg') return; // Eggs do not move/act

    const now = this.stats.secondsElapsed;
    if (now - enemy.lastActionTime < 1.0) return; // Action rate limit (~1 action per 1-1.5s)

    // Find closest alive Space Marine
    const aliveMarines = this.units.filter((u) => u.team === 'player' && !u.isDead);
    if (aliveMarines.length === 0) return;

    let closestMarine = aliveMarines[0];
    let minDistance = Math.hypot(closestMarine.x - enemy.x, closestMarine.y - enemy.y);

    for (const marine of aliveMarines) {
      const d = Math.hypot(marine.x - enemy.x, marine.y - enemy.y);
      if (d < minDistance) {
        minDistance = d;
        closestMarine = marine;
      }
    }

    // 1. ORK AI:
    if (enemy.faction === 'ork') {
      // Check if Ork can perform WAAAGH! Rush (straight line aligned with player within 3-4 tiles)
      const dx = closestMarine.x - enemy.x;
      const dy = closestMarine.y - enemy.y;
      const isAlignedX = dy === 0 && Math.abs(dx) <= 4 && Math.abs(dx) >= 2;
      const isAlignedY = dx === 0 && Math.abs(dy) <= 4 && Math.abs(dy) >= 2;

      if ((isAlignedX || isAlignedY) && enemy.currentCooldown <= 0) {
        this.performOrkRush(enemy, isAlignedX ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
        enemy.lastActionTime = now;
        return;
      }

      // If adjacent to marine (dist == 1), attack melee/choppa!
      if (minDistance <= 1.5) {
        this.performEnemyAttack(enemy, closestMarine);
        enemy.lastActionTime = now;
        return;
      }

      // Otherwise step towards closest marine
      this.stepTowards(enemy, closestMarine.x, closestMarine.y);
      enemy.lastActionTime = now;
      return;
    }

    // 2. TYRANID AI:
    if (enemy.faction === 'tyranid') {
      // If adjacent to marine, attack!
      if (minDistance <= 1.5) {
        this.performEnemyAttack(enemy, closestMarine);
        enemy.lastActionTime = now;
        return;
      }

      // Move toward closest marine (or flank)
      this.stepTowards(enemy, closestMarine.x, closestMarine.y);
      enemy.lastActionTime = now;
      return;
    }
  }

  // Ork WAAAGH Rush Ability: Charges 3 tiles forward violently, dealing 2 dmg
  private performOrkRush(ork: Unit, dir: Direction4) {
    ork.currentCooldown = ork.abilityCooldown;
    this.stats.orkRushes++;
    soundEngine.playOrkRush();
    this.screenShake = 4;

    let stepX = 0;
    let stepY = 0;
    switch (dir) {
      case 'right': stepX = 1; break;
      case 'left': stepX = -1; break;
      case 'down': stepY = 1; break;
      case 'up': stepY = -1; break;
    }

    ork.facing = dir;
    this.addLog(`WAAAGH! ${ork.name.toUpperCase()} rushes ${dir.toUpperCase()}!`, 'ork', 'ability');

    // Rush up to 3 tiles
    let targetX = ork.x;
    let targetY = ork.y;

    for (let i = 1; i <= 3; i++) {
      const nextX = ork.x + stepX * i;
      const nextY = ork.y + stepY * i;

      // Check wall
      if (!this.isWalkable(nextX, nextY, ork.id)) {
        // Check if there is a unit to ram!
        const hitUnit = this.units.find((u) => !u.isDead && u.x === nextX && u.y === nextY);
        if (hitUnit && hitUnit.team === 'player') {
          this.applyDamage(hitUnit, 2, 'Ork WAAAGH Rush');
          targetX = nextX - stepX;
          targetY = nextY - stepY;
        }
        break;
      }
      targetX = nextX;
      targetY = nextY;
    }

    if (targetX !== ork.x || targetY !== ork.y) {
      ork.isMoving = true;
      ork.moveProgress = 0;
      ork.targetX = targetX;
      ork.targetY = targetY;
    }

    this.visualEffects.push({
      id: `rush_fx_${Date.now()}`,
      type: 'dust_rush',
      x: ork.x * TILE_SIZE + 8,
      y: ork.y * TILE_SIZE + 8,
      duration: 0.4,
      elapsed: 0,
    });
  }

  // Enemy Basic Attack
  private performEnemyAttack(enemy: Unit, target: Unit) {
    soundEngine.playHit();
    this.applyDamage(target, enemy.atk, `${enemy.name} attack`);
    this.addLog(`${enemy.name.toUpperCase()} strikes ${target.name.toUpperCase()} for ${enemy.atk} DMG!`, enemy.faction, 'attack');

    this.visualEffects.push({
      id: `hit_fx_${Date.now()}`,
      type: 'hit_spark',
      x: target.x * TILE_SIZE + 8,
      y: target.y * TILE_SIZE + 8,
      duration: 0.15,
      elapsed: 0,
    });
  }

  // AI Step towards target
  private stepTowards(unit: Unit, targetX: number, targetY: number) {
    const dx = targetX - unit.x;
    const dy = targetY - unit.y;

    const possibleMoves: { dir: Direction4; x: number; y: number; dist: number }[] = [];

    const dirs: { dir: Direction4; dx: number; dy: number }[] = [
      { dir: 'up', dx: 0, dy: -1 },
      { dir: 'down', dx: 0, dy: 1 },
      { dir: 'left', dx: -1, dy: 0 },
      { dir: 'right', dx: 1, dy: 0 },
    ];

    for (const d of dirs) {
      const nx = unit.x + d.dx;
      const ny = unit.y + d.dy;
      if (this.isWalkable(nx, ny, unit.id)) {
        const dist = Math.hypot(targetX - nx, targetY - ny);
        possibleMoves.push({ dir: d.dir, x: nx, y: ny, dist });
      }
    }

    if (possibleMoves.length > 0) {
      possibleMoves.sort((a, b) => a.dist - b.dist);
      const bestMove = possibleMoves[0];
      unit.facing = bestMove.dir;
      unit.aimDirection = bestMove.dir;
      unit.isMoving = true;
      unit.moveProgress = 0;
      unit.targetX = bestMove.x;
      unit.targetY = bestMove.y;
    }
  }

  // --- PROJECTILE IMPACTS & DAMAGE ---
  private handleProjectileImpact(p: Projectile) {
    const targetTileX = Math.floor(p.targetX / TILE_SIZE);
    const targetTileY = Math.floor(p.targetY / TILE_SIZE);

    // 1. Grenade Explosion 3x3 AoE
    if (p.type === 'grenade') {
      soundEngine.playExplosion();
      this.screenShake = 6;

      this.visualEffects.push({
        id: `exp_${Date.now()}`,
        type: 'explosion_3x3',
        x: p.targetX,
        y: p.targetY,
        duration: 0.45,
        elapsed: 0,
        radius: 24,
      });

      // Damage all units in 3x3 grid (radius = 1 tile around targetTile)
      for (const unit of this.units) {
        if (unit.isDead) continue;
        const dx = Math.abs(unit.x - targetTileX);
        const dy = Math.abs(unit.y - targetTileY);
        if (dx <= 1 && dy <= 1) {
          this.applyDamage(unit, p.damage, 'Frag Grenade 3x3');
        }
      }

      // Destroy breakable crates in 3x3
      for (let y = targetTileY - 1; y <= targetTileY + 1; y++) {
        for (let x = targetTileX - 1; x <= targetTileX + 1; x++) {
          if (this.map.tiles[y]?.[x] === 'cover_crate') {
            this.map.tiles[y][x] = 'floor_ruins';
          }
        }
      }

      this.addLog(`KABOOM! Frag Grenade detonates in 3x3 sector [${targetTileX}, ${targetTileY}]!`, 'space_marine', 'ability');
      return;
    }

    // 2. Bolter / Direct Shot Impact
    if (p.type === 'bolter') {
      const hitUnit = this.units.find((u) => !u.isDead && u.x === targetTileX && u.y === targetTileY);
      if (hitUnit) {
        soundEngine.playHit();
        this.applyDamage(hitUnit, p.damage, 'Bolter Shot');
        this.visualEffects.push({
          id: `spark_${Date.now()}`,
          type: 'hit_spark',
          x: p.targetX,
          y: p.targetY,
          duration: 0.15,
          elapsed: 0,
        });
      }
    }
  }

  // Apply damage and handle death
  public applyDamage(target: Unit, amount: number, sourceName: string) {
    if (target.isDead) return;

    target.hp = Math.max(0, target.hp - amount);

    // Floating damage number
    this.visualEffects.push({
      id: `dmg_num_${Date.now()}_${Math.random()}`,
      type: 'damage_number',
      x: target.renderX + 8,
      y: target.renderY,
      duration: 0.6,
      elapsed: 0,
      text: `-${amount}`,
    });

    if (target.hp <= 0) {
      target.isDead = true;
      soundEngine.playDeath();

      if (target.team === 'player') {
        this.stats.marinesLost++;
        this.addLog(`CASUALTY: Space Marine ${target.name.toUpperCase()} has fallen!`, 'space_marine', 'kill');
      } else {
        if (target.faction === 'ork') {
          this.stats.orksKilled++;
          this.addLog(`PURGED: Ork ${target.name.toUpperCase()} eliminated!`, 'ork', 'kill');
        } else if (target.faction === 'tyranid') {
          this.stats.tyranidsKilled++;
          this.addLog(`PURGED: Tyranid ${target.name.toUpperCase()} destroyed!`, 'tyranid', 'kill');
        } else if (target.faction === 'egg') {
          this.stats.eggsDestroyed++;
          this.addLog('NEUTRALIZED: Tyranid Bio-Egg crushed before hatching!', 'egg', 'kill');
        }

        // Increment kill count for selected marine
        const selected = this.getSelectedUnit();
        if (selected) {
          selected.kills++;
        }
      }
    }
  }

  // Check Win / Loss Condition
  private checkWinLoss() {
    if (this.status !== 'playing') return;

    // Check Loss: All Marines Dead
    const aliveMarines = this.units.filter((u) => u.team === 'player' && !u.isDead);
    if (aliveMarines.length === 0) {
      this.status = 'defeat';
      soundEngine.playDefeat();
      this.addLog('MISSION FAILED: All Space Marines were wiped out.', 'space_marine', 'kill');
      this.notifyStateChange();
      return;
    }

    // Check Win: All Enemies (Orks, Tyranids, Eggs) Eliminated
    const aliveEnemies = this.units.filter((u) => u.team === 'enemy' && !u.isDead);
    if (aliveEnemies.length === 0) {
      this.status = 'victory';
      soundEngine.playVictory();
      this.addLog('PURGE COMPLETE: All xenos hostiles & bio-eggs eliminated! VICTORY FOR THE EMPEROR!', 'space_marine', 'kill');
      this.notifyStateChange();
    }
  }
}
