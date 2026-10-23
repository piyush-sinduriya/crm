import React, { useState, useMemo, useEffect } from 'react';
import {
  Lead,
  LeadStatus,
  ChannelType,
  NavigationTab,
  ActivityItem,
  TeamMember,
  UserProfile,
  BrandConfig,
  MessageTemplate,
  AutomationSettings,
  Message,
  UserRole,
  ThemeMode,
  AccentColor,
} from './types/crm';
import {
  DEFAULT_TEMPLATES,
  DEFAULT_AUTOMATION_SETTINGS,
  createAutoReplyMessage,
  createSlaEscalationCustomerMessage,
  createRepAlertMessage,
  getChatTimestamp,
} from './utils/automationEngine';
import {
  getStoredTheme,
  getStoredAccent,
  applyThemeToDocument,
  ACCENT_COLORS,
} from './utils/themeConfig';
import { INITIAL_LEADS, INITIAL_ACTIVITIES, AGENTS, INITIAL_TEAM } from './data/mockInquiries';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { AnalyticsCards } from './components/AnalyticsCards';
import { FilterBar } from './components/FilterBar';
import { LeadFeed } from './components/LeadFeed';
import { LeadDetail } from './components/LeadDetail';
import { ManualEntryModal } from './components/ManualEntryModal';
import { PipelineView } from './components/PipelineView';
import { AnalyticsView } from './components/AnalyticsView';
import { RecentActivityFeed } from './components/RecentActivityFeed';
import { SettingsView } from './components/SettingsView';
import { TeamManagementView } from './components/TeamManagementView';
import { AddTeamMemberModal } from './components/AddTeamMemberModal';
import { UserProfileModal } from './components/UserProfileModal';
import { BrandingModal } from './components/BrandingModal';
import { ExportLeadsModal } from './components/ExportLeadsModal';
import { ImportLeadsModal } from './components/ImportLeadsModal';
import { IndiaMartSyncModal } from './components/IndiaMartSyncModal';
import { DashboardView } from './components/DashboardView';
import { DateRangeSelector } from './components/DateRangeSelector';
import { PermissionRestrictedModal } from './components/PermissionRestrictedModal';
import {
  DateRangeFilter,
  generateLeadsCsv,
  downloadCsv,
  getExportFilename,
  filterLeadsByDateRange,
  getTodayDateString,
} from './utils/csvExport';
import { analyzeInquiryContent } from './services/aiEngine';
import {
  loadStoredLeads,
  saveStoredLeads,
  loadStoredActivities,
  saveStoredActivities,
  loadStoredTeam,
  saveStoredTeam,
  loadStoredBranding,
  saveStoredBranding,
  loadStoredTemplates,
  saveStoredTemplates,
  loadStoredAutomation,
  saveStoredAutomation,
  resetAllStorageToDemo,
  clearAllLeadsStorage,
} from './utils/storage';
import { Sparkles, CheckCircle2, Bell, Radio, FileSpreadsheet, Settings2 } from 'lucide-react';

