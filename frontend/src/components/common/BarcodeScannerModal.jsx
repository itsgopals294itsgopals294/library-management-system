import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Camera, Keyboard, CheckCircle } from 'lucide-react';

export const BarcodeScannerModal = ({ isOpen, onClose, onScan, title = 'Scan Barcode or QR Code' }) => {
  const [activeTab, setActiveTab] = useState('input'); // 'camera' or 'input'
  const [manualInput, setManualInput] = useState('');
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    if (activeTab === 'camera') {
      const scanner = new Html5QrcodeScanner(
        'barcode-reader-element',
        {
          fps: 10,
          qrbox: { width: 250, height: 180 },
          rememberLastUsedCamera: true,
        },
        false
      );

      scanner.render(
        (decodedText) => {
          onScan(decodedText);
          scanner.clear();
          onClose();
        },
        (error) => {
          // ignore scan frame errors
        }
      );

      scannerRef.current = scanner;

      return () => {
        if (scannerRef.current) {
          scannerRef.current.clear().catch(console.error);
        }
      };
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-600" />
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-100 bg-slate-50">
          <button
            onClick={() => setActiveTab('input')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === 'input'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            Manual / USB Scanner
          </button>
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === 'camera'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Camera className="w-4 h-4" />
            Camera Scanner
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {activeTab === 'input' ? (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <p className="text-sm text-slate-500">
                Type or scan using any USB hardware barcode reader. Input will automatically be captured.
              </p>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Barcode / Identifier
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. BC-3320-1-1001 or MEM-2026-3003"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
                />
              </div>
              <button
                type="submit"
                disabled={!manualInput.trim()}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
              >
                <CheckCircle className="w-4 h-4" />
                Confirm Barcode
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 text-center">
                Point your camera at the book copy barcode or patron membership card.
              </p>
              <div id="barcode-reader-element" className="w-full rounded-xl overflow-hidden border border-slate-200" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarcodeScannerModal;
