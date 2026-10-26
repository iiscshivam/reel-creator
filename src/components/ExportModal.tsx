import React, { useState } from 'react';
import { ExportProgress, downloadBlob } from '../utils/exporter';
import { ExportResolution, AspectRatio } from '../types';
import { Download, CheckCircle, AlertCircle, X, Sparkles, Loader2, Video, Sliders } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartExport: (resolution: ExportResolution) => void;
  progress: ExportProgress | null;
  exportedBlob: Blob | null;
  aspectRatio?: AspectRatio;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onStartExport,
  progress,
  exportedBlob,
  aspectRatio = '9:16',
}) => {
  const [selectedResolution, setSelectedResolution] = useState<ExportResolution>('720p');

  if (!isOpen) return null;

  const isConfiguring = progress === null;
  const isRendering =
    progress?.status === 'rendering' ||
    progress?.status === 'preparing' ||
    progress?.status === 'encoding';
  const isDone = progress?.status === 'done' && exportedBlob;
  const isError = progress?.status === 'error';

  const RESOLUTIONS: { id: ExportResolution; title: string; desc: string; resText: string }[] = [
    {
      id: '480p',
      title: '480p SD',
      desc: 'Fast rendering, small file size',
      resText: aspectRatio === '9:16' ? '480 × 854' : aspectRatio === '1:1' ? '480 × 480' : '854 × 480',
    },
    {
      id: '720p',
      title: '720p HD',
      desc: 'Standard quality for Reels & TikTok',
      resText: aspectRatio === '9:16' ? '720 × 1280' : aspectRatio === '1:1' ? '720 × 720' : '1280 × 720',
    },
    {
      id: '1080p',
      title: '1080p Full HD',
      desc: 'Maximum sharpness & pro clarity',
      resText: aspectRatio === '9:16' ? '1080 × 1920' : aspectRatio === '1:1' ? '1080 × 1080' : '1920 × 1080',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-[#0F141F] border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        {!isRendering && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Status: Configure Resolution Options */}
        {isConfiguring && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-amber-500 flex items-center justify-center shadow-lg shadow-pink-500/25 shrink-0">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">Export Resolution</h3>
                <p className="text-xs text-slate-400">Choose output fidelity for your video</p>
              </div>
            </div>

            {/* Resolution Cards */}
            <div className="space-y-2 pt-1">
              {RESOLUTIONS.map((res) => {
                const isSelected = selectedResolution === res.id;
                return (
                  <div
                    key={res.id}
                    onClick={() => setSelectedResolution(res.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-pink-500/15 border-pink-500/80 shadow-md shadow-pink-500/10'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition ${
                          isSelected ? 'border-pink-500 bg-pink-500' : 'border-slate-600'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{res.title}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                            {res.resText}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{res.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => onStartExport(selectedResolution)}
              className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:opacity-95 shadow-xl shadow-pink-500/30 flex items-center justify-center gap-2 transition active:scale-98"
            >
              <Download className="w-4 h-4" />
              Render & Export ({selectedResolution})
            </button>
          </div>
        )}

        {/* Status: Rendering / Encoding */}
        {isRendering && (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-pink-500 to-amber-500 flex items-center justify-center shadow-lg shadow-pink-500/25">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-white">Exporting Your Reel...</h3>
              <p className="text-xs text-slate-400 mt-1">
                Compositing frames, stickers, filters, and audio tracks in {selectedResolution}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">
                  {progress?.status === 'encoding'
                    ? 'Finalizing container...'
                    : `${progress?.currentSecond}s / ${progress?.totalSeconds}s`}
                </span>
                <span className="text-pink-400 font-bold">{progress?.percentage}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
                <div
                  style={{ width: `${progress?.percentage || 0}%` }}
                  className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 rounded-full transition-all duration-150"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Please keep this tab open while rendering.
            </p>
          </div>
        )}

        {/* Status: Completed */}
        {isDone && (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-lg">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                Render Complete ({selectedResolution})
              </div>
              <h3 className="text-xl font-extrabold text-white">Your Reel is Ready!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Ready for Instagram Reels, TikTok, YouTube Shorts, and WhatsApp Status.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => downloadBlob(exportedBlob, `reel-${selectedResolution}-${Date.now()}.webm`)}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:opacity-95 shadow-xl shadow-pink-500/30 flex items-center justify-center gap-2 transition active:scale-98"
              >
                <Download className="w-4 h-4" />
                Download Reel Video
              </button>

              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
              >
                Back to Reel Creator
              </button>
            </div>
          </div>
        )}

        {/* Status: Error */}
        {isError && (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Export Failed</h3>
              <p className="text-xs text-slate-400 mt-1">
                {progress?.errorMessage || 'An error occurred while compiling your video.'}
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 transition"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default ExportModal;