export default function App() {
  const [leads, setLeads] = useState<Lead[]>(() => loadStoredLeads());
  const [activities, setActivities] = useState<ActivityItem[]>(() => loadStoredActivities());
  const [team, setTeam] = useState<TeamMember[]>(() => loadStoredTeam());
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(() => {
    const stored = loadStoredLeads();
    return stored[0]?.id || null;
  });
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');

  // Custom Logo & Branding State
  const [branding, setBranding] = useState<BrandConfig>(() =>
    loadStoredBranding({
      name: 'OmniSync',
      tag: 'CRM',
      subtitle: 'Omnichannel Intelligence',
      logoUrl: undefined,
      currency: 'INR',
      currencySymbol: '₹',
    })
  );

  // Logged-in User Profile State (Piyush Sinduriya)
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile>({
    name: 'Piyush Sinduriya',
    email: 'piyush@schooldecor.in',
    phone: '+91 98200 38910',
    role: 'Founder & Business Director',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    permissions: [
      'Full Administrator Access',
      'Lead Reassignment',
      'Omnichannel Inbound Inquiries',
      'Smart Reply Prompt Tuning',
      'Export CRM Data',
      'Team Account Management',
    ],
    leadsHandled: 48,
    closedDeals: 19,
    responseRate: '98.4%',
    pipelineWonValue: '₹1,85,00,000',
  });

  // Filters (for Inbox view)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [selectedScore, setSelectedScore] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Shared Date Range Filter Control (Preset: Indian Financial Year 2026-27 by default)
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeFilter>({
    preset: 'fy_2026_27',
    startDate: '2026-04-01',
    endDate: getTodayDateString(),
  });

  // Automated Messaging & Workflows State
  const [templates, setTemplates] = useState<MessageTemplate[]>(() => loadStoredTemplates());
  const [automationSettings, setAutomationSettings] = useState<AutomationSettings>(() =>
    loadStoredAutomation()
  );

  // Persistent Storage Auto-Save Effects
  useEffect(() => {
    saveStoredLeads(leads);
  }, [leads]);

  useEffect(() => {
    saveStoredActivities(activities);
  }, [activities]);

  useEffect(() => {
    saveStoredTeam(team);
  }, [team]);

  useEffect(() => {
    saveStoredBranding(branding);
  }, [branding]);

  useEffect(() => {
    saveStoredTemplates(templates);
  }, [templates]);

  useEffect(() => {
    saveStoredAutomation(automationSettings);
  }, [automationSettings]);

  // Role-Based Access Control (RBAC) State
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [restrictedActionName, setRestrictedActionName] = useState<string>(
    'Settings & Team Management'
  );

  // Theme Mode (Dark / Light) and Custom Accent Color State
  const [theme, setTheme] = useState<ThemeMode>(() => getStoredTheme());
  const [accentColor, setAccentColor] = useState<AccentColor>(() => getStoredAccent());

  // Keep DOM attribute sync with theme and accent color
  useEffect(() => {
    applyThemeToDocument(theme, accentColor);
  }, [theme, accentColor]);

  // Modals & Notifications
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isIndiaMartModalOpen, setIsIndiaMartModalOpen] = useState(false);
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [isBrandingModalOpen, setIsBrandingModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; subtitle: string } | null>(
    null
  );

  const showToast = (title: string, subtitle: string) => {
    setToastMessage({ title, subtitle });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.title === title ? null : prev));
    }, 4000);
  };

  const handleToggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    showToast(
      nextTheme === 'light' ? 'Light Mode Activated' : 'Dark Mode Activated',
      nextTheme === 'light'
        ? 'Switched to clean white/slate background with soft grey cards.'
        : 'Switched to deep slate/indigo dark mode palette.'
    );
  };

  const handleUpdateAccentColor = (newAccent: AccentColor) => {
    setAccentColor(newAccent);
    const chosen = ACCENT_COLORS.find((c) => c.id === newAccent);
    showToast(
      `Accent Updated: ${chosen?.name || newAccent}`,
      `Active buttons, badges, and highlights updated across the CRM.`
    );
  };

  const handleRestrictedAction = (feature: string) => {
    setRestrictedActionName(feature);
    setIsPermissionModalOpen(true);
  };

  const handleToggleRole = () => {
    const nextRole: UserRole = currentRole === 'admin' ? 'sales_rep' : 'admin';
    setCurrentRole(nextRole);

    if (nextRole === 'sales_rep') {
      setCurrentUserProfile((prev) => ({
        ...prev,
        role: 'Sales Representative',
        userRole: 'sales_rep',
        permissions: [
          'View Inbound Inquiries & Feed',
          'Manage Lead Pipeline Stages',
          'Send Real-time Replies & WhatsApp',
          'Add Internal Follow-up Notes',
          'Reassign Leads to Representatives',
        ],
      }));
      showToast(
        'Role Switched: Sales Rep (Standard User)',
        'Admin settings, team role configuration, logo branding, and exports are now restricted.'
      );
      if (currentTab === 'settings' || currentTab === 'team') {
        setCurrentTab('inbox');
      }
    } else {
      setCurrentUserProfile((prev) => ({
        ...prev,
        role: 'Enterprise Sales Lead (HQ Admin)',
        userRole: 'admin',
        permissions: [
          'Full Administrator Access',
          'Lead Reassignment',
          'Omnichannel Inbound Inquiries',
          'Smart Reply Prompt Tuning',
          'Export CRM Data',
          'Team Account Management',
          'Automated Workflows & Message Templates',
        ],
      }));
      showToast(
        'Role Switched: Administrator',
        'Full access unlocked: Settings, Team Management, Branding, Templates, and CSV Exports.'
      );
    }
  };

  const handleDeleteLead = (leadId: string) => {
    if (currentRole === 'sales_rep') {
      handleRestrictedAction('Delete Lead Inquiry');
      return;
    }
    const target = leads.find((l) => l.id === leadId);
    const contact = target?.contactName || 'Lead';
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    if (selectedLeadId === leadId) {
      const remaining = leads.filter((l) => l.id !== leadId);
      setSelectedLeadId(remaining[0]?.id || null);
    }
    showToast('Inquiry Removed', `Inquiry from ${contact} has been permanently deleted.`);
  };

  // Direct CSV Export helper for Instant Action
  const handleQuickExport = (targetLeads: Lead[], viewName: string) => {
    if (currentRole !== 'admin') {
      handleRestrictedAction('Bulk CSV Data Export');
      return;
    }
    if (targetLeads.length === 0) {
      showToast('Export Notice', 'No inquiries found matching the selected date range and filters.');
      return;
    }
    const csvContent = generateLeadsCsv(targetLeads);
    const filename = getExportFilename(
      dateRangeFilter.preset,
      dateRangeFilter.startDate,
      dateRangeFilter.endDate
    );
    downloadCsv(filename, csvContent);
    showToast(
      'CSV Report Downloaded',
      `Saved ${targetLeads.length} inquiries to ${filename}`
    );
  };

  // Filtered Leads (for Inbox view: includes date range, channel, score, status, query)
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Date range filter
      if (dateRangeFilter.startDate) {
        const startMs = new Date(`${dateRangeFilter.startDate}T00:00:00`).getTime();
        if (!isNaN(startMs) && lead.receivedTimestamp < startMs) return false;
      }
      if (dateRangeFilter.endDate) {
        const endMs = new Date(`${dateRangeFilter.endDate}T23:59:59.999`).getTime();
        if (!isNaN(endMs) && lead.receivedTimestamp > endMs) return false;
      }

      // Channel filter
      if (selectedChannel !== 'all' && lead.channel !== selectedChannel) {
        return false;
      }
      // Lead score filter
      if (selectedScore !== 'all' && lead.leadScore !== selectedScore) {
        return false;
      }
      // Status filter
      if (selectedStatus !== 'all' && lead.status !== selectedStatus) {
        return false;
      }
      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesContact = lead.contactName.toLowerCase().includes(q);
        const matchesCompany = lead.company?.toLowerCase().includes(q);
        const matchesEmail = lead.email.toLowerCase().includes(q);
        const matchesPhone = lead.phone.toLowerCase().includes(q);
        const matchesMessage = lead.message.toLowerCase().includes(q);
        const matchesSummary = lead.summary.toLowerCase().includes(q);
        if (
          !matchesContact &&
          !matchesCompany &&
          !matchesEmail &&
          !matchesPhone &&
          !matchesMessage &&
          !matchesSummary
        ) {
          return false;
        }
      }
      return true;
    });
  }, [leads, selectedChannel, selectedScore, selectedStatus, searchQuery, dateRangeFilter]);

  // Filtered Leads for Pipeline View (by active date range)
  const pipelineLeads = useMemo(() => {
    return filterLeadsByDateRange(leads, dateRangeFilter);
  }, [leads, dateRangeFilter]);

  // Selected Lead Object
  const selectedLead = useMemo(() => {
    return leads.find((l) => l.id === selectedLeadId) || filteredLeads[0] || leads[0];
  }, [leads, selectedLeadId, filteredLeads]);

  // Available representatives dynamically derived from active team members
  const availableAgents = useMemo(() => {
    return team
      .filter((m) => m.active)
      .map((m) => ({
        name: m.name,
        avatar: m.avatar,
        email: m.email,
        role: m.role,
      }));
  }, [team]);

  // Lead selection handler (marks as read)
  const handleSelectLead = (id: string) => {
    setSelectedLeadId(id);
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, unread: false } : l))
    );
  };

  // Update lead status
  const handleUpdateStatus = (leadId: string, newStatus: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              status: newStatus,
              slaStatus: newStatus !== 'new' ? 'met' : l.slaStatus,
              slaMinutesRemaining: newStatus !== 'new' ? 0 : l.slaMinutesRemaining,
            }
          : l
      )
    );

    const targetLead = leads.find((l) => l.id === leadId);
    if (targetLead) {
      const newAct: ActivityItem = {
        id: `act-${Date.now()}`,
        leadId,
        leadName: targetLead.contactName,
        channel: targetLead.channel,
        action: 'status_changed',
        description: `Lead status updated to "${newStatus.replace('_', ' ').toUpperCase()}"`,
        timestamp: 'Just now',
        timestampMs: Date.now(),
        user: currentUserProfile.name,
      };
      setActivities((prev) => [newAct, ...prev]);
      showToast('Status Updated', `${targetLead.contactName} moved to ${newStatus}`);
    }
  };

  // Update assigned agent
  const handleUpdateAgent = (leadId: string, agentName: string) => {
    const agent = availableAgents.find((a) => a.name === agentName) || availableAgents[0];
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, assignedAgent: agent } : l))
    );

    const targetLead = leads.find((l) => l.id === leadId);
    if (targetLead) {
      const newAct: ActivityItem = {
        id: `act-${Date.now()}`,
        leadId,
        leadName: targetLead.contactName,
        channel: targetLead.channel,
        action: 'agent_assigned',
        description: `Assigned sales representative to ${agentName}`,
        timestamp: 'Just now',
        timestampMs: Date.now(),
        user: currentUserProfile.name,
      };
      setActivities((prev) => [newAct, ...prev]);
      showToast('Agent Reassigned', `Assigned to ${agentName}`);
    }
  };

  // Send reply
  const handleSendReply = (leadId: string, replyText: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const targetLead = leads.find((l) => l.id === leadId);
    if (!targetLead) return;

    const newReplyMessage = {
      id: `msg-${Date.now()}`,
      sender: 'agent' as const,
      senderName: targetLead.assignedAgent.name,
      text: replyText,
      timestamp: nowTime,
      channel: targetLead.channel,
    };

    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              status: l.status === 'new' ? 'in_progress' : l.status,
              conversation: [...l.conversation, newReplyMessage],
              unread: false,
              slaStatus: 'met',
              slaMinutesRemaining: 0,
            }
          : l
      )
    );

    const newAct: ActivityItem = {
      id: `act-${Date.now()}`,
      leadId,
      leadName: targetLead.contactName,
      channel: targetLead.channel,
      action: 'reply_sent',
      description: `Dispatched message via ${targetLead.channel.toUpperCase()} to ${targetLead.contactName}`,
      timestamp: 'Just now',
      timestampMs: Date.now(),
      user: targetLead.assignedAgent.name,
    };
    setActivities((prev) => [newAct, ...prev]);

    showToast('Reply Dispatched', `Message sent to ${targetLead.contactName} via ${targetLead.channel}`);
  };

  // Add internal note
  const handleAddNote = (leadId: string, noteText: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const targetLead = leads.find((l) => l.id === leadId);
    if (!targetLead) return;

    const newNote = {
      id: `note-${Date.now()}`,
      author: currentUserProfile.name,
      text: noteText,
      timestamp: nowTime,
    };

    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId ? { ...l, notes: [...l.notes, newNote] } : l
      )
    );

    const newAct: ActivityItem = {
      id: `act-${Date.now()}`,
      leadId,
      leadName: targetLead.contactName,
      channel: targetLead.channel,
      action: 'note_added',
      description: `Internal deal note recorded on ${targetLead.contactName}`,
      timestamp: 'Just now',
      timestampMs: Date.now(),
      user: currentUserProfile.name,
    };
    setActivities((prev) => [newAct, ...prev]);
    showToast('Note Saved', 'Internal note added to record');
  };

  // Template Management Handlers
  const handleSaveTemplate = (tpl: MessageTemplate) => {
    setTemplates((prev) => {
      const idx = prev.findIndex((t) => t.id === tpl.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = tpl;
        return updated;
      }
      return [tpl, ...prev];
    });
    showToast('Template Saved', `"${tpl.name}" is now ready for auto-responders & workflows`);
  };

  const handleDeleteTemplate = (templateId: string) => {
    const target = templates.find((t) => t.id === templateId);
    setTemplates((prev) => prev.filter((t) => t.id !== templateId));
    showToast('Template Removed', `Deleted "${target?.name || 'Template'}"`);
  };

  const handleResetTemplates = () => {
    setTemplates(DEFAULT_TEMPLATES);
    showToast('Defaults Restored', 'Reset to 5 system standard message templates');
  };

  // Trigger Controls: Dispatch Automated WhatsApp / Email Message from Lead Detail
  const handleDispatchAutomatedMessage = (
    leadId: string,
    template: MessageTemplate,
    channel: ChannelType,
    renderedBody: string,
    renderedSubject?: string
  ) => {
    const targetLead = leads.find((l) => l.id === leadId);
    if (!targetLead) return;

    const time = getChatTimestamp();
    const directMsg: Message = {
      id: `msg-auto-${Date.now()}`,
      sender: 'agent',
      senderName: currentUserProfile.name,
      text: `${renderedSubject ? `[${renderedSubject}]\n\n` : ''}${renderedBody}`,
      timestamp: time,
      channel,
      isAutomated: true,
      templateName: template.name,
    };

    const auditEventMsg: Message = {
      id: `msg-audit-${Date.now()}`,
      sender: 'system',
      senderName: 'Workflow Engine',
      text: `⚡ Automated ${template.name} (${channel.toUpperCase()}) sent at ${time} by ${currentUserProfile.name}`,
      timestamp: time,
      isAutomated: true,
    };

    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              status: l.status === 'new' ? 'in_progress' : l.status,
              slaStatus: 'met',
              conversation: [...l.conversation, directMsg, auditEventMsg],
            }
          : l
      )
    );

    const newAct: ActivityItem = {
      id: `act-${Date.now()}`,
      leadId,
      leadName: targetLead.contactName,
      channel,
      action: 'template_sent',
      description: `Automated template "${template.name}" dispatched to ${targetLead.contactName} via ${channel.toUpperCase()}`,
      timestamp: 'Just now',
      timestampMs: Date.now(),
      user: currentUserProfile.name,
    };
    setActivities((prev) => [newAct, ...prev]);

    showToast(
      'Automated Message Dispatched',
      `Sent "${template.name}" via ${channel.toUpperCase()} to ${targetLead.contactName}`
    );
  };

  // SLA Expiry Auto-Follow Up & Rep Escalation Trigger
  const handleTriggerSlaEscalation = (leadId: string) => {
    const targetLead = leads.find((l) => l.id === leadId);
    if (!targetLead) return;

    const template =
      templates.find((t) => t.id === automationSettings.slaEscalationTemplateId) ||
      templates.find((t) => t.category === 'sla_escalation') ||
      DEFAULT_TEMPLATES[4];

    const customerMsg = createSlaEscalationCustomerMessage(
      targetLead,
      template,
      targetLead.assignedAgent?.name
    );
    const repAlertMsg = createRepAlertMessage(targetLead, targetLead.assignedAgent?.name);

    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              slaEscalated: true,
              slaStatus: 'breached',
              conversation: [...l.conversation, customerMsg, repAlertMsg],
            }
          : l
      )
    );

    const newAct: ActivityItem = {
      id: `act-sla-${Date.now()}`,
      leadId,
      leadName: targetLead.contactName,
      channel: targetLead.channel,
      action: 'sla_escalation',
      description: `SLA 15m breach escalation: Secondary follow-up sent to ${targetLead.contactName}; alert sent to ${targetLead.assignedAgent?.name}`,
      timestamp: 'Just now',
      timestampMs: Date.now(),
      user: 'SLA Escalation Engine',
    };
    setActivities((prev) => [newAct, ...prev]);

    showToast(
      'SLA Auto-Escalation Executed',
      `Alert sent to ${targetLead.assignedAgent?.name} & secondary follow-up sent to client`
    );
  };

  // Background SLA Expiry Monitor (Checks every 20 seconds for leads past 15m in "New" status)
  useEffect(() => {
    if (!automationSettings.slaEscalationEnabled) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const thresholdMs = (automationSettings.slaThresholdMinutes || 15) * 60 * 1000;

      setLeads((prevLeads) => {
        let hasUpdates = false;
        const updated = prevLeads.map((l) => {
          const hasReplied = l.conversation.some((m) => m.sender === 'agent');
          const isOverdue =
            l.status === 'new' && !hasReplied && now - l.receivedTimestamp > thresholdMs;

          if (isOverdue && !l.slaEscalated) {
            hasUpdates = true;
            const template =
              templates.find((t) => t.id === automationSettings.slaEscalationTemplateId) ||
              templates.find((t) => t.category === 'sla_escalation') ||
              DEFAULT_TEMPLATES[4];

            const customerMsg = createSlaEscalationCustomerMessage(
              l,
              template,
              l.assignedAgent?.name
            );
            const repAlert = createRepAlertMessage(l, l.assignedAgent?.name);

            const slaAct: ActivityItem = {
              id: `act-sla-${Date.now()}-${l.id}`,
              leadId: l.id,
              leadName: l.contactName,
              channel: l.channel,
              action: 'sla_escalation',
              description: `15m SLA Expiry: Secondary follow-up sent to ${l.contactName}; escalation alert sent to rep ${l.assignedAgent?.name}`,
              timestamp: 'Just now',
              timestampMs: Date.now(),
              user: 'SLA Auto-Escalation Engine',
            };
            setActivities((acts) => [slaAct, ...acts]);

            return {
              ...l,
              slaEscalated: true,
              slaStatus: 'breached' as const,
              conversation: [...l.conversation, customerMsg, repAlert],
            };
          }
          return l;
        });

        return hasUpdates ? updated : prevLeads;
      });
    }, 20000);

    return () => clearInterval(interval);
  }, [
    automationSettings.slaEscalationEnabled,
    automationSettings.slaThresholdMinutes,
    automationSettings.slaEscalationTemplateId,
    templates,
  ]);

  // Add Manual Lead
  const handleAddManualLead = (newLead: Lead) => {
    let finalLead = { ...newLead };

    // Auto-reply check for manual entries if enabled
    if (automationSettings.autoReplyEnabled && automationSettings.enabledChannels.manual) {
      const autoTpl =
        templates.find((t) => t.id === automationSettings.autoReplyTemplateId) ||
        DEFAULT_TEMPLATES[0];
      const autoMsg = createAutoReplyMessage(finalLead, autoTpl, currentUserProfile.name);
      finalLead.conversation = [...finalLead.conversation, autoMsg];
    }

    setLeads((prev) => [finalLead, ...prev]);
    setSelectedLeadId(finalLead.id);

    const newAct: ActivityItem = {
      id: `act-${Date.now()}`,
      leadId: finalLead.id,
      leadName: finalLead.contactName,
      channel: finalLead.channel,
      action: 'manual_created',
      description: `New ${finalLead.channel.toUpperCase()} inquiry logged: ${finalLead.message.slice(0, 45)}...`,
      timestamp: 'Just now',
      timestampMs: Date.now(),
      user: currentUserProfile.name,
    };
    setActivities((prev) => [newAct, ...prev]);

    showToast(
      'New Lead Created & Triaged',
      `${finalLead.contactName} scored as ${finalLead.leadScore.toUpperCase()} lead`
    );
  };

  // Bulk CSV Import Handler
  const handleImportLeads = (newLeads: Lead[]) => {
    setLeads((prev) => [...newLeads, ...prev]);
    if (newLeads.length > 0) {
      setSelectedLeadId(newLeads[0].id);
      const newAct: ActivityItem = {
        id: `act-${Date.now()}`,
        leadId: newLeads[0].id,
        leadName: `${newLeads.length} Leads`,
        channel: 'manual',
        action: 'bulk_import',
        description: `Bulk imported ${newLeads.length} commercial inquiries with automated AI scoring.`,
        timestamp: 'Just now',
        timestampMs: Date.now(),
        user: currentUserProfile.name,
      };
      setActivities((prev) => [newAct, ...prev]);
      showToast('Leads Imported', `Successfully added ${newLeads.length} leads with AI evaluation`);
    }
  };

  // Reset to Demo Data
  const handleResetToDemo = () => {
    resetAllStorageToDemo();
    setLeads(loadStoredLeads());
    setActivities(loadStoredActivities());
    setTeam(loadStoredTeam());
    showToast('Demo Restored', 'Restored initial sample leads and activities.');
  };

  // Clear All Leads
  const handleClearAllLeads = () => {
    clearAllLeadsStorage();
    setLeads([]);
    setActivities([]);
    setSelectedLeadId(null);
    showToast('CRM Cleared', 'All leads removed. Ready for your real business inquiries.');
  };

  // Team Management Handlers
  const handleAddTeamMember = (newMember: TeamMember) => {
    setTeam((prev) => [newMember, ...prev]);

    const newAct: ActivityItem = {
      id: `act-${Date.now()}`,
      leadId: 'team',
      leadName: newMember.name,
      channel: 'manual',
      action: 'agent_assigned',
      description: `New sales representative ${newMember.name} joined as ${newMember.role}`,
      timestamp: 'Just now',
      timestampMs: Date.now(),
      user: currentUserProfile.name,
    };
    setActivities((prev) => [newAct, ...prev]);

    showToast(
      'Team Member Added',
      `${newMember.name} was successfully invited as ${newMember.role}`
    );
  };

  const handleUpdateMemberRole = (memberId: string, newRole: string) => {
    setTeam((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );

    const target = team.find((m) => m.id === memberId);
    if (target) {
      if (target.name === currentUserProfile.name) {
        setCurrentUserProfile((prev) => ({ ...prev, role: newRole }));
      }

      const newAct: ActivityItem = {
        id: `act-${Date.now()}`,
        leadId: 'team',
        leadName: target.name,
        channel: 'manual',
        action: 'agent_assigned',
        description: `Updated ${target.name}'s role to ${newRole}`,
        timestamp: 'Just now',
        timestampMs: Date.now(),
        user: currentUserProfile.name,
      };
      setActivities((prev) => [newAct, ...prev]);
      showToast('Role Updated', `${target.name} is now ${newRole}`);
    }
  };

  const handleToggleMemberActive = (memberId: string) => {
    const target = team.find((m) => m.id === memberId);
    if (!target) return;

    const nextState = !target.active;
    setTeam((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, active: nextState } : m))
    );

    const newAct: ActivityItem = {
      id: `act-${Date.now()}`,
      leadId: 'team',
      leadName: target.name,
      channel: 'manual',
      action: 'status_changed',
      description: `${target.name}'s account was ${nextState ? 'reactivated' : 'deactivated'}`,
      timestamp: 'Just now',
      timestampMs: Date.now(),
      user: currentUserProfile.name,
    };
    setActivities((prev) => [newAct, ...prev]);

    showToast(
      nextState ? 'Account Reactivated' : 'Account Deactivated',
      `${target.name} is now ${nextState ? 'active' : 'inactive'}`
    );
  };

  const handleReassignLeads = (fromRepName: string, toRepName: string) => {
    const targetRep = team.find((m) => m.name === toRepName) || team[0];
    let countReassigned = 0;

    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.assignedAgent.name === fromRepName) {
          countReassigned++;
          return {
            ...lead,
            assignedAgent: {
              name: targetRep.name,
              avatar: targetRep.avatar,
              email: targetRep.email,
              role: targetRep.role,
            },
            conversation: [
              ...lead.conversation,
              {
                id: `msg-reassign-${Date.now()}-${countReassigned}`,
                sender: 'system' as const,
                senderName: 'OmniSync System',
                text: `Lead reassigned from ${fromRepName} to ${targetRep.name}.`,
                timestamp: 'Just now',
              },
            ],
          };
        }
        return lead;
      })
    );

    const newAct: ActivityItem = {
      id: `act-${Date.now()}`,
      leadId: 'team',
      leadName: toRepName,
      channel: 'manual',
      action: 'agent_assigned',
      description: `Reassigned ${countReassigned} inquiries from ${fromRepName} to ${toRepName}`,
      timestamp: 'Just now',
      timestampMs: Date.now(),
      user: currentUserProfile.name,
    };
    setActivities((prev) => [newAct, ...prev]);

    showToast(
      'Leads Reassigned',
      `Transferred ${countReassigned} leads from ${fromRepName} to ${toRepName}`
    );
  };

  // User Profile Handlers
  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setCurrentUserProfile((prev) => ({ ...prev, ...updated }));

    if (updated.name || updated.email || updated.phone || updated.role) {
      setTeam((prev) =>
        prev.map((m) =>
          m.id === 'team-1'
            ? {
                ...m,
                name: updated.name ?? m.name,
                email: updated.email ?? m.email,
                phone: updated.phone ?? m.phone,
                role: updated.role ?? m.role,
              }
            : m
        )
      );
    }

    showToast('Profile Saved', 'Your user account details were updated');
  };

  const handleLogout = () => {
    setCurrentUserProfile((prev) => ({ ...prev, status: 'offline' }));
    showToast('Logged Out', 'You have been signed out of session');
    setIsUserProfileModalOpen(false);
  };

  // Branding update handler
  const handleUpdateBranding = (newBrand: BrandConfig) => {
    setBranding(newBrand);
    showToast('Branding Updated', `App identity set to ${newBrand.name}`);
  };

  // Simulate incoming live inquiry
  const handleSimulateInbound = () => {
    const simInboundCandidates = [
      {
        channel: 'whatsapp' as ChannelType,
        name: 'Rohan Mehta',
        company: 'Mehta Logistics & Warehousing',
        email: 'rohan@mehtalogistics.in',
        phone: '+91 98204 88319',
        msg: 'Hi, we operate 18 cold storage warehouses across Maharashtra. Need instant pricing for 400 IoT temperature sensors with cellular SIM failover. Delivery required in 14 days.',
      },
      {
        channel: 'indiamart' as ChannelType,
        name: 'Gaurav Kulkarni',
        company: 'Kulkarni Tooling Works',
        email: 'gaurav@kulkarnitooling.com',
        phone: '+91 97660 55120',
        msg: 'B2B RFQ: Looking for monthly supply of 10,000 carbide cutting inserts (ISO standard). Can you share quotation per 500 pcs batch?',
      },
      {
        channel: 'instagram' as ChannelType,
        name: 'Maya Lin',
        company: 'Lin Design Collective',
        email: 'maya@lindesign.co',
        phone: '+1 (415) 321-9988',
        msg: 'Hey! Loved your latest post on custom acoustic architectural baffles. We are outfitting a creative agency in San Francisco. Do you ship to California?',
      },
    ];

    const pick = simInboundCandidates[Math.floor(Math.random() * simInboundCandidates.length)];
    const aiAnalysis = analyzeInquiryContent(pick.name, pick.company, pick.channel, pick.msg);
    const assignedRep = availableAgents[Math.floor(Math.random() * availableAgents.length)];

    const simulatedLead: Lead = {
      id: `lead-sim-${Date.now()}`,
      contactName: pick.name,
      company: pick.company,
      email: pick.email,
      phone: pick.phone,
      channel: pick.channel,
      channelDetail: `Live Inbound Stream via ${pick.channel.toUpperCase()}`,
      receivedAt: 'Just now',
      receivedTimestamp: Date.now(),
      message: pick.msg,
      status: 'new',
      leadScore: aiAnalysis.leadScore,
      scoreReason: aiAnalysis.scoreReason,
      sentiment: aiAnalysis.sentiment,
      summary: aiAnalysis.summary,
      suggestedReply: aiAnalysis.suggestedReply,
      assignedAgent: assignedRep,
      conversation: [
        {
          id: `msg-${Date.now()}`,
          sender: 'customer',
          senderName: pick.name,
          text: pick.msg,
          timestamp: 'Just now',
          channel: pick.channel,
        },
      ],
      notes: [],
      estimatedValue: aiAnalysis.estimatedValue,
      tags: aiAnalysis.tags,
      unread: true,
    };

    // Auto-Reply on New Inbound Leads: Check if automated response is enabled for this channel
    let autoReplyDispatched = false;
    let autoTplName = '';

    if (automationSettings.autoReplyEnabled && automationSettings.enabledChannels[pick.channel]) {
      const autoTpl =
        templates.find((t) => t.id === automationSettings.autoReplyTemplateId) ||
        templates.find((t) => t.category === 'welcome') ||
        DEFAULT_TEMPLATES[0];

      const autoReplyMsg = createAutoReplyMessage(
        simulatedLead,
        autoTpl,
        assignedRep.name
      );

      simulatedLead.conversation.push(autoReplyMsg);
      autoReplyDispatched = true;
      autoTplName = autoTpl.name;
    }

    setLeads((prev) => [simulatedLead, ...prev]);
    setSelectedLeadId(simulatedLead.id);

    const newAct: ActivityItem = {
      id: `act-${Date.now()}`,
      leadId: simulatedLead.id,
      leadName: simulatedLead.contactName,
      channel: simulatedLead.channel,
      action: 'inquiry_received',
      description: `Inbound inquiry arrived via ${simulatedLead.channel.toUpperCase()}`,
      timestamp: 'Just now',
      timestampMs: Date.now(),
      user: 'System Webhook',
    };

    if (autoReplyDispatched) {
      const autoAct: ActivityItem = {
        id: `act-auto-${Date.now() + 1}`,
        leadId: simulatedLead.id,
        leadName: simulatedLead.contactName,
        channel: simulatedLead.channel,
        action: 'auto_reply_sent',
        description: `Instant auto-reply (${autoTplName}) dispatched to ${simulatedLead.contactName} via ${simulatedLead.channel.toUpperCase()}`,
        timestamp: 'Just now',
        timestampMs: Date.now() + 1,
        user: 'OmniSync Auto-Responder',
      };
      setActivities((prev) => [autoAct, newAct, ...prev]);
      showToast(
        `Inbound Lead & Auto-Reply`,
        `Received ${simulatedLead.contactName} via ${simulatedLead.channel.toUpperCase()}. Instant auto-reply sent!`
      );
    } else {
      setActivities((prev) => [newAct, ...prev]);
      showToast(
        `Inbound ${simulatedLead.channel.toUpperCase()} Lead`,
        `New inquiry from ${simulatedLead.contactName} (${simulatedLead.leadScore.toUpperCase()})`
      );
    }
  };

  // Counts for channel sidebar
  const channelCounts = useMemo(() => {
    const counts: Record<ChannelType, number> = {
      whatsapp: 0,
      email: 0,
      indiamart: 0,
      facebook: 0,
      instagram: 0,
      youtube: 0,
      manual: 0,
    };
    leads.forEach((l) => {
      if (counts[l.channel] !== undefined) counts[l.channel]++;
    });
    return counts;
  }, [leads]);

  const unreadCount = leads.filter((l) => l.unread).length;
  const hotLeadsCount = leads.filter((l) => l.leadScore === 'hot').length;

  return (
    <div
      className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans"
      data-theme={theme}
      data-accent={accentColor}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 p-3.5 bg-slate-900 border border-indigo-500/50 rounded-xl shadow-2xl animate-in slide-in-from-top-4 duration-200">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">{toastMessage.title}</div>
            <div className="text-[11px] text-slate-300">{toastMessage.subtitle}</div>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white text-xs pl-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => {
          if ((tab === 'settings' || tab === 'team') && currentRole === 'sales_rep') {
            handleRestrictedAction(tab === 'team' ? 'Team Management & Roles' : 'Settings & Automations');
            return;
          }
          setCurrentTab(tab);
          if (tab === 'inbox') {
            setSelectedStatus('all');
          }
        }}
        unreadCount={unreadCount}
        totalLeadsCount={leads.length}
        hotLeadsCount={hotLeadsCount}
        totalTeamCount={team.length}
        channelCounts={channelCounts}
        selectedChannelFilter={selectedChannel}
        onSelectChannelFilter={(c) => {
          setSelectedChannel(c);
          setCurrentTab('inbox');
        }}
        currentUserProfile={currentUserProfile}
        onOpenUserProfile={() => setIsUserProfileModalOpen(true)}
        branding={branding}
        onOpenBrandingModal={() => {
          if (currentRole === 'sales_rep') {
            handleRestrictedAction('Logo & Branding Settings');
            return;
          }
          setIsBrandingModalOpen(true);
        }}
        currentRole={currentRole}
        onRestrictedTabClick={handleRestrictedAction}
        onToggleRole={handleToggleRole}
      />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar Contract Navigation */}
        <TopNav
          currentTab={currentTab}
          onOpenManualModal={() => setIsManualModalOpen(true)}
          onOpenExportModal={() => {
            if (currentRole !== 'admin') {
              handleRestrictedAction('Bulk CSV Data Export');
              return;
            }
            setIsExportModalOpen(true);
          }}
          onOpenImportModal={() => setIsImportModalOpen(true)}
          onOpenIndiaMartModal={() => setIsIndiaMartModalOpen(true)}
          onSimulateInbound={handleSimulateInbound}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilterCount={
            (selectedChannel !== 'all' ? 1 : 0) +
            (selectedScore !== 'all' ? 1 : 0) +
            (selectedStatus !== 'all' ? 1 : 0)
          }
          currentRole={currentRole}
          onToggleRole={handleToggleRole}
          onRestrictedAction={handleRestrictedAction}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          currentUserProfile={currentUserProfile}
          onOpenUserProfile={() => setIsUserProfileModalOpen(true)}
        />

        {/* View Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950">
          {/* TAB 1: DISTINCT DASHBOARD VIEW (High-level analytics, KPIs, lead source charts, pipeline stages, quick activity) */}
          {currentTab === 'dashboard' && (
            <DashboardView
              leads={leads}
              activities={activities}
              onSelectLeadAndGoToInbox={(leadId) => {
                handleSelectLead(leadId);
                setCurrentTab('inbox');
              }}
              onNavigateToTab={(tab) => setCurrentTab(tab)}
              onOpenManualModal={() => setIsManualModalOpen(true)}
              onOpenImportModal={() => setIsImportModalOpen(true)}
              onOpenIndiaMartModal={() => setIsIndiaMartModalOpen(true)}
              onClearAllLeads={handleClearAllLeads}
              onSimulateInbound={handleSimulateInbound}
              currencySymbol={branding.currencySymbol || '₹'}
            />
          )}

          {/* TAB 2: DISTINCT INBOX VIEW (Dedicated full-screen message management with 40/60 split-pane) */}
          {currentTab === 'inbox' && (
            <div className="space-y-4">
              {/* Filter and Search Bar for Omnichannel Inbox with Date Range Selector & Export */}
              <FilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedChannel={selectedChannel}
                onChannelChange={setSelectedChannel}
                selectedScore={selectedScore}
                onScoreChange={setSelectedScore}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                dateRange={dateRangeFilter}
                onDateRangeChange={setDateRangeFilter}
                onResetFilters={() => {
                  setSearchQuery('');
                  setSelectedChannel('all');
                  setSelectedScore('all');
                  setSelectedStatus('all');
                  setDateRangeFilter({
                    preset: 'fy_2026_27',
                    startDate: '2026-04-01',
                    endDate: getTodayDateString(),
                  });
                }}
                totalFilteredCount={filteredLeads.length}
                onOpenExportModal={() => {
                  if (currentRole !== 'admin') {
                    handleRestrictedAction('Bulk CSV Data Export');
                    return;
                  }
                  setIsExportModalOpen(true);
                }}
                onQuickExport={() => handleQuickExport(filteredLeads, 'Inbox')}
              />

              {/* Dedicated Split Pane: 40% Left Feed, 60% Right Detail */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch min-h-[580px]">
                {/* Lead Feed (Left Column - 40% width / 5 of 12 columns) */}
                <div className="lg:col-span-5 h-[calc(100vh-250px)] min-h-[520px] flex flex-col">
                  <div className="flex items-center justify-between pb-2 text-xs font-semibold text-slate-400">
                    <span>
                      Inbound Conversations ({filteredLeads.length})
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      Click message to open thread
                    </span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <LeadFeed
                      leads={filteredLeads}
                      selectedLeadId={selectedLead?.id || null}
                      onSelectLead={handleSelectLead}
                      onClearFilters={() => {
                        setSearchQuery('');
                        setSelectedChannel('all');
                        setSelectedScore('all');
                        setSelectedStatus('all');
                      }}
                      onOpenManualModal={() => setIsManualModalOpen(true)}
                    />
                  </div>
                </div>

                {/* Lead Detail Panel (Right Column - 60% width / 7 of 12 columns) */}
                <div className="lg:col-span-7 h-[calc(100vh-250px)] min-h-[520px]">
                  {selectedLead ? (
                    <LeadDetail
                      lead={selectedLead}
                      onUpdateStatus={handleUpdateStatus}
                      onUpdateAgent={handleUpdateAgent}
                      onSendReply={handleSendReply}
                      onAddNote={handleAddNote}
                      availableAgents={availableAgents}
                      currencySymbol={branding.currencySymbol || '₹'}
                      templates={templates}
                      onDispatchAutomatedMessage={handleDispatchAutomatedMessage}
                      onTriggerSlaEscalation={handleTriggerSlaEscalation}
                      currentRole={currentRole}
                      onDeleteLead={handleDeleteLead}
                      onRestrictedAction={handleRestrictedAction}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center p-8 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-400 text-xs text-center">
                      Select an inquiry from the left feed to inspect details and AI insights
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LEADS PIPELINE (Kanban View) */}
          {currentTab === 'leads' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-white tracking-tight">
                      Lead Stages & Conversion Pipeline
                    </h2>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                      {pipelineLeads.length} Inquiries
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Manage lead progression from initial omnichannel arrival to closed deals
                  </p>
                </div>
                <div className="flex items-center flex-wrap gap-2">
                  {/* Date Range Selector placed next to Export CSV */}
                  <DateRangeSelector
                    value={dateRangeFilter}
                    onChange={setDateRangeFilter}
                  />

                  {/* Enhanced Export CSV button with Quick Download & Advanced Settings */}
                  <div className="flex items-center rounded-lg border border-emerald-800/70 bg-emerald-950/40 shadow-sm overflow-hidden">
                    <button
                      type="button"
                      onClick={() => handleQuickExport(pipelineLeads, 'Pipeline')}
                      className="px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/60 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                      title={`Export leads within selected date range (${dateRangeFilter.startDate || '2026-04-01'} to ${dateRangeFilter.endDate || 'Today'})`}
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Export CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (currentRole !== 'admin') {
                          handleRestrictedAction('Bulk CSV Data Export');
                          return;
                        }
                        setIsExportModalOpen(true);
                      }}
                      className="px-2 py-1.5 border-l border-emerald-800/60 text-emerald-400 hover:bg-emerald-900/60 transition-colors cursor-pointer"
                      title="Export Options & Channel Filter"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsManualModalOpen(true)}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all cursor-pointer"
                  >
                    + Add Lead
                  </button>
                </div>
              </div>

              <PipelineView
                leads={pipelineLeads}
                onSelectLead={(id) => {
                  setSelectedLeadId(id);
                  setCurrentTab('inbox');
                }}
                onUpdateStatus={handleUpdateStatus}
                currencySymbol={branding.currencySymbol || '₹'}
              />
            </div>
          )}

          {/* TAB 4: TEAM MANAGEMENT VIEW */}
          {currentTab === 'team' && (
            <TeamManagementView
              team={team}
              leads={leads}
              onOpenAddModal={() => {
                if (currentRole !== 'admin') {
                  handleRestrictedAction('Add Team Member');
                  return;
                }
                setIsAddTeamModalOpen(true);
              }}
              onUpdateMemberRole={handleUpdateMemberRole}
              onToggleMemberActive={handleToggleMemberActive}
              onReassignLeads={handleReassignLeads}
              currentRole={currentRole}
              onRestrictedAction={handleRestrictedAction}
            />
          )}

          {/* TAB 5: ANALYTICS (Charts & Deep-dive) */}
          {currentTab === 'analytics' && <AnalyticsView leads={leads} />}

          {/* TAB 6: ACTIVITY LOG (Full Audit Trail) */}
          {currentTab === 'activity' && (
            <div className="max-w-4xl space-y-4">
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Audit & Activity Log
                </h2>
                <p className="text-xs text-slate-400">
                  Real-time event stream of customer inquiries, rep responses, and pipeline milestones
                </p>
              </div>

              <RecentActivityFeed
                activities={activities}
                onSelectLead={(id) => {
                  setSelectedLeadId(id);
                  setCurrentTab('inbox');
                }}
              />
            </div>
          )}

          {/* TAB 7: SETTINGS (Includes Logo & Branding, Automated Workflows, Message Templates & Webhooks) */}
          {currentTab === 'settings' && (
            <SettingsView
              branding={branding}
              onUpdateBranding={handleUpdateBranding}
              templates={templates}
              onSaveTemplate={handleSaveTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              onResetTemplates={handleResetTemplates}
              automationSettings={automationSettings}
              onUpdateAutomationSettings={setAutomationSettings}
              currentRole={currentRole}
              onRestrictedAction={handleRestrictedAction}
              onSwitchToAdmin={handleToggleRole}
              theme={theme}
              onUpdateTheme={(m) => {
                setTheme(m);
                showToast(
                  m === 'light' ? 'Light Mode Activated' : 'Dark Mode Activated',
                  m === 'light'
                    ? 'Switched to clean white/slate background with soft grey cards.'
                    : 'Switched to deep slate/indigo dark mode palette.'
                );
              }}
              accentColor={accentColor}
              onUpdateAccentColor={handleUpdateAccentColor}
              onResetToDemo={handleResetToDemo}
              onClearAllLeads={handleClearAllLeads}
              totalLeadsCount={leads.length}
            />
          )}
        </main>
      </div>

      {/* Manual Entry Modal */}
      <ManualEntryModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSubmitLead={handleAddManualLead}
        assignedAgentName={currentUserProfile.name}
      />

      {/* Import Leads via CSV Modal */}
      <ImportLeadsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportLeads={handleImportLeads}
        assignedAgentName={currentUserProfile.name}
      />

      {/* IndiaMART & Webhook Live Gateway Modal */}
      <IndiaMartSyncModal
        isOpen={isIndiaMartModalOpen}
        onClose={() => setIsIndiaMartModalOpen(false)}
        onImportLeads={handleImportLeads}
      />

      {/* Add Team Member Modal */}
      <AddTeamMemberModal
        isOpen={isAddTeamModalOpen}
        onClose={() => setIsAddTeamModalOpen(false)}
        onAddMember={handleAddTeamMember}
      />

      {/* User Profile & Account Settings Modal */}
      <UserProfileModal
        isOpen={isUserProfileModalOpen}
        onClose={() => setIsUserProfileModalOpen(false)}
        profile={currentUserProfile}
        onUpdateProfile={handleUpdateProfile}
        onLogout={handleLogout}
        currentRole={currentRole}
        onToggleRole={handleToggleRole}
      />

      {/* Customize Logo & Branding Modal */}
      <BrandingModal
        isOpen={isBrandingModalOpen}
        onClose={() => setIsBrandingModalOpen(false)}
        branding={branding}
        onSaveBranding={handleUpdateBranding}
      />

      {/* Export Leads to Excel / CSV Modal */}
      <ExportLeadsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        allLeads={leads}
        currentFilteredLeads={currentTab === 'leads' ? pipelineLeads : filteredLeads}
        initialChannelFilter={selectedChannel}
        initialDateRange={dateRangeFilter}
      />

      {/* Role-Based Access Control (RBAC) Permission Warning Modal */}
      <PermissionRestrictedModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        restrictedFeature={restrictedActionName}
        onSwitchToAdmin={handleToggleRole}
        currentRole={currentRole}
      />
    </div>
  );
}
