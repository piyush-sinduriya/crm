import React from 'react';
import { ShieldAlert, Lock, ArrowRight, CheckCircle2, X, AlertTriangle, Crown, UserCheck } from 'lucide-react';
import { UserRole } from '../types/crm';

interface PermissionRestrictedModalProps {
  isOpen: boolean;
  onClose: () => void;
  restrictedFeature?: string;
  onSwitchToAdmin?: () => void;
  currentRole: UserRole;
}

export const PermissionRestrictedModal: React.FC<PermissionRestrictedModalProps> = ({
  isOpen,
  onClose,
  restrictedFeature = 'Settings & Team Management',
  onSwitchToAdmin,
  currentRole,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl shadow-amber-950/40 overflow-hidden">
        {/* Amber glowing header strip */}
        <div className="h-2 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600" />

        <div className="p-6">
          {/* Top Status & Close button */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  <Lock className="w-3 h-3" />
                  Role-Based Access Control (RBAC)
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  Access Restricted: Contact your Admin to make changes.
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Restriction Reason */}
          <div className="mt-4 p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Attempted Action:</span>
              <span className="text-amber-300 font-semibold px-2 py-0.5 bg-amber-950/50 border border-amber-800/60 rounded">
                {restrictedFeature}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Your Active View:</span>
              <span className="inline-flex items-center gap-1 text-sky-300 font-medium px-2 py-0.5 bg-sky-950/50 border border-sky-800/60 rounded">
                <UserCheck className="w-3 h-3" />
                Sales Representative (Standard User)
              </span>
            </div>
            <p className="text-xs text-slate-300 pt-1 leading-relaxed border-t border-slate-800/80">
              Your account has permission to view inquiries, update lead pipeline stages, send messages and auto-replies, and reassign leads. However, administrative controls (Settings, Team role editing, Branding, Data Exports, and Lead deletion) require Administrator approval.
            </p>
          </div>

          {/* Permissions Matrix Comparison */}
          <div className="mt-4 grid grid-cols-2 gap-3 text-[11px]">
            <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl space-y-1.5">
              <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Allowed for Sales Reps:
              </div>
              <ul className="text-slate-300 space-y-1 pl-1">
                <li>• View Inbound Leads & Inbox</li>
                <li>• Update Lead Status (Pipeline)</li>
                <li>• Send Instant Replies & WhatsApp</li>
                <li>• Add Internal Follow-up Notes</li>
                <li>• Reassign Leads to Teammates</li>
              </ul>
            </div>

            <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-xl space-y-1.5">
              <div className="font-semibold text-rose-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Admin Privileges Required:
              </div>
              <ul className="text-slate-300 space-y-1 pl-1">
                <li>• Modify App & SLA Settings</li>
                <li>• Edit Team Member Roles</li>
                <li>• Brand & Logo Customization</li>
                <li>• Bulk CSV Data Export</li>
                <li>• Delete / Archive Inquiries</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-xl transition-all"
            >
              Dismiss
            </button>
            {onSwitchToAdmin && (
              <button
                onClick={() => {
                  onSwitchToAdmin();
                  onClose();
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-amber-600 via-indigo-600 to-indigo-700 hover:from-amber-500 hover:to-indigo-600 rounded-xl shadow-lg shadow-indigo-900/30 transition-all active:scale-95"
              >
                <Crown className="w-3.5 h-3.5 text-amber-300" />
                <span>Switch to Admin Role for Demo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
