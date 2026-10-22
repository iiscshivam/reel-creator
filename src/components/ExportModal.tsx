import React from 'react';
import { ExportProgress, downloadBlob } from '../utils/exporter';
import { Download, CheckCircle, AlertCircle, X, Sparkles, Loader2 } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: ExportProgress | null;
  exportedBlob: Blob | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  progress,
  exportedBlob,
}) => {
  if (!isOpen) return null;

  const isRendering = progress?.status === 'rendering' || progress?.status === 'preparing' || progress?.status === 'encoding';
  const isDone = progress?.status === 'done' && exportedBlob;
  const isError = progress?.status === 'error';

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

        {/* Status: Rendering / Encoding */}
        {isRendering && (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-pink-500 to-amber-500 flex items-center justify-center shadow-lg shadow-pink-500/25">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-white">
                Exporting Your Reel...
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Compositing frames, filters, and audio tracks in high definition
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
                Render Complete
              </div>
              <h3 className="text-xl font-extrabold text-white">
                Your Reel is Ready!
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Ready for Instagram Reels, TikTok, YouTube Shorts, and WhatsApp Status.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => downloadBlob(exportedBlob, `reel-${Date.now()}.webm`)}
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
