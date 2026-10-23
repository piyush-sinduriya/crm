import React, { useState, useRef } from 'react';
import { BrandConfig } from '../types/crm';
import {
  X,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Check,
  Building,
  Sparkles,
  Zap,
  Shield,
  GraduationCap,
  Layers,
  Palette,
} from 'lucide-react';

interface BrandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  branding: BrandConfig;
  onSaveBranding: (newBranding: BrandConfig) => void;
}

export const BrandingModal: React.FC<BrandingModalProps> = ({
  isOpen,
  onClose,
  branding,
  onSaveBranding,
}) => {
  const [name, setName] = useState(branding.name);
  const [tag, setTag] = useState(branding.tag);
  const [subtitle, setSubtitle] = useState(branding.subtitle);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(branding.logoUrl);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFileError('Please select a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFileError('Image size exceeds 2MB limit. Please upload a smaller logo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setLogoUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoUrl(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePresetSelect = (presetName: string, presetTag: string, presetSubtitle: string) => {
    setName(presetName);
    setTag(presetTag);
    setSubtitle(presetSubtitle);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveBranding({
      name: name.trim(),
      tag: tag.trim() || 'CRM',
      subtitle: subtitle.trim() || 'Omnichannel Intelligence',
      logoUrl,
      currency: branding.currency || 'INR',
      currencySymbol: branding.currencySymbol || '₹',
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 600);
  };

  const handleResetDefault = () => {
    setName('OmniSync');
    setTag('CRM');
    setSubtitle('Omnichannel Intelligence');
    setLogoUrl(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onSaveBranding({
      name: 'OmniSync',
      tag: 'CRM',
      subtitle: 'Omnichannel Intelligence',
      logoUrl: undefined,
      currency: 'INR',
      currencySymbol: '₹',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Customize Logo & Branding
              </h3>
              <p className="text-[11px] text-slate-400">
                Update business identity, application title, and header logo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[80vh]">
          {/* Live Preview Card */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Live Header Preview
            </label>
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Custom Logo"
                    className="w-9 h-9 rounded-lg object-contain bg-slate-900 p-1 border border-slate-700"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
                    <Zap className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <div className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                    <span>{name || 'OmniSync'}</span>
                    <span className="text-[10px] font-semibold text-indigo-400 tracking-wider">
                      {tag || 'CRM'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-normal">
                    {subtitle || 'Omnichannel Intelligence'}
                  </div>
                </div>
              </div>

              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                Active Header
              </span>
            </div>
          </div>

          {/* Logo Upload Section */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Upload Business Logo
            </label>

            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="branding-logo-file"
              />

              <label
                htmlFor="branding-logo-file"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/50 hover:bg-slate-950 text-xs text-slate-300 hover:text-white cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>{logoUrl ? 'Replace Logo File' : 'Choose Logo Image (PNG, JPG, SVG)'}</span>
              </label>

              {logoUrl && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="px-3 py-2.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/50 rounded-xl transition-colors"
                >
                  Remove
                </button>
              )}
            </div>

            {fileError && <div className="text-xs text-rose-400 mt-1">{fileError}</div>}
            <div className="text-[11px] text-slate-500">
              Recommended: Square transparent PNG or SVG image (under 2MB).
            </div>
          </div>

          {/* App Name & Tag */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                App / Business Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. SchoolDecor, OmniSync, Apex CRM"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Badge Tag</label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="CRM, PRO"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Subtitle / Description</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Omnichannel Lead Intelligence"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Quick Preset Ideas */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Quick Branding Ideas
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() =>
                  handlePresetSelect('SchoolDecor', 'CRM', 'Educational & Furniture Leads')
                }
                className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-indigo-500/60 text-left text-xs transition-colors"
              >
                <div className="font-bold text-white flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                  <span>SchoolDecor</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">Educational & Furniture</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handlePresetSelect('OmniSync', 'CRM', 'Omnichannel Intelligence')
                }
                className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-indigo-500/60 text-left text-xs transition-colors"
              >
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-indigo-400" />
                  <span>OmniSync</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">Omnichannel CRM</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handlePresetSelect('ApexIndustrial', 'HQ', 'B2B Wholesale & RFQ Portal')
                }
                className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-indigo-500/60 text-left text-xs transition-colors"
              >
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Apex Industrial</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">B2B Wholesale Portal</div>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 flex items-center justify-between border-t border-slate-800">
            <button
              type="button"
              onClick={handleResetDefault}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to Default</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-600/30 transition-all active:scale-95"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isSuccess ? 'Saved!' : 'Save Branding'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
