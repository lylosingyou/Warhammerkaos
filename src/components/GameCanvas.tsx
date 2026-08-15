import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  TacticalEngine,
  TILE_SIZE,
  VIEWPORT_WIDTH,
  VIEWPORT_HEIGHT,
  MAP_GRID_WIDTH,
  MAP_GRID_HEIGHT,
} from '../game/engine';
import { GamePalette } from '../game/types';
import {
  drawSprite,
  getTileSprite,
  getUnitSprite,
  TARGET_RETICLE,
  GRENADE_SPRITE,
  SKULL_ICON,
} from '../game/sprites';

interface GameCanvasProps {
  engine: TacticalEngine;
  palette: GamePalette;
  lcdGridEnabled: boolean;
  scale: number;
  onTileClick?: (gridX: number, gridY: number) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  engine,
  palette,
  lcdGridEnabled,
  scale = 4,
  onTileClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoverTile, setHoverTile] = useState<{ x: number; y: number } | null>(null);
  const reqIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Game Loop rendering
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const now = performance.now();
    const delta = Math.min((now - lastTimeRef.current) / 1000, 0.1); // clamp delta
    lastTimeRef.current = now;

    // Update engine
    engine.update(delta);

    // Disable image smoothing for crisp pixel art
    ctx.imageSmoothingEnabled = false;

    // Clear background to Darkest palette color (0) or LCD background (3)
    ctx.fillStyle = palette.colors[3]; // Lightest GB green screen base
    ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    // Apply Screen Shake
    ctx.save();
    if (engine.screenShake > 0) {
      const shakeX = (Math.random() * 2 - 1) * engine.screenShake;
      const shakeY = (Math.random() * 2 - 1) * engine.screenShake;
      ctx.translate(Math.round(shakeX), Math.round(shakeY));
    }

    const camX = Math.round(engine.cameraX);
    const camY = Math.round(engine.cameraY);

    // 1. Draw Visible Map Tiles
    const startTileX = Math.max(0, Math.floor(camX / TILE_SIZE));
    const endTileX = Math.min(MAP_GRID_WIDTH - 1, Math.ceil((camX + VIEWPORT_WIDTH) / TILE_SIZE));
    const startTileY = Math.max(0, Math.floor(camY / TILE_SIZE));
    const endTileY = Math.min(MAP_GRID_HEIGHT - 1, Math.ceil((camY + VIEWPORT_HEIGHT) / TILE_SIZE));

    for (let ty = startTileY; ty <= endTileY; ty++) {
      for (let tx = startTileX; tx <= endTileX; tx++) {
        const tileType = engine.map.tiles[ty]?.[tx] || 'floor_metal';
        const sprite = getTileSprite(tileType);
        const px = tx * TILE_SIZE - camX;
        const py = ty * TILE_SIZE - camY;
        drawSprite(ctx, sprite, px, py, palette.colors);
      }
    }

    // 2. Draw 3x3 Grenade AoE Target Range (if in grenade mode)
    const selectedMarine = engine.getSelectedUnit();
    if (engine.targetingMode === 'grenade' && selectedMarine) {
      const targetPos = hoverTile || { x: selectedMarine.x, y: selectedMarine.y };
      const dist = Math.hypot(targetPos.x - selectedMarine.x, targetPos.y - selectedMarine.y);
      const inRange = dist <= 6;

      for (let gy = targetPos.y - 1; gy <= targetPos.y + 1; gy++) {
        for (let gx = targetPos.x - 1; gx <= targetPos.x + 1; gx++) {
          if (gx >= 0 && gx < MAP_GRID_WIDTH && gy >= 0 && gy < MAP_GRID_HEIGHT) {
            const px = gx * TILE_SIZE - camX;
            const py = gy * TILE_SIZE - camY;
            ctx.strokeStyle = inRange ? palette.colors[0] : palette.colors[1];
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            ctx.strokeRect(px + 0.5, py + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
            ctx.setLineDash([]);
          }
        }
      }

      // Draw Grenade Crosshair on center
      const cpx = targetPos.x * TILE_SIZE - camX;
      const cpy = targetPos.y * TILE_SIZE - camY;
      drawSprite(ctx, GRENADE_SPRITE, cpx, cpy, palette.colors, { opacity: 0.8 });
    }

    // 3. Draw 8-Direction Aim Laser / Reticle (if Marine selected)
    if (selectedMarine && !selectedMarine.isDead) {
      const dirVec = engine.getDirectionVector(selectedMarine.aimDirection);
      const startX = selectedMarine.renderX + 8 - camX;
      const startY = selectedMarine.renderY + 8 - camY;
      const targetPxX = startX + dirVec.x * (TILE_SIZE * 3.5);
      const targetPxY = startY + dirVec.y * (TILE_SIZE * 3.5);

      // Aim dotted laser line
      ctx.save();
      ctx.strokeStyle = palette.colors[0];
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(targetPxX, targetPxY);
      ctx.stroke();
      ctx.restore();
    }

    // 4. Draw Units (Sorted by Y for depth)
    const sortedUnits = [...engine.units].sort((a, b) => a.y - b.y);
    for (const unit of sortedUnits) {
      if (unit.isDead) continue;

      const px = Math.round(unit.renderX - camX);
      const py = Math.round(unit.renderY - camY);

      // Skip if off-screen
      if (px < -16 || px > VIEWPORT_WIDTH || py < -16 || py > VIEWPORT_HEIGHT) continue;

      const { sprite, flipH } = getUnitSprite(unit);
      drawSprite(ctx, sprite, px, py, palette.colors, { flipH });

      // Selection Marker / Reticle
      if (unit.selected && unit.team === 'player') {
        drawSprite(ctx, TARGET_RETICLE, px, py, palette.colors);
      }

      // Health Bar / Pips above unit head
      const hpWidth = 14;
      const hpX = px + 1;
      const hpY = py - 3;

      ctx.fillStyle = palette.colors[0]; // Darkest outline
      ctx.fillRect(hpX - 1, hpY - 1, hpWidth + 2, 3);
      ctx.fillStyle = palette.colors[3]; // Empty bar
      ctx.fillRect(hpX, hpY, hpWidth, 2);

      const fillRatio = Math.max(0, unit.hp / unit.maxHp);
      const filledWidth = Math.round(hpWidth * fillRatio);
      ctx.fillStyle = unit.team === 'player' ? palette.colors[1] : palette.colors[0];
      ctx.fillRect(hpX, hpY, filledWidth, 2);

      // Tyranid Egg incubation timer indicator
      if (unit.faction === 'egg' && unit.eggTurnsToHatch !== undefined) {
        ctx.fillStyle = palette.colors[0];
        ctx.font = '6px monospace';
        ctx.fillText(`T:${unit.eggTurnsToHatch}`, px + 2, py + 22);
      }
    }

    // 5. Draw Projectiles
    for (const p of engine.projectiles) {
      const curX = p.currentX - camX;
      const curY = p.currentY - camY;

      if (p.type === 'bolter') {
        // High-speed tracer pulse
        ctx.fillStyle = palette.colors[0];
        ctx.fillRect(Math.round(curX - 1), Math.round(curY - 1), 3, 3);
        ctx.fillStyle = palette.colors[2];
        ctx.fillRect(Math.round(curX), Math.round(curY), 1, 1);
      } else if (p.type === 'grenade') {
        // Parabolic arc grenade
        const arc = Math.sin(p.progress * Math.PI) * (p.arcHeight || 20);
        const drawY = curY - arc;

        // Shadow
        ctx.fillStyle = palette.colors[1];
        ctx.fillRect(Math.round(curX - 2), Math.round(curY), 4, 1);

        // Grenade icon
        drawSprite(ctx, GRENADE_SPRITE, Math.round(curX - 8), Math.round(drawY - 8), palette.colors);
      }
    }

    // 6. Draw Visual Effects (Explosions, hit sparks, smoke, damage numbers)
    for (const fx of engine.visualEffects) {
      const fxX = fx.x - camX;
      const fxY = fx.y - camY;
      const progress = fx.elapsed / fx.duration;

      if (fx.type === 'explosion_3x3') {
        // Shockwave circles + shrapnel
        const radius = (fx.radius || 24) * progress;
        ctx.save();
        ctx.strokeStyle = palette.colors[0];
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(fxX, fxY, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Shrapnel bits
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2 + progress;
          const dist = radius * 1.2;
          const sx = fxX + Math.cos(angle) * dist;
          const sy = fxY + Math.sin(angle) * dist;
          ctx.fillStyle = palette.colors[1];
          ctx.fillRect(Math.round(sx), Math.round(sy), 2, 2);
        }
        ctx.restore();
      } else if (fx.type === 'hit_spark') {
        ctx.fillStyle = palette.colors[0];
        ctx.fillRect(Math.round(fxX - 2), Math.round(fxY - 2), 4, 4);
        ctx.fillStyle = palette.colors[3];
        ctx.fillRect(Math.round(fxX - 1), Math.round(fxY - 1), 2, 2);
      } else if (fx.type === 'muzzle_flash') {
        ctx.fillStyle = palette.colors[0];
        ctx.beginPath();
        ctx.arc(fxX, fxY, 4 * (1 - progress), 0, Math.PI * 2);
        ctx.fill();
      } else if (fx.type === 'damage_number' && fx.text) {
        // Floating 8-bit text
        const floatY = fxY - progress * 14;
        ctx.fillStyle = palette.colors[0];
        ctx.font = 'bold 8px monospace';
        ctx.fillText(fx.text, Math.round(fxX - 4), Math.round(floatY));
      } else if (fx.type === 'dust_rush' || fx.type === 'egg_hatch') {
        ctx.fillStyle = palette.colors[1];
        ctx.fillRect(Math.round(fxX - 4 + progress * 8), Math.round(fxY), 3, 2);
        ctx.fillRect(Math.round(fxX + 4 - progress * 8), Math.round(fxY - 2), 2, 3);
      }
    }

    ctx.restore(); // restore screen shake

    // 7. Top HUD Banner on GameBoy Screen
    // Mini-status strip: Turn tick countdown & selected marine HP
    ctx.fillStyle = palette.colors[0];
    ctx.fillRect(0, 0, VIEWPORT_WIDTH, 10);
    ctx.fillStyle = palette.colors[3];
    ctx.font = 'bold 7px monospace';

    const turnRatio = Math.max(0, engine.turnTickTimer / 3.0);
    const tickBarW = Math.round(28 * turnRatio);

    ctx.fillText(`TICK`, 2, 7);
    ctx.fillStyle = palette.colors[2];
    ctx.fillRect(24, 2, 28, 5);
    ctx.fillStyle = palette.colors[0];
    ctx.fillRect(24, 2, 28 - tickBarW, 5);

    // Marine count & Enemy count
    const aliveM = engine.units.filter((u) => u.team === 'player' && !u.isDead).length;
    const aliveE = engine.units.filter((u) => u.team === 'enemy' && !u.isDead).length;
    ctx.fillStyle = palette.colors[3];
    ctx.fillText(`M:${aliveM} E:${aliveE}`, 60, 7);

    // Selected Unit HP
    if (selectedMarine) {
      ctx.fillText(`HP:${selectedMarine.hp}/${selectedMarine.maxHp}`, 116, 7);
    }

    // 8. Victory / Defeat Overlay Screen
    if (engine.status === 'victory') {
      ctx.fillStyle = palette.colors[0];
      ctx.fillRect(16, 36, VIEWPORT_WIDTH - 32, 72);
      ctx.fillStyle = palette.colors[3];
      ctx.fillRect(18, 38, VIEWPORT_WIDTH - 36, 68);
      ctx.fillStyle = palette.colors[0];
      ctx.font = 'bold 10px monospace';
      ctx.fillText('MISSION COMPLETE', 24, 54);
      ctx.font = '7px monospace';
      ctx.fillText('FOR THE EMPEROR!', 36, 68);
      ctx.fillText('All Xenos Purged', 36, 80);
      ctx.fillText('[START] Next Sector', 30, 96);
    } else if (engine.status === 'defeat') {
      ctx.fillStyle = palette.colors[0];
      ctx.fillRect(16, 36, VIEWPORT_WIDTH - 32, 72);
      ctx.fillStyle = palette.colors[3];
      ctx.fillRect(18, 38, VIEWPORT_WIDTH - 36, 68);
      ctx.fillStyle = palette.colors[0];
      ctx.font = 'bold 10px monospace';
      ctx.fillText('MISSION FAILED', 34, 54);
      ctx.font = '7px monospace';
      ctx.fillText('Squad Wiped Out', 40, 68);
      ctx.fillText('Xenos Overrun Base', 32, 80);
      ctx.fillText('[START] Retry Sector', 28, 96);
    }

    reqIdRef.current = requestAnimationFrame(render);
  }, [engine, palette, hoverTile]);

  // Start Animation Loop
  useEffect(() => {
    lastTimeRef.current = performance.now();
    reqIdRef.current = requestAnimationFrame(render);
    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
    };
  }, [render]);

  // Handle Canvas Mouse Move / Click
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = VIEWPORT_WIDTH / rect.width;
    const scaleY = VIEWPORT_HEIGHT / rect.height;

    const screenX = (e.clientX - rect.left) * scaleX;
    const screenY = (e.clientY - rect.top) * scaleY;

    const mapX = screenX + engine.cameraX;
    const mapY = screenY + engine.cameraY;

    const gx = Math.floor(mapX / TILE_SIZE);
    const gy = Math.floor(mapY / TILE_SIZE);

    if (gx >= 0 && gx < MAP_GRID_WIDTH && gy >= 0 && gy < MAP_GRID_HEIGHT) {
      setHoverTile({ x: gx, y: gy });
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !hoverTile) return;

    if (engine.status === 'victory' || engine.status === 'defeat') {
      // Re-trigger
      engine.initFromMap(engine.map);
      return;
    }

    // Check if clicked on a player Marine to select them
    const clickedMarine = engine.units.find(
      (u) => !u.isDead && u.team === 'player' && u.x === hoverTile.x && u.y === hoverTile.y
    );
    if (clickedMarine) {
      engine.selectUnit(clickedMarine.id);
      return;
    }

    // If in Grenade Targeting mode
    if (engine.targetingMode === 'grenade') {
      engine.triggerFragGrenade(hoverTile);
      return;
    }

    // If in Shoot Targeting mode or clicked an enemy
    const clickedEnemy = engine.units.find(
      (u) => !u.isDead && u.team === 'enemy' && u.x === hoverTile.x && u.y === hoverTile.y
    );
    if (clickedEnemy) {
      // Calculate aim direction to enemy
      const selected = engine.getSelectedUnit();
      if (selected) {
        const dx = clickedEnemy.x - selected.x;
        const dy = clickedEnemy.y - selected.y;
        if (Math.abs(dx) > Math.abs(dy)) {
          selected.aimDirection = dx > 0 ? 'right' : 'left';
        } else {
          selected.aimDirection = dy > 0 ? 'down' : 'up';
        }
        engine.performPlayerAttack();
      }
      return;
    }

    // Otherwise standard move towards clicked tile
    const selected = engine.getSelectedUnit();
    if (selected) {
      const dx = hoverTile.x - selected.x;
      const dy = hoverTile.y - selected.y;
      if (Math.abs(dx) >= Math.abs(dy)) {
        if (dx > 0) engine.moveSelectedUnit('right');
        else if (dx < 0) engine.moveSelectedUnit('left');
      } else {
        if (dy > 0) engine.moveSelectedUnit('down');
        else if (dy < 0) engine.moveSelectedUnit('up');
      }
    }

    if (onTileClick) {
      onTileClick(hoverTile.x, hoverTile.y);
    }
  };

  return (
    <div
      id="gameboy-screen-wrapper"
      className="relative flex items-center justify-center select-none overflow-hidden rounded-md shadow-inner bg-[#8bac0f]"
      style={{
        width: VIEWPORT_WIDTH * scale,
        height: VIEWPORT_HEIGHT * scale,
      }}
    >
      <canvas
        id="gameboy-canvas"
        ref={canvasRef}
        width={VIEWPORT_WIDTH}
        height={VIEWPORT_HEIGHT}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverTile(null)}
        onClick={handleClick}
        className="w-full h-full cursor-crosshair rendering-pixelated"
        style={{
          imageRendering: 'pixelated',
        }}
      />

      {/* Optional Authentic LCD Dot-Matrix Screen Filter */}
      {lcdGridEnabled && (
        <div
          id="lcd-dotmatrix-overlay"
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage: `
              radial-gradient(circle, rgba(15, 56, 15, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: `${scale}px ${scale}px`,
          }}
        />
      )}

      {/* Subtle CRT screen scanline & glass reflection overlay */}
      <div
        id="screen-glass-reflection"
        className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/10 via-transparent to-black/15 mix-blend-overlay"
      />
    </div>
  );
};
