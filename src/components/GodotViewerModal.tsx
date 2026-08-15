import React, { useState } from 'react';
import { GODOT4_PROJECT_FILES, GodotFile } from '../game/godotCode';
import { Code, Copy, Check, X, Download, FileCode } from 'lucide-react';

interface GodotViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GodotViewerModal: React.FC<GodotViewerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedFile, setSelectedFile] = useState<GodotFile>(GODOT4_PROJECT_FILES[1]); // GameManager.gd
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAll = () => {
    // Generate a single text payload containing all Godot scripts formatted
    const fullBundle = GODOT4_PROJECT_FILES.map(
      (f) => `### FILE: ${f.filename} (${f.description})\n\n${f.code}\n\n${'='.repeat(60)}\n\n`
    ).join('');

    const blob = new Blob([fullBundle], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Warhammer40k_GameBoy_Godot4_Scripts.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="godot-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-mono"
    >
      <div
        id="godot-modal-content"
        className="bg-neutral-900 border-2 border-neutral-700 rounded-xl max-w-4xl w-full p-5 shadow-2xl flex flex-col gap-4 text-neutral-200 h-[85vh]"
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-base">
            <Code className="w-5 h-5" />
            <span>GODOT 4 GDSCRIPT CODE EXPORT</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadAll}
              className="flex items-center gap-1.5 px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold transition-colors shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>EXPORT SCRIPTS BUNDLE</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Layout: Sidebar Tabs + Code Viewer */}
        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* File selector sidebar */}
          <div className="w-56 flex flex-col gap-1.5 overflow-y-auto pr-1">
            <div className="text-[10px] uppercase text-neutral-500 font-bold px-2 py-1">
              Godot 4 Project Files
            </div>
            {GODOT4_PROJECT_FILES.map((file) => {
              const isSelected = file.filename === selectedFile.filename;
              return (
                <button
                  key={file.filename}
                  onClick={() => setSelectedFile(file)}
                  className={`flex items-center gap-2 text-left px-3 py-2 rounded text-xs transition-all ${
                    isSelected
                      ? 'bg-cyan-950/80 border border-cyan-500/80 text-cyan-300 font-bold'
                      : 'bg-neutral-800/60 border border-transparent text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                  }`}
                >
                  <FileCode className="w-4 h-4 shrink-0" />
                  <span className="truncate">{file.filename}</span>
                </button>
              );
            })}
          </div>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden">
            <div className="flex justify-between items-center px-4 py-2 bg-neutral-900 border-b border-neutral-800">
              <div>
                <span className="font-bold text-xs text-neutral-200">{selectedFile.filename}</span>
                <span className="text-[11px] text-neutral-400 block">{selectedFile.description}</span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs font-bold border border-neutral-700 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">COPIED!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>COPY CODE</span>
                  </>
                )}
              </button>
            </div>

            <pre className="flex-1 overflow-auto p-4 text-xs text-emerald-400 font-mono leading-relaxed selection:bg-cyan-800 selection:text-white">
              <code>{selectedFile.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
