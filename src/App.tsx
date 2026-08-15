import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TacticalEngine } from './game/engine';
import { CAMPAIGN_MISSIONS, getSpaceHulkMission } from './game/maps';
import { GAME_PALETTES, DEFAULT_PALETTE } from './game/palettes';
import { GamePalette, GameMap, Direction4, Direction8 } from './game/types';
import { soundEngine } from './game/audio';
import { GameCanvas } from './components/GameCanvas';
import { GameBoyShell } from './components/GameBoyShell';
import { TacticalHud } from './components/TacticalHud';
import { MissionsModal } from './components/MissionsModal';
import { GodotViewerModal } from './components/GodotViewerModal';
import { ManualModal } from './components/ManualModal';
import confetti from 'canvas-confetti';
import {
  Volume2,
  VolumeX,
  Music,
  RefreshCw,
  BookOpen,
  Code,
  Map as MapIcon,
  Palette,
  Monitor,
  Maximize2,
  Minimize2,
  Swords,
} from 'lucide-react';

export default function App() {
  // Current active map & engine instance
  const [currentMap, setCurrentMap] = useState<GameMap>(getSpaceHulkMission());
  const engine = useMemo(() => new TacticalEngine(currentMap), [currentMap]);

  // UI state reactive triggers
  const [, setTickState] = useState<number>(0);
  const [palette, setPalette] = useState<GamePalette>(DEFAULT_PALETTE);
  const [lcdGridEnabled, setLcdGridEnabled] = useState<boolean>(true);
  const [scale, setScale] = useState<number>(3.5); // Fits nicely in viewport
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isMusicOn, setIsMusicOn] = useState<boolean>(false);

  // Modals
  const [isMissionsOpen, setIsMissionsOpen] = useState<boolean>(false);
  const [isGodotOpen, setIsGodotOpen] = useState<boolean>(false);
  const [isManualOpen, setIsManualOpen] = useState<boolean>(false);

  // Force re-render when engine state changes
  useEffect(() => {
    const unsubscribe = engine.subscribe(() => {
      setTickState((prev) => prev + 1);
    });
    return unsubscribe;
  }, [engine]);

  // Victory Confetti Trigger
  useEffect(() => {
    if (engine.status === 'victory') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8bac0f', '#306230', '#0f380f', '#9bbc0f'],
        });
      } catch {
        // Safe fallback
      }
    }
  }, [engine.status]);

  // Global Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input or modal is open
      if (isMissionsOpen || isGodotOpen || isManualOpen) return;

      const key = e.key.toLowerCase();

      // 4-Directional Movement (WASD / Arrows)
      if (key === 'w' || key === 'arrowup') {
        engine.moveSelectedUnit('up');
        engine.aimSelectedUnit('up');
      } else if (key === 's' || key === 'arrowdown') {
        engine.moveSelectedUnit('down');
        engine.aimSelectedUnit('down');
      } else if (key === 'a' || key === 'arrowleft') {
        engine.moveSelectedUnit('left');
        engine.aimSelectedUnit('left');
      } else if (key === 'd' || key === 'arrowright') {
        engine.moveSelectedUnit('right');
        engine.aimSelectedUnit('right');
      }

      // Action A: Shoot Bolter (Space / Z)
      else if (key === ' ' || key === 'z') {
        e.preventDefault();
        engine.performPlayerAttack();
      }

      // Action B: Frag Grenade (X / G)
      else if (key === 'x' || key === 'g') {
        e.preventDefault();
        const selected = engine.getSelectedUnit();
        if (selected && selected.currentCooldown <= 0) {
          if (engine.targetingMode === 'grenade') {
            engine.targetingMode = 'none';
          } else {
            engine.targetingMode = 'grenade';
          }
          setTickState((p) => p + 1);
        }
      }

      // SELECT: Cycle Squad Marine (Tab / 1, 2, 3)
      else if (key === 'tab') {
        e.preventDefault();
        engine.selectNextMarine();
      } else if (key === '1' || key === '2' || key === '3') {
        const index = parseInt(key, 10) - 1;
        const marines = engine.units.filter((u) => u.team === 'player' && !u.isDead);
        if (marines[index]) {
          engine.selectUnit(marines[index].id);
        }
      }

      // START / Restart (R / Enter)
      else if (key === 'r') {
        engine.initFromMap(engine.map);
      }

      // Audio Toggle (M)
      else if (key === 'm') {
        const nextMute = !isMuted;
        setIsMuted(nextMute);
        soundEngine.setMuted(nextMute);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [engine, isMuted, isMissionsOpen, isGodotOpen, isManualOpen]);

  // Audio Handlers
  const handleToggleMute = useCallback(() => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    soundEngine.setMuted(nextMute);
  }, [isMuted]);

  const handleToggleMusic = useCallback(() => {
    const nextMusic = !isMusicOn;
    setIsMusicOn(nextMusic);
    soundEngine.setMusicEnabled(nextMusic);
  }, [isMusicOn]);

  // Mission Selection
  const handleSelectMission = (map: GameMap) => {
    setCurrentMap(map);
    engine.initFromMap(map);
  };

  // Controller Handlers for GameBoy Shell
  const handleMove = (dir: Direction4) => {
    engine.moveSelectedUnit(dir);
  };

  const handleAim = (dir: Direction8) => {
    engine.aimSelectedUnit(dir);
  };

  const handleActionA = () => {
    engine.performPlayerAttack();
  };

  const handleActionB = () => {
    const selected = engine.getSelectedUnit();
    if (selected && selected.currentCooldown <= 0) {
      engine.targetingMode = engine.targetingMode === 'grenade' ? 'none' : 'grenade';
      setTickState((p) => p + 1);
    }
  };

  const handleSelect = () => {
    engine.selectNextMarine();
  };

  const handleStart = () => {
    engine.initFromMap(engine.map);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-mono selection:bg-amber-600 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="border-b border-neutral-800 bg-neutral-900/90 backdrop-blur px-4 py-2.5 flex flex-wrap justify-between items-center gap-3 sticky top-0 z-40">
        {/* Brand & Mission title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center font-black text-xs shadow">
            40K
          </div>
          <div>
            <h1 className="font-bold text-sm text-neutral-100 flex items-center gap-2">
              <span>WARHAMMER 40K: 8-BIT TACTICS</span>
              <span className="text-[10px] bg-neutral-800 text-neutral-400 font-semibold px-2 py-0.5 rounded border border-neutral-700">
                DMG ENGINE
              </span>
            </h1>
            <span className="text-xs text-amber-400 font-medium">
              {currentMap.name} • {currentMap.subtitle}
            </span>
          </div>
        </div>

        {/* Global Toolbar Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mission Briefing Button */}
          <button
            id="btn-nav-missions"
            onClick={() => setIsMissionsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 text-neutral-200 rounded text-xs font-bold border border-neutral-700 transition-colors"
          >
            <MapIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>MISSIONS</span>
          </button>

          {/* Field Manual Button */}
          <button
            id="btn-nav-manual"
            onClick={() => setIsManualOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 text-neutral-200 rounded text-xs font-bold border border-neutral-700 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span>MANUAL</span>
          </button>

          {/* Godot 4 GDScript Code Viewer Button */}
          <button
            id="btn-nav-godot"
            onClick={() => setIsGodotOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 text-cyan-300 rounded text-xs font-bold border border-neutral-700 transition-colors"
          >
            <Code className="w-3.5 h-3.5 text-cyan-400" />
            <span>GODOT 4 CODE</span>
          </button>

          {/* Palette Switcher */}
          <div className="flex items-center gap-1 bg-neutral-800 border border-neutral-700 rounded p-0.5">
            <Palette className="w-3.5 h-3.5 text-neutral-400 ml-1.5" />
            <select
              id="select-palette"
              value={palette.id}
              onChange={(e) => {
                const found = GAME_PALETTES.find((p) => p.id === e.target.value);
                if (found) setPalette(found);
              }}
              className="bg-transparent text-neutral-200 text-xs font-mono py-1 px-1.5 focus:outline-none cursor-pointer"
            >
              {GAME_PALETTES.map((p) => (
                <option key={p.id} value={p.id} className="bg-neutral-900 text-neutral-200">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* LCD Grid Toggle */}
          <button
            id="btn-toggle-lcd"
            onClick={() => setLcdGridEnabled(!lcdGridEnabled)}
            title="Toggle LCD Dot-Matrix Filter"
            className={`p-1.5 rounded border text-xs font-bold transition-colors ${
              lcdGridEnabled
                ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>

          {/* 8-Bit Music Toggle */}
          <button
            id="btn-toggle-bgm"
            onClick={handleToggleMusic}
            title="Toggle 8-Bit Chiptune Battle Music"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded border text-xs font-bold transition-colors ${
              isMusicOn && !isMuted
                ? 'bg-amber-950 border-amber-600 text-amber-300'
                : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>BGM</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            id="btn-nav-mute"
            onClick={handleToggleMute}
            className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          {/* Restart Mission */}
          <button
            id="btn-restart-mission"
            onClick={() => engine.initFromMap(engine.map)}
            title="Restart Current Mission"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded text-xs font-bold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>RETRY</span>
          </button>
        </div>
      </header>

      {/* Main Game Stage Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center Column: Authentic GameBoy Console with 160x144 Game Viewport */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <GameBoyShell
            onMove={handleMove}
            onAim={handleAim}
            onActionA={handleActionA}
            onActionB={handleActionB}
            onSelect={handleSelect}
            onStart={handleStart}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            targetingMode={engine.targetingMode}
          >
            <GameCanvas
              engine={engine}
              palette={palette}
              lcdGridEnabled={lcdGridEnabled}
              scale={scale}
            />
          </GameBoyShell>

          {/* Scale Control & Quick Hint */}
          <div className="flex items-center justify-between w-full max-w-md mt-3 px-2 text-[11px] text-neutral-400">
            <span className="text-neutral-500 font-mono">
              Viewport: 160×144px (Integer Scaled)
            </span>
            <div className="flex items-center gap-2">
              <span>SCALE:</span>
              {[3, 3.5, 4].map((s) => (
                <button
                  key={s}
                  onClick={() => setScale(s)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    scale === s
                      ? 'bg-amber-600 text-white'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Tactical HUD, Squad Roster, 8-Way Aim, Combat Log */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <TacticalHud
            engine={engine}
            onSelectMarine={(id) => engine.selectUnit(id)}
            onAimDirection={(dir) => engine.aimSelectedUnit(dir)}
            onShoot={handleActionA}
            onGrenade={handleActionB}
            targetingMode={engine.targetingMode}
          />
        </div>
      </main>

      {/* Modals */}
      <MissionsModal
        isOpen={isMissionsOpen}
        onClose={() => setIsMissionsOpen(false)}
        onSelectMission={handleSelectMission}
        currentMissionId={currentMap.id}
      />

      <GodotViewerModal
        isOpen={isGodotOpen}
        onClose={() => setIsGodotOpen(false)}
      />

      <ManualModal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
      />
    </div>
  );
}
