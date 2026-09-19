import React, { useState } from 'react';
import { X, Tablet, Download, CheckCircle2, FileCode, ExternalLink, ShieldCheck } from 'lucide-react';
import { downloadAndroidProjectZip } from '../utils/androidProjectZip';

interface AndroidInstallModalProps {
  isPWAInstallable: boolean;
  onInstallPWA: () => void;
  onClose: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  isPWAInstallable,
  onInstallPWA,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'instant' | 'apk' | 'source'>('instant');
  const [isZipping, setIsZipping] = useState(false);

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      await downloadAndroidProjectZip();
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-750 w-full max-w-2xl max-h-[90vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Tablet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Install on Android Tablet
              </h2>
              <p className="text-xs text-slate-400">
                Complete guide to run without Android Studio
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-2 gap-2">
          <button
            onClick={() => setActiveTab('instant')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'instant'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>1-Tap Install (Easiest)</span>
          </button>

          <button
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'apk'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tablet className="w-4 h-4" />
            <span>APK Without Android Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('source')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'source'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Download Source ZIP</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 text-sm text-slate-200 leading-relaxed">
          {activeTab === 'instant' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-base mb-1">
                  <ShieldCheck className="w-5 h-5" />
                  Recommended: Instant Tablet Home Screen Install (PWA)
                </div>
                <p className="text-xs text-emerald-200/90 leading-normal">
                  No technical steps, no APK file warnings, and 100% offline capable. It runs directly as a standalone Android app on your tablet with an icon on your home screen and zero browser bars!
                </p>
              </div>

              <div className="flex flex-col gap-3 mt-1">
                <div className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-sm">Open on your Android Tablet</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Open this app link in <strong>Google Chrome</strong> on your tablet.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-sm">Tap "Install App" or Menu</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Tap the 3 dots menu <span className="font-mono bg-slate-800 px-1 py-0.5 rounded text-white">⋮</span> in the top-right corner of Chrome, then tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-sm">Launch from Home Screen</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      The "MCQ Answer Pad" icon is added to your tablet. Tap it anytime to enter answers while lying down — even with airplane mode or no Wi-Fi!
                    </p>
                  </div>
                </div>
              </div>

              {isPWAInstallable && (
                <button
                  onClick={() => {
                    onInstallPWA();
                    onClose();
                  }}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 shadow-md transition"
                >
                  <Download className="w-5 h-5" />
                  <span>Click to Install on this Device Now</span>
                </button>
              )}
            </div>
          )}

          {activeTab === 'apk' && (
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-white text-base">
                How to Get & Install the APK without Android Studio:
              </h3>
              <p className="text-xs text-slate-400">
                You don't need Android Studio or any coding setup on your computer. We've included a pre-configured automated cloud build system (GitHub Actions).
              </p>

              <div className="flex flex-col gap-3">
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-1">
                    Step 1: Export to GitHub (1 Click)
                  </span>
                  <p className="text-xs text-slate-300">
                    In AI Studio's top settings menu, click <strong>"Export to GitHub"</strong>. This saves the complete project to your free GitHub account.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-1">
                    Step 2: Cloud APK Build
                  </span>
                  <p className="text-xs text-slate-300">
                    Go to your repository on GitHub and click the <strong>"Actions"</strong> tab. The included build script (<code className="text-amber-300">.github/workflows/build-apk.yml</code>) automatically compiles the APK in ~2 minutes for free.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-1">
                    Step 3: Download APK on your Tablet
                  </span>
                  <p className="text-xs text-slate-300">
                    Click the completed run, download <strong className="text-white">MCQ-Answer-Pad-debug.apk</strong> onto your tablet (or download to computer and send via Google Drive/Email).
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                    Step 4: Tap to Install on Android Tablet
                  </span>
                  <p className="text-xs text-slate-300">
                    Open the downloaded <strong className="text-white">.apk</strong> on your tablet. When Android prompts <em>"Install unknown apps"</em>, toggle it ON for Files/Chrome, then tap <strong>Install</strong>. Done!
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'source' && (
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-white text-base">
                Native Jetpack Compose Source Code
              </h3>
              <p className="text-xs text-slate-400">
                The native Android Kotlin code is already created in the repository under <code className="text-blue-300 bg-slate-950 px-1 py-0.5 rounded">/android/</code>.
              </p>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-semibold">Language:</span>
                  <span className="text-white font-mono">Kotlin 2.0 + Jetpack Compose</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-semibold">Target SDK:</span>
                  <span className="text-white font-mono">Android 15 (API 35), Min SDK 24</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-semibold">Local Storage:</span>
                  <span className="text-white font-mono">Android SharedPreferences</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-semibold">Permissions:</span>
                  <span className="text-emerald-400 font-semibold">Zero special permissions required</span>
                </div>
              </div>

              <button
                onClick={handleDownloadZip}
                disabled={isZipping}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
                <span>{isZipping ? 'Creating ZIP...' : 'Download Android Studio Project (.zip)'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
