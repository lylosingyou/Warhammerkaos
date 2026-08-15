import React from 'react';
import { TacticalEngine, TURN_TICK_INTERVAL } from '../game/engine';
import { Direction8, Faction } from '../game/types';
import { Shield, Crosshair, Bomb, Users, Clock, Skull, Zap } from 'lucide-react';

interface TacticalHudProps {
  engine: TacticalEngine;
  onSelectMarine: (id: string) => void;
  onAimDirection: (dir: Direction8) => void;
  onShoot: () => void;
  onGrenade: () => void;
  targetingMode: 'none' | 'shoot' | 'grenade';
}

export const TacticalHud: React.FC<TacticalHudProps> = ({
  engine,
  onSelectMarine,
  onAimDirection,
  onShoot,
  onGrenade,
  targetingMode,
}) => {
  const selectedMarine = engine.getSelectedUnit();
  const playerMarines = engine.units.filter((u) => u.team === 'player');
  const enemyUnits = engine.units.filter((u) => u.team === 'enemy' && !u.isDead);

  const orkCount = enemyUnits.filter((u) => u.faction === 'ork').length;
  const tyranidCount = enemyUnits.filter((u) => u.faction === 'tyranid').length;
  const eggCount = enemyUnits.filter((u) => u.faction === 'egg').length;

  const tickProgress = Math.max(0, Math.min(1, 1 - engine.turnTickTimer / TURN_TICK_INTERVAL));

  const directions: { dir: Direction8; label: string; arrow: string }[] = [
    { dir: 'up-left', label: 'NW', arrow: '↖' },
    { dir: 'up', label: 'N', arrow: '↑' },
    { dir: 'up-right', label: 'NE', arrow: '↗' },
    { dir: 'left', label: 'W', arrow: '←' },
    { dir: 'right', label: 'E', arrow: '→' },
    { dir: 'down-left', label: 'SW', arrow: '↙' },
    { dir: 'down', label: 'S', arrow: '↓' },
    { dir: 'down-right', label: 'SE', arrow: '↘' },
  ];

  return (
    <div id="tactical-hud-panel" className="flex flex-col gap-3 w-full font-mono text-xs">
      {/* 1. Global Turn Tick Bar & Objective Header */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 shadow-md">
        <div className="flex justify-between items-center mb-1.5">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
            <Clock className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
            <span>GLOBAL TURN TICK: {(engine.turnTickTimer).toFixed(1)}s</span>
          </div>
          <span className="text-[11px] text-neutral-400 font-semibold">
            TURN #{engine.stats.turnTickCount}
          </span>
        </div>

        {/* Real-time 3s progress meter */}
        <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden mb-2">
          <div
            className="bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-300 h-full transition-all duration-75"
            style={{ width: `${tickProgress * 100}%` }}
          />
        </div>

        {/* Objective Counts Strip */}
        <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-neutral-800">
          <div className="bg-neutral-800/80 rounded py-1 px-2">
            <span className="text-neutral-400 text-[10px] block">ORKS</span>
            <span className="text-amber-400 font-bold text-sm">{orkCount} ACTIVE</span>
          </div>
          <div className="bg-neutral-800/80 rounded py-1 px-2">
            <span className="text-neutral-400 text-[10px] block">TYRANIDS</span>
            <span className="text-purple-400 font-bold text-sm">{tyranidCount} ACTIVE</span>
          </div>
          <div className="bg-neutral-800/80 rounded py-1 px-2">
            <span className="text-neutral-400 text-[10px] block">BIO-EGGS</span>
            <span className="text-rose-400 font-bold text-sm">{eggCount} NESTS</span>
          </div>
        </div>
      </div>

      {/* 2. Space Marine Squad Roster */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 shadow-md">
        <div className="flex items-center gap-1.5 text-sky-400 font-bold mb-2">
          <Shield className="w-4 h-4" />
          <span>TACTICAL SQUAD ROSTER</span>
        </div>

        <div className="space-y-2">
          {playerMarines.map((marine) => {
            const isSelected = marine.id === engine.selectedUnitId;
            const cooldownRatio = marine.abilityCooldown > 0 ? (marine.currentCooldown / marine.abilityCooldown) : 0;

            return (
              <button
                key={marine.id}
                id={`marine-card-${marine.id}`}
                onClick={() => onSelectMarine(marine.id)}
                disabled={marine.isDead}
                className={`w-full text-left p-2 rounded border transition-all ${
                  marine.isDead
                    ? 'bg-neutral-950/60 border-neutral-900 opacity-50 cursor-not-allowed'
                    : isSelected
                    ? 'bg-sky-950/40 border-sky-500 ring-1 ring-sky-400 shadow-sm'
                    : 'bg-neutral-800/60 border-neutral-700 hover:bg-neutral-800'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-neutral-200">
                      {marine.name}
                    </span>
                    {isSelected && (
                      <span className="bg-sky-500 text-neutral-950 font-black px-1 text-[9px] rounded">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <span className="text-neutral-400 text-[11px]">
                    {marine.isDead ? '💀 KIA' : `HP: ${marine.hp}/${marine.maxHp}`}
                  </span>
                </div>

                {/* HP Pips Bar */}
                <div className="flex gap-1 mb-1.5">
                  {Array.from({ length: marine.maxHp }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded-xs ${
                        i < marine.hp ? 'bg-sky-400' : 'bg-neutral-700'
                      }`}
                    />
                  ))}
                </div>

                {/* Abilities status */}
                <div className="flex justify-between items-center text-[10px] text-neutral-400">
                  <span>ATK: {marine.atk} (Bolter)</span>
                  <div className="flex items-center gap-1">
                    <Bomb className="w-3 h-3 text-amber-400" />
                    <span>
                      {marine.currentCooldown > 0
                        ? `CD: ${marine.currentCooldown.toFixed(1)}s`
                        : 'GRENADE READY'}
                    </span>
                  </div>
                </div>

                {/* Cooldown bar */}
                {marine.currentCooldown > 0 && (
                  <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-amber-500 h-full transition-all"
                      style={{ width: `${(1 - cooldownRatio) * 100}%` }}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Tactical Aim & Combat Actions */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <Crosshair className="w-4 h-4" />
            <span>8-DIRECTION AIM & FIRE</span>
          </div>
          {selectedMarine && (
            <span className="text-[10px] text-neutral-400 uppercase font-semibold">
              AIM: {selectedMarine.aimDirection}
            </span>
          )}
        </div>

        {/* 8-Direction Aim Wheel */}
        <div className="grid grid-cols-3 gap-1.5 max-w-[200px] mx-auto mb-3">
          {directions.map((d, index) => {
            const isAiming = selectedMarine?.aimDirection === d.dir;
            // Center is Shoot Action Button
            if (index === 4) {
              return (
                <React.Fragment key="center-wrap">
                  <button
                    id="btn-hud-aim-center"
                    onClick={onShoot}
                    title="Fire Bolter"
                    className="bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-black rounded flex flex-col items-center justify-center p-1 text-[10px] shadow"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>FIRE</span>
                  </button>
                  <button
                    id={`btn-hud-aim-${d.dir}`}
                    onClick={() => onAimDirection(d.dir)}
                    className={`rounded p-1.5 flex flex-col items-center justify-center transition-colors ${
                      isAiming
                        ? 'bg-amber-500 text-neutral-950 font-bold'
                        : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                    }`}
                  >
                    <span className="text-xs">{d.arrow}</span>
                    <span className="text-[8px]">{d.label}</span>
                  </button>
                </React.Fragment>
              );
            }

            return (
              <button
                key={d.dir}
                id={`btn-hud-aim-${d.dir}`}
                onClick={() => onAimDirection(d.dir)}
                className={`rounded p-1.5 flex flex-col items-center justify-center transition-colors ${
                  isAiming
                    ? 'bg-amber-500 text-neutral-950 font-bold'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                }`}
              >
                <span className="text-xs">{d.arrow}</span>
                <span className="text-[8px]">{d.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Action Bar */}
        <div className="grid grid-cols-2 gap-2">
          <button
            id="btn-hud-bolter-shoot"
            onClick={onShoot}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 text-neutral-200 font-bold rounded border border-neutral-700 transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span>BOLTER (2 DMG)</span>
          </button>

          <button
            id="btn-hud-frag-grenade"
            onClick={onGrenade}
            disabled={!selectedMarine || selectedMarine.currentCooldown > 0}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 font-bold rounded border transition-all ${
              targetingMode === 'grenade'
                ? 'bg-amber-600 border-amber-400 text-white animate-pulse'
                : selectedMarine && selectedMarine.currentCooldown <= 0
                ? 'bg-amber-950/60 hover:bg-amber-900 border-amber-600/80 text-amber-300'
                : 'bg-neutral-900 border-neutral-800 text-neutral-600 cursor-not-allowed'
            }`}
          >
            <Bomb className="w-3.5 h-3.5" />
            <span>{targetingMode === 'grenade' ? 'CANCEL 3x3' : 'FRAG GRENADE (3 DMG)'}</span>
          </button>
        </div>
      </div>

      {/* 4. Live Tactical Combat Log */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 shadow-md flex-1 flex flex-col">
        <div className="flex items-center justify-between text-neutral-400 font-bold mb-1.5 pb-1 border-b border-neutral-800">
          <span className="text-[11px] flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            BATTLEFIELD EVENT LOG
          </span>
          <span className="text-[10px] text-neutral-500">REAL-TIME</span>
        </div>

        <div
          id="tactical-combat-log"
          className="flex-1 overflow-y-auto max-h-36 space-y-1 pr-1 font-mono text-[10.5px]"
        >
          {engine.combatLog.map((log) => {
            let color = 'text-neutral-300';
            if (log.type === 'kill') color = 'text-rose-400 font-bold';
            else if (log.type === 'ability') color = 'text-amber-400 font-semibold';
            else if (log.type === 'attack') color = 'text-sky-300';
            else if (log.type === 'egg') color = 'text-purple-400';
            else if (log.type === 'turn') color = 'text-emerald-400';

            return (
              <div key={log.id} className="leading-tight flex gap-1.5">
                <span className="text-neutral-500 select-none">[{log.timestamp}]</span>
                <span className={color}>{log.message}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
