/* ==========================================================================
   Goodwill Connect - Verifiable Certificate & LinkedIn Engine
   ========================================================================== */

export class CertificateEngine {
  /**
   * Generates a verifiable hash and certificate record
   */
  static generateCertificate(user, totalHours) {
    const certId = `GWI-2026-AI-${Math.floor(100000 + Math.random() * 900000)}`;
    const issueDate = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    const certData = {
      certId,
      recipientName: user.name,
      title: "Certified AI Tech Onramp & Community Service Fellow",
      organization: "Goodwill Industries International & Tech Partner Consortium",
      verifiedHours: totalHours || user.verifiedHours || 25,
      issueDate,
      verifier: "Goodwill National Accreditation Board",
      verificationUrl: `https://goodwillindustriesinternational.com.ai/verify/${certId}`
    };

    return certData;
  }

  /**
   * Generates a direct 1-click Add to LinkedIn Profile URL
   */
  static getLinkedInAddUrl(certData) {
    const params = new URLSearchParams({
      startTask: "CERTIFICATION_NAME",
      name: certData.title,
      organizationName: "Goodwill Industries International",
      issueYear: "2026",
      issueMonth: "8",
      certUrl: certData.verificationUrl,
      certId: certData.certId
    });

    return `https://www.linkedin.com/profile/add?${params.toString()}`;
  }

  /**
   * Renders the Certificate Modal HTML
   */
  static renderCertificateHTML(certData) {
    const linkedInUrl = this.getLinkedInAddUrl(certData);

    return `
      <div class="certificate-preview-box" id="printable-cert">
        <div class="cert-emblem">GW</div>
        <div class="cert-header-title">Goodwill Industries International</div>
        <h3 class="cert-main-title">Official Certificate of Verified Service</h3>
        
        <p class="cert-recipient-label">This institutional credential is proudly conferred upon</p>
        <div class="cert-recipient-name">${certData.recipientName}</div>
        
        <p class="cert-body-text">
          In recognition of completing <strong>${certData.verifiedHours} Verified Service Hours</strong> in software accessibility, ethical AI auditing, and community technology leadership across the Goodwill Tech Partner Network.
        </p>

        <div class="cert-meta-grid">
          <div class="cert-meta-item">
            <small>Credential ID</small>
            <span>${certData.certId}</span>
          </div>
          <div class="cert-meta-item">
            <small>Issue Date</small>
            <span>${certData.issueDate}</span>
          </div>
          <div class="cert-meta-item">
            <small>Verification Status</small>
            <span class="verified">● Digitally Verified</span>
          </div>
        </div>
      </div>

      <div style="margin-top: 1.5rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
        <div style="font-size: 0.75rem; color: var(--slate-500);">
          <strong style="color: var(--slate-700);">Official URL:</strong> ${certData.verificationUrl}
        </div>
        <div style="display: flex; gap: 0.75rem;">
          <button class="btn btn-outline btn-sm" onclick="window.print()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Print / PDF
          </button>
          <a href="${linkedInUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-emerald btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c.9 0 1.63-.73 1.63-1.63s-.73-1.63-1.63-1.63a1.63 1.63 0 0 0 0 3.26m1.4 10.24v-8.37H5.06v8.37h2.8z"/></svg>
            Add to LinkedIn Profile
          </a>
        </div>
      </div>
    `;
  }
}
