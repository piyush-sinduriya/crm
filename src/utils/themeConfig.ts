import { AccentColor, AccentColorOption, ThemeMode } from '../types/crm';

export const ACCENT_COLORS: AccentColorOption[] = [
  {
    id: 'indigo',
    name: 'Indigo Modern',
    primaryHex: '#6366f1',
    secondaryHex: '#4f46e5',
    description: 'Classic high-productivity CRM look with refined indigo accents',
  },
  {
    id: 'emerald',
    name: 'Emerald Green',
    primaryHex: '#10b981',
    secondaryHex: '#059669',
    description: 'Vibrant green symbolizing pipeline growth, revenue, and deal conversions',
  },
  {
    id: 'blue',
    name: 'Royal Blue',
    primaryHex: '#2563eb',
    secondaryHex: '#1d4ed8',
    description: 'Corporate enterprise reliability with high-contrast executive blue',
  },
  {
    id: 'purple',
    name: 'Purple Violet',
    primaryHex: '#8b5cf6',
    secondaryHex: '#7c3aed',
    description: 'Modern AI copilot styling with deep violet flourishes',
  },
  {
    id: 'amber',
    name: 'Amber Gold',
    primaryHex: '#d97706',
    secondaryHex: '#b45309',
    description: 'Prestige warm golden styling with outstanding badge visibility',
  },
];

export const getStoredTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'dark';
  try {
    const saved = localStorage.getItem('omnisync_theme');
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  } catch (e) {
    return 'dark';
  }
};

export const getStoredAccent = (): AccentColor => {
  if (typeof window === 'undefined') return 'indigo';
  try {
    const saved = localStorage.getItem('omnisync_accent') as AccentColor;
    const valid = ACCENT_COLORS.some((c) => c.id === saved);
    return valid ? saved : 'indigo';
  } catch (e) {
    return 'indigo';
  }
};

export const applyThemeToDocument = (theme: ThemeMode, accent: AccentColor) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // Set data attributes
  root.setAttribute('data-theme', theme);
  root.setAttribute('data-accent', accent);

  // Sync classes
  if (theme === 'light') {
    root.classList.add('light');
    root.classList.remove('dark');
  } else {
    root.classList.add('dark');
    root.classList.remove('light');
  }

  // Store in localStorage
  try {
    localStorage.setItem('omnisync_theme', theme);
    localStorage.setItem('omnisync_accent', accent);
  } catch (e) {
    // ignore storage quota issues
  }
};
