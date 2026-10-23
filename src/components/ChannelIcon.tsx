import React from 'react';
import { ChannelType } from '../types/crm';
import { Mail, MessageSquare, Phone, Youtube, Globe, Facebook, Instagram } from 'lucide-react';

interface ChannelIconProps {
  channel: ChannelType;
  className?: string;
}

export const ChannelIcon: React.FC<ChannelIconProps> = ({ channel, className = 'w-4 h-4' }) => {
  switch (channel) {
    case 'whatsapp':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
          <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
        </svg>
      );
    case 'email':
      return <Mail className={className} />;
    case 'facebook':
      return <Facebook className={className} />;
    case 'instagram':
      return <Instagram className={className} />;
    case 'indiamart':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      );
    case 'youtube':
      return <Youtube className={className} />;
    case 'manual':
      return <Phone className={className} />;
    default:
      return <MessageSquare className={className} />;
  }
};

export const getChannelConfig = (channel: ChannelType) => {
  switch (channel) {
    case 'whatsapp':
      return {
        label: 'WhatsApp Business',
        shortLabel: 'WhatsApp',
        colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        badgeColor: 'text-emerald-400',
        accentBg: 'bg-emerald-500',
      };
    case 'email':
      return {
        label: 'Email (Gmail)',
        shortLabel: 'Gmail',
        colorClass: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
        badgeColor: 'text-rose-400',
        accentBg: 'bg-rose-500',
      };
    case 'facebook':
      return {
        label: 'Meta Facebook',
        shortLabel: 'Facebook',
        colorClass: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
        badgeColor: 'text-blue-400',
        accentBg: 'bg-blue-500',
      };
    case 'instagram':
      return {
        label: 'Meta Instagram',
        shortLabel: 'Instagram',
        colorClass: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
        badgeColor: 'text-pink-400',
        accentBg: 'bg-gradient-to-r from-pink-500 to-purple-500',
      };
    case 'indiamart':
      return {
        label: 'IndiaMART B2B',
        shortLabel: 'IndiaMART',
        colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        badgeColor: 'text-amber-400',
        accentBg: 'bg-amber-500',
      };
    case 'youtube':
      return {
        label: 'YouTube Comments',
        shortLabel: 'YouTube',
        colorClass: 'text-red-400 bg-red-500/10 border-red-500/30',
        badgeColor: 'text-red-400',
        accentBg: 'bg-red-500',
      };
    case 'manual':
      return {
        label: 'Manual Phone / Walk-in',
        shortLabel: 'Manual',
        colorClass: 'text-slate-300 bg-slate-500/10 border-slate-700',
        badgeColor: 'text-slate-300',
        accentBg: 'bg-slate-500',
      };
    default:
      return {
        label: 'Direct Channel',
        shortLabel: 'Direct',
        colorClass: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
        badgeColor: 'text-indigo-400',
        accentBg: 'bg-indigo-500',
      };
  }
};
