import { Plus, Search, Radio, Bell, Sparkles, FileSpreadsheet, Crown, UserCheck, Shield, RefreshCw, Sun, Moon, User, Upload, QrCode } from 'lucide-react';
import { NavigationTab, UserRole, ThemeMode, UserProfile } from '../types/crm';

interface TopNavProps {
  currentTab: NavigationTab;
  onOpenManualModal: () => void;
  onOpenExportModal: () => void;
  onOpenImportModal?: () => void;
  onOpenIndiaMartModal?: () => void;
  onOpenWhatsAppQrModal?: () => void;
  onSimulateInbound: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilterCount: number;
  currentRole: UserRole;
  onToggleRole: () => void;
  onRestrictedAction?: (feature: string) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  currentUserProfile?: UserProfile;
  onOpenUserProfile?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  onOpenManualModal,
  onOpenExportModal,
  onOpenImportModal,
  onOpenIndiaMartModal,
  onOpenWhatsAppQrModal,
  onSimulateInbound,
  searchQuery,
  onSearchChange,
  activeFilterCount,
  currentRole,
  onToggleRole,
  onRestrictedAction,
  theme,
  onToggleTheme,
  currentUserProfile,
  onOpenUserProfile,
}) => {
  const getBreadcrumbTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Omnichannel CRM Workspace';
      case 'inbox':
        return 'Unified Inbound Inbox';
      case 'leads':
        return 'Lead Pipeline & Stages';
      case 'analytics':
        return 'Performance & Attribution Analytics';
      case 'team':
        return 'Sales Team & Representative Management';
      case 'activity':
        return 'Audit & Activity Log';
      case 'settings':
        return 'Integrations & Webhook Settings';
      default:
        return 'CRM Dashboard';
    }
  };

  const handleExportClick = () => {
    if (currentRole !== 'admin') {
      if (onRestrictedAction) {
        onRestrictedAction('Bulk CSV Data Export');
      }
      return;
    }
    onOpenExportModal();
  };

  return (
    <header className="h-16 px-6 bg-slate-900/80 border-b border-slate-800/80 flex items-center justify-between gap-4 shrink-0 backdrop-blur-md z-10">
      {/* Zone 1: Contextual Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-400 font-medium">CRM</span>
        <span className="text-slate-600">/</span>
        <h1 className="text-sm font-semibold text-white tracking-tight">{getBreadcrumbTitle()}</h1>
      </div>

      {/* Zone 2: Quick Search */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search inquiries, contacts, company, or message..."
            className="w-full bg-slate-950/70 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Zone 3: Role Switcher & Action Buttons */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Quick Role Switcher for Demo / Testing */}
        <button
          type="button"
          onClick={onToggleRole}
          title={`Click to switch to ${currentRole === 'admin' ? 'Sales Rep' : 'Admin'} role (Testing Mode)`}
          className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all shadow-sm active:scale-95 cursor-pointer ${
            currentRole === 'admin'
              ? 'bg-gradient-to-r from-amber-500/15 to-indigo-500/15 border-amber-500/40 hover:border-amber-400/70 text-amber-200'
              : 'bg-gradient-to-r from-sky-500/15 to-emerald-500/15 border-sky-500/40 hover:border-sky-400/70 text-sky-200'
          }`}
        >
          <div className="flex items-center gap-1.5">
            {currentRole === 'admin' ? (
              <Crown className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <UserCheck className="w-3.5 h-3.5 text-sky-400" />
            )}
            <span className="font-semibold">
              Current View:{' '}
              <span className={currentRole === 'admin' ? 'text-amber-300 font-bold' : 'text-sky-300 font-bold'}>
                {currentRole === 'admin' ? 'Admin' : 'Sales Rep'}
              </span>
            </span>
          </div>

          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/60 group-hover:text-white group-hover:border-slate-500 transition-colors">
            Switch ⇄
          </span>
        </button>

        <button
          onClick={handleExportClick}
          title={
            currentRole === 'admin'
              ? 'Export leads to Excel / CSV spreadsheet'
              : 'Export CSV (Admin Restricted)'
          }
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/90 border border-slate-700/80 rounded-lg hover:bg-slate-700 hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>

        {onOpenImportModal && (
          <button
            onClick={onOpenImportModal}
            title="Import leads from CSV, Excel, or IndiaMART"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/90 border border-slate-700/80 rounded-lg hover:bg-slate-700 hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Import CSV</span>
          </button>
        )}

        {onOpenWhatsAppQrModal && (
          <button
            onClick={onOpenWhatsAppQrModal}
            title="Scan QR Code to link your WhatsApp easily (WhatsApp Web mode)"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-[#25D366] hover:bg-emerald-400 rounded-lg shadow-md shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scan WhatsApp QR</span>
          </button>
        )}

        {onOpenIndiaMartModal && (
          <button
            onClick={onOpenIndiaMartModal}
            title="Connect Real IndiaMART MAPI and Webhook Gateway"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="hidden md:inline">⚡ Channels API</span>
          </button>
        )}

        <button
          onClick={onOpenManualModal}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">+ Add Customer Lead</span>
        </button>

        {/* Divider */}
        <div className="h-5 w-px bg-slate-800 hidden sm:block mx-0.5" />

        {/* Theme Switcher Toggle (Sun / Moon) right next to User Profile */}
        <button
          type="button"
          onClick={onToggleTheme}
          title={
            theme === 'dark'
              ? 'Switch to Light Mode (Clean Slate & White Palette)'
              : 'Switch to Dark Mode (Deep Slate & Indigo Palette)'
          }
          aria-label="Toggle Theme (Dark / Light Mode)"
          className="p-2 rounded-lg border border-slate-700/80 bg-slate-800/90 hover:bg-slate-700 hover:text-white text-slate-300 transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center group"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500 group-hover:-rotate-12 transition-transform duration-300" />
          )}
        </button>

        {/* User Profile in Header right next to Theme Switcher */}
        {currentUserProfile && (
          <button
            type="button"
            onClick={onOpenUserProfile}
            title={`Logged in as ${currentUserProfile.name} (${currentUserProfile.role}) - Click for Account Settings`}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-lg border border-slate-700/80 bg-slate-800/80 hover:bg-slate-750 transition-all cursor-pointer active:scale-95 group"
          >
            <div className="relative shrink-0">
              <img
                src={currentUserProfile.avatar}
                alt={currentUserProfile.name}
                referrerPolicy="no-referrer"
                className="w-6 h-6 rounded-md object-cover ring-1 ring-slate-600 group-hover:ring-indigo-400 transition-all"
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-slate-900 ${
                  currentUserProfile.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </div>
            <span className="text-xs font-semibold text-slate-200 group-hover:text-white hidden xl:inline truncate max-w-[90px]">
              {currentUserProfile.name.split(' ')[0]}
            </span>
          </button>
        )}
      </div>
    </header>
  );
};
