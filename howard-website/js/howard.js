/* ==========================================================================
   Howard (Agent Mail) - Dedicated Product Demo Controller
   ========================================================================== */

const SEED_MESSAGES = [
  {
    sender: "You",
    timestamp: "9:14 AM",
    body: "Hey Howard! Our Q4 re-engagement campaign for uncontacted corporate leads feels sluggish. Could you quietly look through our recent contact list, score their engagement, and draft a clean 3-touch cadence that doesn't sound generic?"
  },
  {
    sender: "Howard Vance",
    timestamp: "9:19 AM",
    body: `Good morning! Grab a coffee—I just finished diving through our HubSpot contact records, and I've got good news and a couple of quick fixes.

First, I took the liberty of running a silent audit on all 48 uncontacted enterprise leads in the CRM:
• **Calculated Lead Scores:** Filtered out 12 dead-domain emails and scored the remaining 36. 14 of them are high-intent ICP matches with >80 score.
• **Silent Tagging:** Added the \`Q4_Priority_Re-engagement\` property directly onto their contact cards in HubSpot.
• **Deduplication:** Merged 2 duplicate company records for Acme Industrial.

Here is the 3-touch sequence I drafted for us. Feel free to tweak before we trigger the sequence:

> **Touch 1 (The Low-Pressure Check-in):**  
> *Subject: Quick idea for {{contact.company}}'s Q4 initiatives*  
> "Hey {{contact.firstname}}, noticed you led marketing operations at {{contact.company}}. We recently built a HubSpot asynchronous workflow onramp that cut lead response times in half. Worth a 4-minute sync next Tuesday?"

> **Touch 2 (The Social Proof):**  
> *Subject: How 24 B2B teams automated silent lead scoring (Case Study)*  
> "Sharing our latest metric breakdown on verified CRM enrichment. Let me know if you'd like the slide deck."

> **Touch 3 (The Clean Break):**  
> *Subject: Permission to close your file?*  
> "Assuming your team is locked for Q4. I'll take this off your radar unless you'd like to revisit in Q1."

I've already saved these drafts into our HubSpot Marketing Email templates. Take your time looking them over—no rush at all!

Yours in productivity,  
**Howard**`
  }
];

const SEED_CRM_ACTIONS = [
  {
    timestamp: "9:15 AM",
    type: "PROPERTY_UPDATE",
    detail: "Updated 'howard_lead_score' to 88 for 14 enterprise contacts",
    target: "HubSpot Contacts (Batch #48)"
  },
  {
    timestamp: "9:17 AM",
    type: "LIST_MUTATION",
    detail: "Created smart dynamic list 'Q4 High-Intent Partners'",
    target: "HubSpot Marketing Lists"
  },
  {
    timestamp: "9:18 AM",
    type: "DEDUPLICATION",
    detail: "Merged duplicate company record 'Acme Industrial' (ID: 88192)",
    target: "HubSpot Companies"
  }
];

let messages = [...SEED_MESSAGES];
let crmActions = [...SEED_CRM_ACTIONS];

document.addEventListener('DOMContentLoaded', () => {
  renderThread();
  renderCrmActions();
  setupEventListeners();
});

function renderThread() {
  const streamEl = document.getElementById('thread-stream');
  if (!streamEl) return;

  streamEl.innerHTML = messages.map(m => {
    const isHoward = m.sender.includes("Howard");
    return `
      <div class="message-item">
        <div class="message-meta">
          <strong>${escapeHtml(m.sender)}</strong> · ${m.timestamp}
        </div>
        <div class="message-prose" style="${isHoward ? '' : 'background: #f8fafc; border-left: 3px solid #cbd5e1; padding: 1rem 1.25rem; border-radius: 6px;'}">
          ${formatMarkdown(m.body)}
        </div>
      </div>
    `;
  }).join('');
}

function renderCrmActions() {
  const feedEl = document.getElementById('action-feed');
  if (!feedEl) return;

  feedEl.innerHTML = crmActions.map(a => `
    <div class="action-item">
      <div class="action-item-top">
        <span>${escapeHtml(a.type)}</span>
        <span>${a.timestamp}</span>
      </div>
      <div class="action-item-detail">${escapeHtml(a.detail)}</div>
      <div class="action-item-target">Target: ${escapeHtml(a.target)}</div>
    </div>
  `).join('');
}

