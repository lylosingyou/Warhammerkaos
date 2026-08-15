import React from 'react';
import { Direction4, Direction8 } from '../game/types';
import { soundEngine } from '../game/audio';

interface GameBoyShellProps {
  children: React.ReactNode;
  onMove: (dir: Direction4) => void;
  onAim: (dir: Direction8) => void;
  onActionA: () => void; // Shoot Bolter
  onActionB: () => void; // Frag Grenade
  onSelect: () => void;  // Cycle Marine
  onStart: () => void;   // Pause / Next / Restart
  isMuted: boolean;
  onToggleMute: () => void;
  targetingMode: 'none' | 'shoot' | 'grenade';
}

export const GameBoyShell: React.FC<GameBoyShellProps> = ({
  children,
  onMove,
  onAim,
  onActionA,
  onActionB,
  onSelect,
  onStart,
  isMuted,
  onToggleMute,
  targetingMode,
}) => {
  return (
    <div
      id="gameboy-shell-container"
      className="relative flex flex-col items-center bg-[#c8c5ba] border-4 border-[#9c9789] rounded-b-[40px] rounded-t-2xl shadow-2xl p-4 sm:p-6 max-w-full"
      style={{
        boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.6), inset 0 -4px 8px rgba(0,0,0,0.3)',
      }}
    >
      {/* Top Grooves */}
      <div className="w-full flex justify-between items-center px-4 mb-2">
        <div className="flex gap-1">
          <div className="w-8 h-1 bg-[#9c9789] rounded-full" />
          <div className="w-8 h-1 bg-[#9c9789] rounded-full" />
        </div>
        <div className="text-[10px] font-bold tracking-widest text-[#716e64] uppercase font-mono">
          ◄ OFF • ON ►
        </div>
      </div>

      {/* Screen Frame (Dark Grey Bezel with Blue/Magenta Striping) */}
      <div
        id="gameboy-screen-bezel"
        className="w-full bg-[#7a787b] border-2 border-[#545255] rounded-t-xl rounded-b-[28px] p-3 sm:p-5 flex flex-col items-center relative shadow-inner"
        style={{
          boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.6)',
        }}
      >
        {/* Bezel Header Text with Double Lines */}
        <div className="w-full flex items-center justify-between px-2 mb-2">
          <div className="flex-1 h-[2px] bg-[#8d1d4d] opacity-90" />
          <span className="px-2 text-[8px] sm:text-[9px] font-bold text-[#b5b3b7] tracking-wider uppercase font-mono text-center">
            DOT MATRIX WITH STEREO SOUND
          </span>
          <div className="flex-1 h-[2px] bg-[#1d358d] opacity-90" />
        </div>

        {/* Battery LED + Screen Area */}
        <div className="flex items-center gap-2 sm:gap-3 w-full justify-center">
          {/* Battery Indicator */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.9)] animate-pulse" />
            <span className="text-[7px] font-mono text-[#403f42] uppercase font-bold">BATTERY</span>
          </div>

          {/* Screen Content Injection */}
          <div className="border-4 border-[#1e1e1e] rounded shadow-inner overflow-hidden">
            {children}
          </div>
        </div>

        {/* Brand Label */}
        <div className="w-full flex justify-between items-center px-4 mt-2">
          <span className="text-xs sm:text-sm font-black italic tracking-tighter text-[#1d358d] font-sans drop-shadow-sm">
            Warhammer <span className="text-[#8d1d4d]">40,000</span>
          </span>
          <span className="text-[9px] font-mono font-bold text-[#303030] tracking-widest">
            DMG-8BIT-TACTICS
          </span>
        </div>
      </div>

      {/* Controller Controls Area */}
      <div id="gameboy-controls-panel" className="w-full mt-5 px-2 flex flex-col gap-4">
        <div className="flex justify-between items-center w-full">
          {/* Authentic Directional D-PAD */}
          <div className="flex flex-col items-center">
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* D-Pad Base Cross */}
              <div className="absolute w-24 h-8 bg-[#1f1e20] rounded-sm shadow-md" />
              <div className="absolute w-8 h-24 bg-[#1f1e20] rounded-sm shadow-md" />
              <div className="absolute w-7 h-7 bg-[#171618] rounded-full shadow-inner z-10" />

              {/* Up Button */}
              <button
                id="btn-dpad-up"
                onClick={() => { onMove('up'); onAim('up'); }}
                title="Move Up (W / Up Arrow)"
                className="absolute top-0 w-8 h-8 flex items-center justify-center text-[#404044] hover:text-white active:bg-neutral-900 transition-colors z-20"
              >
                <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-[#545255]" />
              </button>

              {/* Down Button */}
              <button
                id="btn-dpad-down"
                onClick={() => { onMove('down'); onAim('down'); }}
                title="Move Down (S / Down Arrow)"
                className="absolute bottom-0 w-8 h-8 flex items-center justify-center text-[#404044] hover:text-white active:bg-neutral-900 transition-colors z-20"
              >
                <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-[#545255]" />
              </button>

              {/* Left Button */}
              <button
                id="btn-dpad-left"
                onClick={() => { onMove('left'); onAim('left'); }}
                title="Move Left (A / Left Arrow)"
                className="absolute left-0 w-8 h-8 flex items-center justify-center text-[#404044] hover:text-white active:bg-neutral-900 transition-colors z-20"
              >
                <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[6px] border-r-[#545255]" />
              </button>

              {/* Right Button */}
              <button
                id="btn-dpad-right"
                onClick={() => { onMove('right'); onAim('right'); }}
                title="Move Right (D / Right Arrow)"
                className="absolute right-0 w-8 h-8 flex items-center justify-center text-[#404044] hover:text-white active:bg-neutral-900 transition-colors z-20"
              >
                <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[6px] border-l-[#545255]" />
              </button>
            </div>
            <span className="text-[8px] font-mono font-bold text-[#716e64] mt-1 tracking-wider uppercase">
              D-PAD (MOVE/AIM)
            </span>
          </div>

          {/* Action A & B Buttons (Diagonal Magenta/Burgundy Pills) */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-3 transform -rotate-[25deg] mb-2">
              {/* B BUTTON: Frag Grenade */}
              <div className="flex flex-col items-center gap-1">
                <button
                  id="btn-action-b"
                  onClick={onActionB}
                  title="Frag Grenade 3x3 (Key X / G)"
                  className={`w-11 h-11 rounded-full shadow-lg border-b-4 border-[#5a0c2e] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center text-white font-bold text-sm ${
                    targetingMode === 'grenade'
                      ? 'bg-amber-600 ring-2 ring-amber-300 animate-pulse'
                      : 'bg-[#8d1d4d] hover:bg-[#a3225a]'
                  }`}
                  style={{
                    boxShadow: '0 4px 6px rgba(0,0,0,0.4), inset 0 2px 2px rgba(255,255,255,0.4)',
                  }}
                >
                  B
                </button>
                <span className="text-[9px] font-mono font-black text-[#716e64] tracking-wider">
                  GRENADE
                </span>
              </div>

              {/* A BUTTON: Bolter Shoot */}
              <div className="flex flex-col items-center gap-1">
                <button
                  id="btn-action-a"
                  onClick={onActionA}
                  title="Shoot Bolter (Space / Key Z)"
                  className="w-11 h-11 rounded-full bg-[#8d1d4d] hover:bg-[#a3225a] shadow-lg border-b-4 border-[#5a0c2e] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center text-white font-bold text-sm"
                  style={{
                    boxShadow: '0 4px 6px rgba(0,0,0,0.4), inset 0 2px 2px rgba(255,255,255,0.4)',
                  }}
                >
                  A
                </button>
                <span className="text-[9px] font-mono font-black text-[#716e64] tracking-wider">
                  SHOOT
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SELECT, START, and MUTE Buttons */}
        <div className="flex justify-center items-center gap-6 mt-2 pt-2 border-t border-[#b2af9f]">
          {/* SELECT Button (Cycle Marine) */}
          <div className="flex flex-col items-center gap-1 transform -rotate-[25deg]">
            <button
              id="btn-select"
              onClick={onSelect}
              title="Cycle Marine (Tab / Key 1-2)"
              className="w-12 h-3.5 bg-[#646268] hover:bg-[#7b7880] rounded-full shadow-inner active:translate-y-0.5 transition-transform"
            />
            <span className="text-[8px] font-mono font-black text-[#716e64] tracking-wider">
              SELECT
            </span>
          </div>

          {/* START Button (Restart / Next) */}
          <div className="flex flex-col items-center gap-1 transform -rotate-[25deg]">
            <button
              id="btn-start"
              onClick={onStart}
              title="Start / Restart / Pause (Enter / Key R)"
              className="w-12 h-3.5 bg-[#646268] hover:bg-[#7b7880] rounded-full shadow-inner active:translate-y-0.5 transition-transform"
            />
            <span className="text-[8px] font-mono font-black text-[#716e64] tracking-wider">
              START
            </span>
          </div>

          {/* Sound Mute Toggle */}
          <button
            id="btn-toggle-sound"
            onClick={onToggleMute}
            className="ml-4 px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-[#b2af9f] text-[#303030] hover:bg-[#a19e8f] transition-colors flex items-center gap-1"
          >
            <span>{isMuted ? '🔇 MUTED' : '🔊 8-BIT AUDIO'}</span>
          </button>
        </div>

        {/* Bottom Speaker Grille Slots */}
        <div className="w-full flex justify-end gap-1.5 px-6 mt-1 opacity-70">
          <div className="w-1 h-6 bg-[#9c9789] rounded-full transform -rotate-[30deg]" />
          <div className="w-1 h-6 bg-[#9c9789] rounded-full transform -rotate-[30deg]" />
          <div className="w-1 h-6 bg-[#9c9789] rounded-full transform -rotate-[30deg]" />
          <div className="w-1 h-6 bg-[#9c9789] rounded-full transform -rotate-[30deg]" />
          <div className="w-1 h-6 bg-[#9c9789] rounded-full transform -rotate-[30deg]" />
          <div className="w-1 h-6 bg-[#9c9789] rounded-full transform -rotate-[30deg]" />
        </div>
      </div>
    </div>
  );
};
