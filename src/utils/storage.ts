import { Lead, ActivityItem, TeamMember, BrandConfig, MessageTemplate, AutomationSettings } from '../types/crm';
import { INITIAL_LEADS, INITIAL_ACTIVITIES, INITIAL_TEAM } from '../data/mockInquiries';
import { DEFAULT_TEMPLATES, DEFAULT_AUTOMATION_SETTINGS } from './automationEngine';

const KEYS = {
  LEADS: 'omnisync_leads_v1',
  ACTIVITIES: 'omnisync_activities_v1',
  TEAM: 'omnisync_team_v1',
  BRANDING: 'omnisync_branding_v1',
  TEMPLATES: 'omnisync_templates_v1',
  AUTOMATION: 'omnisync_automation_v1',
  GEMINI_API_KEY: 'omnisync_gemini_api_key',
};

// Safe JSON parser
function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error('Failed to parse storage item:', err);
    return fallback;
  }
}

export function loadStoredLeads(): Lead[] {
  if (typeof window === 'undefined') return INITIAL_LEADS;
  try {
    const raw = localStorage.getItem(KEYS.LEADS);
    const parsed = safeParse<Lead[]>(raw, INITIAL_LEADS);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_LEADS;
  } catch (e) {
    console.warn('localStorage read failed for leads:', e);
    return INITIAL_LEADS;
  }
}

export function saveStoredLeads(leads: Lead[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEYS.LEADS, JSON.stringify(leads));
  } catch (err) {
    console.error('Failed to save leads to storage:', err);
  }
}

export function loadStoredActivities(): ActivityItem[] {
  if (typeof window === 'undefined') return INITIAL_ACTIVITIES;
  try {
    const raw = localStorage.getItem(KEYS.ACTIVITIES);
    const parsed = safeParse<ActivityItem[]>(raw, INITIAL_ACTIVITIES);
    return Array.isArray(parsed) ? parsed : INITIAL_ACTIVITIES;
  } catch (e) {
    console.warn('localStorage read failed for activities:', e);
    return INITIAL_ACTIVITIES;
  }
}

export function saveStoredActivities(activities: ActivityItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify(activities));
  } catch (err) {
    console.error('Failed to save activities to storage:', err);
  }
}

export function loadStoredTeam(): TeamMember[] {
  if (typeof window === 'undefined') return INITIAL_TEAM;
  try {
    const raw = localStorage.getItem(KEYS.TEAM);
    const parsed = safeParse<TeamMember[]>(raw, INITIAL_TEAM);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_TEAM;
  } catch (e) {
    console.warn('localStorage read failed for team:', e);
    return INITIAL_TEAM;
  }
}

export function saveStoredTeam(team: TeamMember[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEYS.TEAM, JSON.stringify(team));
  } catch (err) {
    console.error('Failed to save team to storage:', err);
  }
}

export function loadStoredBranding(fallback: BrandConfig): BrandConfig {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(KEYS.BRANDING);
    const parsed = safeParse<BrandConfig>(raw, fallback);
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch (e) {
    return fallback;
  }
}

export function saveStoredBranding(brand: BrandConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEYS.BRANDING, JSON.stringify(brand));
  } catch (err) {
    console.error('Failed to save branding to storage:', err);
  }
}

export function loadStoredTemplates(): MessageTemplate[] {
  if (typeof window === 'undefined') return DEFAULT_TEMPLATES;
  try {
    const raw = localStorage.getItem(KEYS.TEMPLATES);
    const parsed = safeParse<MessageTemplate[]>(raw, DEFAULT_TEMPLATES);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_TEMPLATES;
  } catch (e) {
    return DEFAULT_TEMPLATES;
  }
}

export function saveStoredTemplates(templates: MessageTemplate[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEYS.TEMPLATES, JSON.stringify(templates));
  } catch (err) {
    console.error('Failed to save templates to storage:', err);
  }
}

export function loadStoredAutomation(): AutomationSettings {
  if (typeof window === 'undefined') return DEFAULT_AUTOMATION_SETTINGS;
  try {
    const raw = localStorage.getItem(KEYS.AUTOMATION);
    const parsed = safeParse<AutomationSettings>(raw, DEFAULT_AUTOMATION_SETTINGS);
    return parsed && typeof parsed === 'object' ? parsed : DEFAULT_AUTOMATION_SETTINGS;
  } catch (e) {
    return DEFAULT_AUTOMATION_SETTINGS;
  }
}

export function saveStoredAutomation(settings: AutomationSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEYS.AUTOMATION, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save automation settings to storage:', err);
  }
}

export function getStoredGeminiApiKey(): string {
  if (typeof window === 'undefined') return '';
  try {
    const stored = localStorage.getItem(KEYS.GEMINI_API_KEY);
    if (stored) return stored;
    return (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY || '';
  } catch (e) {
    return '';
  }
}

export function setStoredGeminiApiKey(apiKey: string): void {
  if (typeof window === 'undefined') return;
  try {
    if (!apiKey) {
      localStorage.removeItem(KEYS.GEMINI_API_KEY);
    } else {
      localStorage.setItem(KEYS.GEMINI_API_KEY, apiKey.trim());
    }
  } catch (err) {
    console.error('Failed to save API key:', err);
  }
}

export function resetAllStorageToDemo(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEYS.LEADS, JSON.stringify(INITIAL_LEADS));
    localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify(INITIAL_ACTIVITIES));
    localStorage.setItem(KEYS.TEAM, JSON.stringify(INITIAL_TEAM));
    localStorage.setItem(KEYS.TEMPLATES, JSON.stringify(DEFAULT_TEMPLATES));
    localStorage.setItem(KEYS.AUTOMATION, JSON.stringify(DEFAULT_AUTOMATION_SETTINGS));
  } catch (e) {
    console.warn('Failed to reset storage:', e);
  }
}

export function clearAllLeadsStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEYS.LEADS, JSON.stringify([]));
    localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify([]));
  } catch (e) {
    console.warn('Failed to clear leads storage:', e);
  }
}