function setupEventListeners() {
  // Track button autofill
  document.querySelectorAll('.track-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.track-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const prompt = btn.getAttribute('data-prompt');
      const textarea = document.getElementById('letter-input');
      if (textarea && prompt) {
        textarea.value = prompt;
        textarea.focus();
      }
    });
  });

  // Send letter button
  const sendBtn = document.getElementById('btn-send');
  if (sendBtn) {
    sendBtn.addEventListener('click', handleDispatchLetter);
  }
}

async function handleDispatchLetter() {
  const textarea = document.getElementById('letter-input');
  const sendBtn = document.getElementById('btn-send');
  const thinkingBar = document.getElementById('agent-thinking-bar');
  const statusText = document.getElementById('agent-status-text');

  if (!textarea || !textarea.value.trim()) return;

  const userText = textarea.value.trim();
  textarea.value = '';
  sendBtn.disabled = true;
  thinkingBar.style.display = 'flex';

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Add user message
  messages.push({
    sender: "You",
    timestamp: timeStr,
    body: userText
  });
  renderThread();

  // Step 1
  statusText.textContent = "Howard received your letter and is brewing espresso...";
  await new Promise(r => setTimeout(r, 1200));

  // Step 2
  statusText.textContent = "Howard is auditing HubSpot Contact & Deal records in background...";
  await new Promise(r => setTimeout(r, 1500));

  // Push new CRM Action
  const newAction = {
    timestamp: timeStr,
    type: "SILENT_AGENT_MUTATION",
    detail: `Howard executed background audit & enriched CRM properties for prompt: "${userText.substring(0, 36)}..."`,
    target: "HubSpot CRM Engine (Live)"
  };
  crmActions.unshift(newAction);
  renderCrmActions();

  // Step 3
  statusText.textContent = "Howard is putting fountain pen to paper and sealing your reply...";
  await new Promise(r => setTimeout(r, 1200));

  // Generate Howard response
  const reply = generateHowardReply(userText);
  messages.push({
    sender: "Howard Vance",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    body: reply
  });

  thinkingBar.style.display = 'none';
  sendBtn.disabled = false;
  renderThread();
}

function generateHowardReply(prompt) {
  const lower = prompt.toLowerCase();

  if (lower.includes("subject") || lower.includes("line") || lower.includes("email")) {
    return `Hey there! I took a close look at our past open rates in HubSpot and drafted three distinct subject line angles for you:

1. **The Curiosity Hook:** *"A quick question regarding {{contact.company}}'s Q4 pipeline"* (Targeting 58% open rate)
2. **The Peer Proof:** *"How 24 B2B teams cut manual CRM audit times in half"*
3. **The Executive Direct:** *"{{contact.firstname}}, 4 minutes for marketing automation next week?"*

**Silent CRM Work Done:**
• Tagged active enterprise leads with \`A/B_Subject_Test_Cohort_A\`.
• Updated email engagement tracking tokens in HubSpot.

Take a look whenever you have a break. No need to rush!

Warmly,  
**Howard**`;
  }

  if (lower.includes("lead") || lower.includes("audit") || lower.includes("score")) {
    return `Done and done! I just completed a thorough background scan across our latest HubSpot contact database.

**Here's what I discovered & executed:**
• Scored **64 newly added contacts** on our ICP fit matrix (21 high-intent, 32 warm nurture, 11 low-intent).
• Automatically appended private notes on the top 10 enterprise accounts with suggested conversation starters.
• Added a lead status flag \`Howard_Verified_Ready\` so your outbound team can filter in 1 click.

Grab a fresh drink—everything is synchronized and clean in the CRM.

Your productivity penpal,  
**Howard**`;
  }

  return `Thanks for writing! It's always great to hear from you.

I looked into what you mentioned and made sure everything is lined up in our HubSpot portal. I also updated our internal CRM tracking properties so we don't drop any context.

Remember to take a breather today—productivity is a marathon, not a sprint, and you're pacing our team wonderfully.

Let me know if you need me to draft anything else!

Cheers,  
**Howard**`;
}

function formatMarkdown(text) {
  let html = escapeHtml(text);
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/`(.*?)`/g, '<code style="background:#f1f5f9; padding:2px 6px; border-radius:4px; font-family:var(--font-mono); font-size:0.85em;">$1</code>');
  html = html.replace(/^&gt;\s?(.*?)$/gm, '<blockquote>$1</blockquote>');
  html = html.replace(/^• (.*?)$/gm, '<li style="margin-left: 1.25rem; margin-bottom: 0.35rem;">$1</li>');
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';
  return html;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
