/* ==========================================================================
   Goodwill Connect - State Store & Reactive Subscriptions
   ========================================================================== */

import { INITIAL_USER, INITIAL_OPPORTUNITIES } from './data.js';

const STORAGE_KEY_USER = 'goodwill_connect_user_v2';
const STORAGE_KEY_OPPS = 'goodwill_connect_opps_v2';
const STORAGE_KEY_AUDIT = 'goodwill_connect_audit_v2';

class StateStore {
  constructor() {
    this.subscribers = [];
    this.loadState();
  }

  loadState() {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      this.user = savedUser ? JSON.parse(savedUser) : INITIAL_USER;

      const savedOpps = localStorage.getItem(STORAGE_KEY_OPPS);
      this.opportunities = savedOpps ? JSON.parse(savedOpps) : INITIAL_OPPORTUNITIES;

      const savedAudit = localStorage.getItem(STORAGE_KEY_AUDIT);
      this.auditLogs = savedAudit ? JSON.parse(savedAudit) : [
        {
          id: "log_init_1",
          opportunityTitle: "Google Tech Entry Onramp: Open-Source AI Ethics",
          hours: 25,
          status: "VERIFIED",
          date: "2026-08-14",
          verifier: "Google Onramp Verification Office"
        }
      ];
    } catch (e) {
      console.warn("Using default state due to storage error:", e);
      this.user = INITIAL_USER;
      this.opportunities = INITIAL_OPPORTUNITIES;
      this.auditLogs = [];
    }

    this.filters = {
      category: 'ALL',
      searchQuery: '',
      partnerOnly: false,
      typeFilter: 'ALL' // 'ALL', 'GIVE_HOURS', 'NEED_HELP'
    };

    this.currentViewMode = 'VOLUNTEER'; // 'VOLUNTEER' or 'PARTNER'
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(this.user));
      localStorage.setItem(STORAGE_KEY_OPPS, JSON.stringify(this.opportunities));
      localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(this.auditLogs));
    } catch (e) {
      console.error("Failed to save state:", e);
    }
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(fn => fn !== callback);
    };
  }

  notify() {
    this.saveState();
    this.subscribers.forEach(cb => cb(this));
  }

  // Actions
  setSearchQuery(query) {
    this.filters.searchQuery = query.toLowerCase().trim();
    this.notify();
  }

  setCategory(category) {
    this.filters.category = category;
    this.notify();
  }

  setPartnerOnly(enabled) {
    this.filters.partnerOnly = enabled;
    this.notify();
  }

  setTypeFilter(type) {
    this.filters.typeFilter = type;
    this.notify();
  }

  setViewMode(mode) {
    this.currentViewMode = mode;
    this.notify();
  }

  claimOpportunity(opportunityId) {
    const opp = this.opportunities.find(o => o.id === opportunityId);
    if (!opp) return false;

    if (!this.user.claimedOpportunityIds.includes(opportunityId)) {
      this.user.claimedOpportunityIds.push(opportunityId);
      opp.volunteerCount += 1;
      
      // Log pending audit
      this.auditLogs.unshift({
        id: "log_" + Math.random().toString(36).substring(2, 9),
        opportunityTitle: opp.title,
        hours: opp.hoursOffered,
        status: "VERIFIED", // Automatically verify for responsive demo
        date: new Date().toISOString().split('T')[0],
        verifier: opp.posterName
      });

      this.user.verifiedHours += opp.hoursOffered;
      this.notify();
      return true;
    }
    return false;
  }

  addOpportunity(oppData) {
    const newOpp = {
      id: "opp_" + Math.random().toString(36).substring(2, 9),
      title: oppData.title,
      description: oppData.description,
      category: oppData.category || "COMMUNITY_HELP",
      type: oppData.type || "GIVE_HOURS",
      posterId: this.user.id,
      posterName: oppData.posterName || this.user.name,
      posterOrg: oppData.posterOrg || "Goodwill Community Contributor",
      avatarInitials: (oppData.posterName || this.user.name).split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
      location: oppData.location || "Remote / Hybrid",
      hoursOffered: parseInt(oppData.hoursOffered, 10) || 10,
      requiredSkills: oppData.skills ? oppData.skills.split(',').map(s => s.trim()).filter(Boolean) : ["Community Service"],
      isGooglePartnered: !!oppData.isGooglePartnered,
      isVerifiedPartner: true,
      status: "OPEN",
      volunteerCount: 1,
      postedDaysAgo: "Just now"
    };

    this.opportunities.unshift(newOpp);
    this.notify();
    return newOpp;
  }

  getFilteredOpportunities() {
    return this.opportunities.filter(opp => {
      // Category Match
      if (this.filters.category !== 'ALL' && opp.category !== this.filters.category) {
        return false;
      }

      // Type Filter Match
      if (this.filters.typeFilter !== 'ALL' && opp.type !== this.filters.typeFilter) {
        return false;
      }

      // Partner Only Match
      if (this.filters.partnerOnly && !opp.isGooglePartnered && !opp.isVerifiedPartner) {
        return false;
      }

      // Search Query Match
      if (this.filters.searchQuery) {
        const q = this.filters.searchQuery;
        const matchesTitle = opp.title.toLowerCase().includes(q);
        const matchesDesc = opp.description.toLowerCase().includes(q);
        const matchesOrg = opp.posterName.toLowerCase().includes(q) || opp.posterOrg.toLowerCase().includes(q);
        const matchesSkills = opp.requiredSkills.some(skill => skill.toLowerCase().includes(q));
        const matchesLocation = opp.location.toLowerCase().includes(q);

        if (!matchesTitle && !matchesDesc && !matchesOrg && !matchesSkills && !matchesLocation) {
          return false;
        }
      }

      return true;
    });
  }
}

export const store = new StateStore();
