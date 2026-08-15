import React from 'react';
import { CAMPAIGN_MISSIONS, generateSkirmishMap } from '../game/maps';
import { GameMap } from '../game/types';
import { Shield, Sparkles, MapPin, X, Swords } from 'lucide-react';

interface MissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMission: (map: GameMap) => void;
  currentMissionId: string;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  isOpen,
  onClose,
  onSelectMission,
  currentMissionId,
}) => {
  if (!isOpen) return null;

  const handleProcedural = () => {
    const skirmish = generateSkirmishMap(Date.now(), 3, 2);
    onSelectMission(skirmish);
    onClose();
  };

  return (
    <div
      id="missions-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono"
    >
      <div
        id="missions-modal-content"
        className="bg-neutral-900 border-2 border-neutral-700 rounded-xl max-w-2xl w-full p-5 shadow-2xl flex flex-col gap-4 text-neutral-200 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
            <Swords className="w-5 h-5" />
            <span>WARHAMMER 40K TACTICAL DEPLOYMENTS</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Campaign Missions List */}
        <div className="space-y-3">
          <div className="text-xs uppercase text-neutral-400 tracking-wider font-semibold">
            Standard Campaign Operations
          </div>
          {CAMPAIGN_MISSIONS.map((mission, index) => {
            const isCurrent = mission.id === currentMissionId;
            return (
              <div
                key={mission.id}
                id={`mission-card-${mission.id}`}
                className={`p-3 rounded-lg border transition-all flex flex-col gap-2 ${
                  isCurrent
                    ? 'bg-neutral-800/90 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                    : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="bg-neutral-800 text-neutral-400 text-xs px-2 py-0.5 rounded font-bold">
                      OP {index + 1}
                    </span>
                    <h3 className="font-bold text-sm text-neutral-100">{mission.name}</h3>
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] bg-amber-500 text-neutral-950 font-black px-2 py-0.5 rounded">
                      ACTIVE SECTOR
                    </span>
                  )}
                </div>

                <p className="text-xs text-neutral-400 italic">{mission.briefing}</p>

                <div className="flex justify-between items-center pt-2 border-t border-neutral-800/60 text-xs">
                  <span className="text-neutral-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    Grid: 20x15 Tiles • 4-Tone DMG
                  </span>
                  <button
                    onClick={() => {
                      onSelectMission(mission);
                      onClose();
                    }}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-bold rounded text-xs transition-colors"
                  >
                    DEPLOY SQUAD
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Procedural Skirmish */}
        <div className="p-3 bg-emerald-950/30 border border-emerald-800/60 rounded-lg flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>PROCEDURAL RANDOM SKIRMISH</span>
            </div>
            <button
              onClick={handleProcedural}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded text-xs transition-colors shadow"
            >
              GENERATE RANDOM BATTLEFIELD
            </button>
          </div>
          <p className="text-xs text-neutral-400">
            Generates a unique randomized layout with dynamic obstacle distributions, patrol paths, Ork boyz, and incubating Tyranid nests.
          </p>
        </div>
      </div>
    </div>
  );
};
