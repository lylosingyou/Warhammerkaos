import React from 'react';
import { BookOpen, X, Shield, Skull, Bug, Crosshair, Keyboard } from 'lucide-react';

interface ManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManualModal: React.FC<ManualModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="manual-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono"
    >
      <div
        id="manual-modal-content"
        className="bg-neutral-900 border-2 border-neutral-700 rounded-xl max-w-3xl w-full p-5 shadow-2xl flex flex-col gap-4 text-neutral-200 max-h-[88vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
            <BookOpen className="w-5 h-5" />
            <span>CODEX ASTARTES: 8-BIT TACTICAL FIELD MANUAL</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Factions & Abilities Table */}
        <div className="space-y-3">
          <div className="text-xs uppercase text-neutral-400 font-bold tracking-wider">
            Faction Statistics & Combat Abilities
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-neutral-800">
              <thead>
                <tr className="bg-neutral-950 text-neutral-400 border-b border-neutral-800">
                  <th className="p-2 border-r border-neutral-800">FACTION</th>
                  <th className="p-2 border-r border-neutral-800">TEAM</th>
                  <th className="p-2 border-r border-neutral-800">HP</th>
                  <th className="p-2 border-r border-neutral-800">ATK</th>
                  <th className="p-2">SPECIAL ABILITY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 font-mono">
                <tr className="bg-neutral-900/60 hover:bg-neutral-800/40">
                  <td className="p-2 font-bold text-sky-400 flex items-center gap-1.5 border-r border-neutral-800">
                    <Shield className="w-3.5 h-3.5" />
                    Space Marine
                  </td>
                  <td className="p-2 text-neutral-300 border-r border-neutral-800">Player</td>
                  <td className="p-2 font-bold text-sky-300 border-r border-neutral-800">5</td>
                  <td className="p-2 font-bold text-neutral-200 border-r border-neutral-800">2</td>
                  <td className="p-2 text-amber-300">
                    <strong>Frag Grenade</strong> (3x3 AoE, 3 DMG, 5-tile throw range)
                  </td>
                </tr>

                <tr className="bg-neutral-900/60 hover:bg-neutral-800/40">
                  <td className="p-2 font-bold text-amber-400 flex items-center gap-1.5 border-r border-neutral-800">
                    <Skull className="w-3.5 h-3.5" />
                    Ork Boy
                  </td>
                  <td className="p-2 text-neutral-300 border-r border-neutral-800">Enemy</td>
                  <td className="p-2 font-bold text-amber-300 border-r border-neutral-800">4</td>
                  <td className="p-2 font-bold text-neutral-200 border-r border-neutral-800">2</td>
                  <td className="p-2 text-neutral-300">
                    <strong>WAAAGH Rush</strong> (Charges 3 tiles in straight line, damages in path)
                  </td>
                </tr>

                <tr className="bg-neutral-900/60 hover:bg-neutral-800/40">
                  <td className="p-2 font-bold text-purple-400 flex items-center gap-1.5 border-r border-neutral-800">
                    <Bug className="w-3.5 h-3.5" />
                    Tyranid Gaunt
                  </td>
                  <td className="p-2 text-neutral-300 border-r border-neutral-800">Enemy</td>
                  <td className="p-2 font-bold text-purple-300 border-r border-neutral-800">3</td>
                  <td className="p-2 font-bold text-neutral-200 border-r border-neutral-800">1</td>
                  <td className="p-2 text-purple-300">
                    <strong>Lay Egg</strong> every 5 turns (3s tick). Egg incubates and hatches fresh Tyranid!
                  </td>
                </tr>

                <tr className="bg-neutral-900/60 hover:bg-neutral-800/40">
                  <td className="p-2 font-bold text-rose-400 flex items-center gap-1.5 border-r border-neutral-800">
                    <span className="text-xs">🥚</span>
                    Tyranid Bio-Egg
                  </td>
                  <td className="p-2 text-neutral-300 border-r border-neutral-800">Enemy</td>
                  <td className="p-2 font-bold text-rose-300 border-r border-neutral-800">2</td>
                  <td className="p-2 font-bold text-neutral-200 border-r border-neutral-800">0</td>
                  <td className="p-2 text-rose-300">
                    <strong>Incubation</strong>: 3 turns countdown before spawning a new enemy.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Tactical Rules & Technical Architecture */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800">
            <h4 className="font-bold text-xs text-neutral-200 mb-1.5 flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-sky-400" />
              Movement & Combat Rules
            </h4>
            <ul className="text-[11px] text-neutral-400 space-y-1 list-disc list-inside">
              <li><strong>4-Way Movement</strong>: Move cardinal Up, Down, Left, Right across the 20x15 grid.</li>
              <li><strong>8-Way Aiming</strong>: Aim bolter rifle in all 8 directions (N, NE, E, SE, S, SW, W, NW).</li>
              <li><strong>3-Second Global Tick</strong>: Real-time turn timer advances Tyranid egg incubation and cooldowns.</li>
              <li><strong>Win Condition</strong>: Eliminate all hostile Orks, Tyranids, and Bio-Eggs.</li>
              <li><strong>Lose Condition</strong>: All Space Marines in squad perish.</li>
            </ul>
          </div>

          <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800">
            <h4 className="font-bold text-xs text-neutral-200 mb-1.5 flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5 text-amber-400" />
              Keyboard & Mouse Controls
            </h4>
            <div className="text-[11px] text-neutral-400 space-y-1">
              <div className="flex justify-between">
                <span>Move Squad:</span>
                <span className="text-neutral-200 font-bold">WASD / Arrow Keys</span>
              </div>
              <div className="flex justify-between">
                <span>Shoot Bolter (A):</span>
                <span className="text-neutral-200 font-bold">Space / Key Z</span>
              </div>
              <div className="flex justify-between">
                <span>Frag Grenade 3x3 (B):</span>
                <span className="text-neutral-200 font-bold">Key X / Key G</span>
              </div>
              <div className="flex justify-between">
                <span>Cycle Active Marine:</span>
                <span className="text-neutral-200 font-bold">Tab / Keys 1-3</span>
              </div>
              <div className="flex justify-between">
                <span>Direct Mouse Click:</span>
                <span className="text-neutral-200 font-bold">Click Tile / Enemy / Zone</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
