/* ==========================================================================
   Goodwill Connect - Main Application Controller
   ========================================================================== */

import { store } from './state.js';
import { LEADERBOARD_USERS } from './data.js';
import { hubspotClient } from './hubspot.js';
import { CertificateEngine } from './certificate.js';

class AppController {
  constructor() {
    this.initDOM();
    this.bindEvents();
    this.render();

    // Subscribe to state store changes
    store.subscribe(() => this.render());
  }

  initDOM() {
    // Feed & Lists
    this.feedContainer = document.getElementById('opportunity-feed');
    this.leaderboardContainer = document.getElementById('leaderboard-list');
    this.resultsCountEl = document.getElementById('results-count');

    // Stats Elements
    this.userHoursEl = document.getElementById('user-verified-hours');
    this.userBadgesContainer = document.getElementById('user-badges-list');
    this.profileNameEl = document.getElementById('user-profile-name');
    this.profileRoleBadgeEl = document.getElementById('user-role-badge');
    this.impactTickerHours = document.getElementById('ticker-verified-hours');

    // Filter Controls
    this.searchInput = document.getElementById('search-opportunities');
    this.categoryTabs = document.querySelectorAll('.filter-tab');
    this.partnerOnlyCheckbox = document.getElementById('filter-partner-only');
    this.typeFilterRadios = document.querySelectorAll('input[name="type-filter"]');
    this.roleButtons = document.querySelectorAll('.role-btn');

    // Modals
    this.modalBackdrop = document.getElementById('modal-backdrop');
    this.modalContainer = document.getElementById('modal-container');
    this.modalTitle = document.getElementById('modal-title');
    this.modalBody = document.getElementById('modal-body');
    this.modalFooter = document.getElementById('modal-footer');
    this.modalCloseBtn = document.getElementById('modal-close-btn');

    // Quick Action Triggers
    this.btnPostOpp = document.getElementById('btn-post-opportunity');
    this.btnHeroPost = document.getElementById('btn-hero-post');
    this.btnHeroExplore = document.getElementById('btn-hero-explore');
    this.btnViewCertificate = document.getElementById('btn-view-certificate');
    this.btnPartnerIntake = document.getElementById('btn-open-partner-intake');
    this.btnHubSpotAppPreview = document.getElementById('btn-hubspot-app-preview');
    this.btnLogHoursQuick = document.getElementById('btn-log-hours-quick');

    // Toast Container
    this.toastContainer = document.getElementById('toast-container');
  }

