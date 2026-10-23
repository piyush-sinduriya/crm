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
  const raw = localStorage.getItem(KEYS.LEADS);
  return safeParse<Lead[]>(raw, INITIAL_LEADS);
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
  const raw = localStorage.getItem(KEYS.ACTIVITIES);
  return safeParse<ActivityItem[]>(raw, INITIAL_ACTIVITIES);
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
  const raw = localStorage.getItem(KEYS.TEAM);
  return safeParse<TeamMember[]>(raw, INITIAL_TEAM);
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
  const raw = localStorage.getItem(KEYS.BRANDING);
  return safeParse<BrandConfig>(raw, fallback);
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
  const raw = localStorage.getItem(KEYS.TEMPLATES);
  return safeParse<MessageTemplate[]>(raw, DEFAULT_TEMPLATES);
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
  const raw = localStorage.getItem(KEYS.AUTOMATION);
  return safeParse<AutomationSettings>(raw, DEFAULT_AUTOMATION_SETTINGS);
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
  const stored = localStorage.getItem(KEYS.GEMINI_API_KEY);
  if (stored) return stored;
  // Fallback to Vite env var if configured
  return (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY || '';
}

export function setStoredGeminiApiKey(apiKey: string): void {
  if (typeof window === 'undefined') return;
  if (!apiKey) {
    localStorage.removeItem(KEYS.GEMINI_API_KEY);
  } else {
    localStorage.setItem(KEYS.GEMINI_API_KEY, apiKey.trim());
  }
}

export function resetAllStorageToDemo(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.LEADS, JSON.stringify(INITIAL_LEADS));
  localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify(INITIAL_ACTIVITIES));
  localStorage.setItem(KEYS.TEAM, JSON.stringify(INITIAL_TEAM));
  localStorage.setItem(KEYS.TEMPLATES, JSON.stringify(DEFAULT_TEMPLATES));
  localStorage.setItem(KEYS.AUTOMATION, JSON.stringify(DEFAULT_AUTOMATION_SETTINGS));
}

export function clearAllLeadsStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.LEADS, JSON.stringify([]));
  localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify([]));
}