  bindEvents() {
    // Search input
    this.searchInput?.addEventListener('input', (e) => {
      store.setSearchQuery(e.target.value);
    });

    // Category Tabs
    this.categoryTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.categoryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        store.setCategory(tab.dataset.category);
      });
    });

    // Partner Only Filter
    this.partnerOnlyCheckbox?.addEventListener('change', (e) => {
      store.setPartnerOnly(e.target.checked);
    });

    // Type Filter (All, Giving, Need)
    this.typeFilterRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        store.setTypeFilter(e.target.value);
      });
    });

    // Role Mode Switcher
    this.roleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.roleButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        store.setViewMode(btn.dataset.role);
        this.showToast(`Switched view to ${btn.dataset.role === 'VOLUNTEER' ? 'Volunteer / Contributor' : 'Enterprise Partner'} mode`);
      });
    });

    // Action Triggers
    this.btnPostOpp?.addEventListener('click', () => this.openPostOpportunityModal());
    this.btnHeroPost?.addEventListener('click', () => this.openPostOpportunityModal());
    this.btnViewCertificate?.addEventListener('click', () => this.openCertificateModal());
    this.btnPartnerIntake?.addEventListener('click', () => this.openHubSpotPartnerModal());
    this.btnHubSpotAppPreview?.addEventListener('click', () => this.openHubSpotAppModal());
    this.btnLogHoursQuick?.addEventListener('click', () => this.openLogHoursModal());

    this.btnHeroExplore?.addEventListener('click', () => {
      document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' });
    });

    // Modal close
    this.modalCloseBtn?.addEventListener('click', () => this.closeModal());
    this.modalBackdrop?.addEventListener('click', (e) => {
      if (e.target === this.modalBackdrop) this.closeModal();
    });

    // Global ESC to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });
  }

  render() {
    this.renderUserProfile();
    this.renderOpportunities();
    this.renderLeaderboard();
  }

  renderUserProfile() {
    const user = store.user;
    if (this.userHoursEl) this.userHoursEl.textContent = `${user.verifiedHours} hrs`;
    if (this.profileNameEl) this.profileNameEl.textContent = user.name;
    if (this.profileRoleBadgeEl) this.profileRoleBadgeEl.textContent = user.title;
    if (this.impactTickerHours) this.impactTickerHours.textContent = `${(14250 + user.verifiedHours).toLocaleString()} hrs`;

    if (this.userBadgesContainer) {
      this.userBadgesContainer.innerHTML = user.badges.map(b => `
        <div class="badge-item">
          <div class="badge-icon ${b.type}">${b.icon}</div>
          <span>${b.name}</span>
        </div>
      `).join('');
    }
  }

  renderOpportunities() {
    const opps = store.getFilteredOpportunities();
    if (this.resultsCountEl) {
      this.resultsCountEl.textContent = `Showing ${opps.length} verified ${opps.length === 1 ? 'opportunity' : 'opportunities'}`;
    }

    if (!this.feedContainer) return;

    if (opps.length === 0) {
      this.feedContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem 1.5rem; background: #ffffff; border-radius: var(--radius-lg); border: 1px solid var(--slate-200);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔍</div>
          <h4 style="font-size: 1.125rem; font-weight: 700; color: var(--slate-900);">No matching opportunities found</h4>
          <p style="color: var(--slate-500); font-size: 0.875rem; margin-top: 0.25rem;">Try adjusting your skill search keywords or clear your active category filters.</p>
          <button class="btn btn-outline btn-sm" style="margin-top: 1rem;" onclick="document.getElementById('search-opportunities').value=''; window.storeInstance.setSearchQuery('');">Clear Filters</button>
        </div>
      `;
      return;
    }

    this.feedContainer.innerHTML = opps.map(opp => {
      const isClaimed = store.user.claimedOpportunityIds.includes(opp.id);
      const isNeedHelp = opp.type === 'NEED_HELP';

      return `
        <article class="opportunity-card" data-id="${opp.id}">
          <div class="card-top-row">
            <div class="org-identity-group">
              <div class="org-avatar-badge">${opp.avatarInitials || 'GW'}</div>
              <div class="org-info">
                <div class="org-name-row">
                  <span>${opp.posterOrg || opp.posterName}</span>
                  ${opp.isVerifiedPartner ? `
                    <span class="verified-emerald-badge">
                      <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                      Verified Partner
                    </span>
                  ` : ''}
                </div>
                <div class="org-meta-line">
                  ${isNeedHelp ? 'Community Need' : 'Career Tech Onramp'} • ${opp.location} • ${opp.postedDaysAgo || 'Recent'}
                </div>
              </div>
            </div>
            <div class="card-hours-pill">
              ${opp.hoursOffered} Verified Hours
            </div>
          </div>

          <h3 class="card-title">${opp.title}</h3>
          <p class="card-description">${opp.description}</p>

          <div class="skills-pill-group">
            ${opp.requiredSkills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
          </div>

          <div class="card-footer-row">
            <div class="applicants-count">
              <div class="applicants-avatars">
                <div class="avatar-mini" style="background: #6366f1;"></div>
                <div class="avatar-mini" style="background: #10b981;"></div>
                <div class="avatar-mini" style="background: #4338ca;"></div>
              </div>
              <span>${opp.volunteerCount} participants enrolled</span>
            </div>

            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-outline btn-sm btn-view-detail" data-id="${opp.id}">
                View Syllabus
              </button>
              ${isClaimed ? `
                <button class="btn btn-emerald btn-sm" disabled style="opacity: 0.9; cursor: default;">
                  ✓ Hours Claimed
                </button>
              ` : `
                <button class="btn btn-primary btn-sm btn-claim-hours" data-id="${opp.id}">
                  Enroll & Log Hours →
                </button>
              `}
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach dynamic click listeners for buttons inside cards
    this.feedContainer.querySelectorAll('.btn-claim-hours').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const oppId = e.currentTarget.dataset.id;
        this.handleClaimHours(oppId);
      });
    });

    this.feedContainer.querySelectorAll('.btn-view-detail').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const oppId = e.currentTarget.dataset.id;
        this.openOpportunityDetailModal(oppId);
      });
    });
  }

  renderLeaderboard() {
    if (!this.leaderboardContainer) return;
    this.leaderboardContainer.innerHTML = LEADERBOARD_USERS.map(u => `
      <div class="leaderboard-item">
        <div class="leaderboard-left">
          <span class="rank-number top-${u.rank}">#${u.rank}</span>
          <div class="leaderboard-avatar">${u.initials}</div>
          <div class="leaderboard-meta">
            <span class="leaderboard-name">${u.name}</span>
            <span class="leaderboard-badge-tag">${u.badge}</span>
          </div>
        </div>
        <span class="leaderboard-hours">${u.hours} hrs</span>
      </div>
    `).join('');
  }

  handleClaimHours(opportunityId) {
    const opp = store.opportunities.find(o => o.id === opportunityId);
    if (!opp) return;

    const success = store.claimOpportunity(opportunityId);
    if (success) {
      this.showToast(`Enrolled in "${opp.title}"! +${opp.hoursOffered} verified hours added to your credential profile.`, 'toast-emerald');
    }
  }

  openOpportunityDetailModal(opportunityId) {
    const opp = store.opportunities.find(o => o.id === opportunityId);
    if (!opp) return;

    const isClaimed = store.user.claimedOpportunityIds.includes(opp.id);

    this.modalTitle.textContent = opp.title;
    this.modalBody.innerHTML = `
      <div style="margin-bottom: 1.25rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
          <span class="verified-emerald-badge">Verified Goodwill Consortium Program</span>
          <span style="font-size: 0.8125rem; color: var(--slate-500);">${opp.location}</span>
        </div>
        <p style="font-size: 0.9375rem; color: var(--slate-700); line-height: 1.6;">${opp.description}</p>
      </div>

      <div style="background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.25rem;">
        <h4 style="font-size: 0.8125rem; font-weight: 700; color: var(--slate-800); text-transform: uppercase; margin-bottom: 0.5rem;">Credential Verification Breakdown</h4>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; font-size: 0.8125rem;">
          <div><strong style="color: var(--slate-900);">Total Grant:</strong> ${opp.hoursOffered} Verified Service Hours</div>
          <div><strong style="color: var(--slate-900);">Host Org:</strong> ${opp.posterOrg || opp.posterName}</div>
          <div><strong style="color: var(--slate-900);">Curriculum:</strong> AI Ethics, WCAG & Software</div>
          <div><strong style="color: var(--slate-900);">Transcript Format:</strong> LinkedIn Digital Certificate</div>
        </div>
      </div>

      <div>
        <h4 style="font-size: 0.8125rem; font-weight: 700; color: var(--slate-800); margin-bottom: 0.5rem;">Target Skills & Competencies</h4>
        <div class="skills-pill-group">
          ${opp.requiredSkills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
        </div>
      </div>
    `;

    this.modalFooter.innerHTML = `
      <button class="btn btn-outline btn-sm" id="modal-cancel-btn">Close</button>
      ${isClaimed ? `
        <button class="btn btn-emerald btn-sm" disabled>✓ Already Claimed</button>
      ` : `
        <button class="btn btn-primary btn-sm" id="modal-claim-direct-btn">Enroll & Log ${opp.hoursOffered} Hours</button>
      `}
    `;

    document.getElementById('modal-cancel-btn')?.addEventListener('click', () => this.closeModal());
    document.getElementById('modal-claim-direct-btn')?.addEventListener('click', () => {
      this.handleClaimHours(opportunityId);
      this.closeModal();
    });

    this.openModal();
  }

  openPostOpportunityModal() {
    this.modalTitle.textContent = "Post a Volunteer Opportunity or Community Need";
    this.modalBody.innerHTML = `
      <form id="post-opp-form">
        <div class="form-group">
          <label class="form-label">Opportunity / Project Title</label>
          <input type="text" class="form-control" id="form-opp-title" placeholder="e.g. AI Accessibility Auditor & Web Mentor" required />
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">Category Track</label>
            <select class="form-control" id="form-opp-category">
              <option value="GOOGLE_TECH_ONRAMP">Google Tech Onramp / AI Ethics</option>
              <option value="STEM_TUTORING">STEM & NHS Peer Tutoring</option>
              <option value="E_WASTE_RECYCLING">E-Waste & Hardware Refurbishing</option>
              <option value="COMMUNITY_HELP">Digital Literacy & Senior Coaching</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Opportunity Type</label>
            <select class="form-control" id="form-opp-type">
              <option value="GIVE_HOURS">Volunteer Opportunity (Give Hours)</option>
              <option value="NEED_HELP">Community Need Request (Need Help)</option>
            </select>
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">Verified Hours Offered</label>
            <input type="number" class="form-control" id="form-opp-hours" value="15" min="1" max="100" required />
          </div>
          <div class="form-group">
            <label class="form-label">Location / Format</label>
            <input type="text" class="form-control" id="form-opp-location" placeholder="e.g. Remote / Online Zoom or City, State" required />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Description & Service Scope</label>
          <textarea class="form-control" id="form-opp-desc" rows="3" placeholder="Describe the responsibilities, schedule, and learning outcomes..." required></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Required Skills (Comma separated)</label>
          <input type="text" class="form-control" id="form-opp-skills" placeholder="e.g. Python, AI Ethics, Tutoring, Empathy" />
        </div>
      </form>
    `;

    this.modalFooter.innerHTML = `
      <button class="btn btn-outline btn-sm" id="form-cancel-btn">Cancel</button>
      <button class="btn btn-primary btn-sm" id="form-submit-opp-btn">Publish to Network</button>
    `;

    document.getElementById('form-cancel-btn')?.addEventListener('click', () => this.closeModal());
    document.getElementById('form-submit-opp-btn')?.addEventListener('click', () => {
      const title = document.getElementById('form-opp-title')?.value;
      const desc = document.getElementById('form-opp-desc')?.value;
      const category = document.getElementById('form-opp-category')?.value;
      const type = document.getElementById('form-opp-type')?.value;
      const hours = document.getElementById('form-opp-hours')?.value;
      const location = document.getElementById('form-opp-location')?.value;
      const skills = document.getElementById('form-opp-skills')?.value;

      if (!title || !desc) {
        this.showToast("Please fill in both the title and description.", "toast-error");
        return;
      }

      store.addOpportunity({
        title,
        description: desc,
        category,
        type,
        hoursOffered: hours,
        location,
        skills
      });

      this.closeModal();
      this.showToast(`Opportunity "${title}" published to network!`, 'toast-emerald');
    });

    this.openModal();
  }

  openLogHoursModal() {
    this.modalTitle.textContent = "Direct Service Hour Audit Submission";
    this.modalBody.innerHTML = `
      <form id="log-hours-direct-form">
        <div class="form-group">
          <label class="form-label">Program or Activity Name</label>
          <input type="text" class="form-control" id="log-prog-name" placeholder="e.g. Open-Source AI Ethics Audit Workshop" required />
        </div>
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">Hours Completed</label>
            <input type="number" class="form-control" id="log-hours-num" value="10" min="1" max="100" required />
          </div>
          <div class="form-group">
            <label class="form-label">Supervisor / Mentor Email</label>
            <input type="email" class="form-control" id="log-mentor-email" placeholder="mentor@partner.org" required />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Summary of Contributions</label>
          <textarea class="form-control" id="log-notes" rows="3" placeholder="Briefly describe what you built, audited, or taught..."></textarea>
        </div>
      </form>
    `;

    this.modalFooter.innerHTML = `
      <button class="btn btn-outline btn-sm" id="log-cancel-btn">Cancel</button>
      <button class="btn btn-emerald btn-sm" id="log-submit-btn">Submit for Verification</button>
    `;

    document.getElementById('log-cancel-btn')?.addEventListener('click', () => this.closeModal());
    document.getElementById('log-submit-btn')?.addEventListener('click', () => {
      const name = document.getElementById('log-prog-name')?.value;
      const hours = parseInt(document.getElementById('log-hours-num')?.value, 10) || 10;

      if (!name) {
        this.showToast("Please provide the activity name.", "toast-error");
        return;
      }

      store.user.verifiedHours += hours;
      store.auditLogs.unshift({
        id: "log_" + Math.random().toString(36).substring(2, 9),
        opportunityTitle: name,
        hours: hours,
        status: "VERIFIED",
        date: new Date().toISOString().split('T')[0],
        verifier: "Goodwill Automated Verification Service"
      });
      store.notify();

      this.closeModal();
      this.showToast(`Logged +${hours} hours to your transcript!`, 'toast-emerald');
    });

    this.openModal();
  }

  openCertificateModal() {
    const certData = CertificateEngine.generateCertificate(store.user, store.user.verifiedHours);

    this.modalTitle.textContent = "Verifiable Goodwill Digital Credential";
    this.modalBody.innerHTML = CertificateEngine.renderCertificateHTML(certData);
    this.modalFooter.innerHTML = `
      <button class="btn btn-outline btn-sm" id="cert-close-btn">Close</button>
    `;

    document.getElementById('cert-close-btn')?.addEventListener('click', () => this.closeModal());
    this.openModal();
  }

  openHubSpotPartnerModal() {
    this.modalTitle.textContent = "Enterprise Partner & Corporate Sponsorship Intake";
    this.modalBody.innerHTML = `
      <div style="background: var(--brand-purple-50); border: 1px solid var(--brand-purple-100); border-radius: var(--radius-md); padding: 0.875rem; margin-bottom: 1.25rem;">
        <p style="font-size: 0.8125rem; color: var(--brand-purple-900); line-height: 1.5;">
          <strong>Direct HubSpot CRM Integration:</strong> Connect your company's workforce training grants or volunteer mentoring teams directly with Goodwill Industries International.
        </p>
      </div>

      <form id="hubspot-lead-form">
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">First Name</label>
            <input type="text" class="form-control" id="hub-first-name" placeholder="Jane" required />
          </div>
          <div class="form-group">
            <label class="form-label">Last Name</label>
            <input type="text" class="form-control" id="hub-last-name" placeholder="Doe" required />
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">Work Email</label>
            <input type="email" class="form-control" id="hub-email" placeholder="jane@enterprise.com" required />
          </div>
          <div class="form-group">
            <label class="form-label">Company / Organization</label>
            <input type="text" class="form-control" id="hub-company" placeholder="e.g. Google, Microsoft, Regional Org" required />
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">Partnership Track</label>
            <select class="form-control" id="hub-track">
              <option value="Google Tech Onramp">Google Tech Onramp & AI Mentorship</option>
              <option value="Hardware E-Waste Refurbishing">Corporate E-Waste & Laptop Grants</option>
              <option value="STEM Tutoring Hub">STEM & Academic Youth Sponsorship</option>
              <option value="National Grant">National Corporate Philanthropy Grant</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Sponsorship Tier</label>
            <select class="form-control" id="hub-tier">
              <option value="Strategic Partner ($50,000+)">Strategic Partner ($50,000+)</option>
              <option value="Corporate Sponsor ($25,000)">Corporate Sponsor ($25,000)</option>
              <option value="Community Mentor Group">Employee Volunteer Mentorship</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Project Objectives / Notes</label>
          <textarea class="form-control" id="hub-notes" rows="2" placeholder="Tell us about your organization's workforce development goals..."></textarea>
        </div>
      </form>
    `;

    this.modalFooter.innerHTML = `
      <button class="btn btn-outline btn-sm" id="hub-cancel-btn">Cancel</button>
      <button class="btn btn-primary btn-sm" id="hub-submit-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
        Submit to HubSpot CRM
      </button>
    `;

    document.getElementById('hub-cancel-btn')?.addEventListener('click', () => this.closeModal());
    document.getElementById('hub-submit-btn')?.addEventListener('click', async () => {
      const firstName = document.getElementById('hub-first-name')?.value;
      const lastName = document.getElementById('hub-last-name')?.value;
      const email = document.getElementById('hub-email')?.value;
      const company = document.getElementById('hub-company')?.value;
      const partnerTrack = document.getElementById('hub-track')?.value;
      const sponsorshipTier = document.getElementById('hub-tier')?.value;
      const notes = document.getElementById('hub-notes')?.value;

      if (!email || !company) {
        this.showToast("Please provide your email and company name.", "toast-error");
        return;
      }

      const submitBtn = document.getElementById('hub-submit-btn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Syncing with HubSpot CRM...";
      }

      const response = await hubspotClient.submitPartnerIntake({
        firstName,
        lastName,
        email,
        company,
        partnerTrack,
        sponsorshipTier,
        notes
      });

      this.closeModal();
      this.showToast(response.message, 'toast-emerald');
    });

    this.openModal();
  }

  openHubSpotAppModal() {
    this.modalTitle.textContent = "Goodwill Connect for HubSpot (App Marketplace)";
    this.modalBody.innerHTML = `
      <div style="margin-bottom: 1.25rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div class="hubspot-dot-sprocket">⚙</div>
            <strong style="color: #33475b; font-size: 0.9375rem;">HubSpot Certified App Integration</strong>
          </div>
          <span class="verified-emerald-badge">OAuth 2.0 Ready</span>
        </div>
        <p style="font-size: 0.875rem; color: var(--slate-600); line-height: 1.6;">
          Install <strong>Goodwill Connect</strong> directly into your company's HubSpot portal to automatically sync employee volunteering, AI mentorship hours, and CSR impact reporting into your CRM contact records.
        </p>
      </div>

      <!-- Live CRM Card Preview -->
      <div class="hubspot-crm-mockup">
        <div class="hubspot-mock-header">
          <div class="hubspot-logo-icon">
            <span class="hubspot-dot-sprocket">⚙</span>
            <span>HubSpot CRM Contact Record Preview</span>
          </div>
          <span style="font-size: 0.6875rem; background: #eaf0f6; color: #516f90; padding: 2px 6px; border-radius: 4px; font-weight: 600;">Custom UI Extension</span>
        </div>

        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.875rem;">
          <div style="width: 38px; height: 38px; border-radius: 50%; background: #4338ca; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.875rem;">SL</div>
          <div>
            <div style="font-weight: 700; color: #33475b; font-size: 0.875rem;">Sarah Lin (Senior Cloud Architect)</div>
            <div style="font-size: 0.75rem; color: #7c98b6;">sarah.lin@enterprise.com • Google Tech Onramp Mentor</div>
          </div>
        </div>

        <div class="crm-card-preview-box">
          <div style="font-size: 0.75rem; font-weight: 700; color: #047857; text-transform: uppercase; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.25rem;">
            <span>✓ Goodwill Verified Volunteer Card</span>
          </div>
          <div class="crm-prop-row">
            <span class="crm-prop-label">Total Verified Hours:</span>
            <span class="crm-prop-val" style="color: #047857;">40.0 Hours</span>
          </div>
          <div class="crm-prop-row">
            <span class="crm-prop-label">Active Cohort:</span>
            <span class="crm-prop-val">Google AI Ethics & Accessibility</span>
          </div>
          <div class="crm-prop-row">
            <span class="crm-prop-label">Corporate ESG Category:</span>
            <span class="crm-prop-val">Workforce Diversity & Inclusion</span>
          </div>
          <div class="crm-prop-row">
            <span class="crm-prop-label">Digital Credential ID:</span>
            <span class="crm-prop-val" style="font-family: monospace;">GWI-2026-AI-883921</span>
          </div>
        </div>

        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-sm" style="background: #eaf0f6; color: #33475b; font-size: 0.75rem; font-weight: 600;" onclick="alert('Viewing Sarah Lin verified Goodwill transcript in HubSpot.')">
            View Live Transcript
          </button>
          <button class="btn btn-sm" style="background: #eaf0f6; color: #33475b; font-size: 0.75rem; font-weight: 600;" onclick="alert('Exported CSR report formatted for annual ESG audit.')">
            Export ESG Tax Audit
          </button>
        </div>
      </div>
    `;

    this.modalFooter.innerHTML = `
      <button class="btn btn-outline btn-sm" id="hub-app-close-btn">Close</button>
      <button class="btn btn-hubspot btn-sm" id="hub-install-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
        Connect to HubSpot Portal
      </button>
    `;

    document.getElementById('hub-app-close-btn')?.addEventListener('click', () => this.closeModal());
    document.getElementById('hub-install-btn')?.addEventListener('click', () => {
      this.closeModal();
      this.showToast("Connected to HubSpot Portal! Contact sync and CRM cards enabled.", "toast-hubspot");
    });

    this.openModal();
  }

  openModal() {
    this.modalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.modalBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  showToast(message, variant = '') {
    const toast = document.createElement('div');
    toast.className = `toast ${variant}`;
    toast.innerHTML = `
      <span>${message}</span>
    `;

    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.appInstance = new AppController();
  window.storeInstance = store;
});
