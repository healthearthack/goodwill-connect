/* ==========================================================================
   Howard (Agent Mail & Work Bestie) - Frontend Controller
   ========================================================================== */

import { howardAgent } from './howard-agent.js';

let activeThreadId = "thread_q4_audit";

document.addEventListener('DOMContentLoaded', () => {
  renderThreadList();
  renderActiveThread();
  renderCrmActions();
  setupEventListeners();
});

function renderThreadList() {
  const listEl = document.getElementById('thread-list');
  if (!listEl) return;

  const threads = howardAgent.getThreads();
  listEl.innerHTML = threads.map(t => {
    const lastMsg = t.messages[t.messages.length - 1];
    const isActive = t.id === activeThreadId;
    return `
      <div class="thread-item ${isActive ? 'active' : ''}" data-id="${t.id}">
        <div class="thread-top">
          <span>${t.date}</span>
          <span>${t.messages.length} letters</span>
        </div>
        <div class="thread-title">${escapeHtml(t.subject)}</div>
        <div class="thread-snippet">${escapeHtml(lastMsg ? lastMsg.body : '')}</div>
      </div>
    `;
  }).join('');

  // Add click handlers
  listEl.querySelectorAll('.thread-item').forEach(el => {
    el.addEventListener('click', () => {
      activeThreadId = el.getAttribute('data-id');
      renderThreadList();
      renderActiveThread();
    });
  });
}

function renderActiveThread() {
  const thread = howardAgent.getThread(activeThreadId);
  if (!thread) return;

  // Update Headers
  const subjectEl = document.getElementById('current-subject');
  const recipientEl = document.getElementById('current-recipient');
  const dateEl = document.getElementById('current-date');
  const bodyEl = document.getElementById('letter-body');

  if (subjectEl) subjectEl.textContent = thread.subject;
  if (recipientEl) recipientEl.textContent = thread.recipient;
  if (dateEl) dateEl.textContent = thread.date;

  if (bodyEl) {
    bodyEl.innerHTML = thread.messages.map(m => {
      const isHoward = m.sender.includes("Howard");
      return `
        <div class="message-block" style="margin-bottom: 2rem;">
          <div style="font-family: var(--font-typewriter); font-size: 0.8rem; color: var(--ink-faded); margin-bottom: 0.5rem;">
            <strong>${escapeHtml(m.sender)}</strong> · ${m.timestamp}
          </div>
          <div class="message-prose" style="${isHoward ? '' : 'background: #f8fafc; border-left: 3px solid #cbd5e1; padding: 1rem 1.25rem; border-radius: 6px;'}">
            ${formatMarkdown(m.body)}
          </div>
        </div>
      `;
    }).join('');
  }
}

function renderCrmActions() {
  const streamEl = document.getElementById('crm-action-stream');
  if (!streamEl) return;

  const actions = howardAgent.crmActions;
  streamEl.innerHTML = actions.map(a => `
    <div class="action-card">
      <div class="action-card-top">
        <span class="action-type">${escapeHtml(a.type)}</span>
        <span>${a.timestamp}</span>
      </div>
      <div class="action-detail">${escapeHtml(a.detail)}</div>
      <div class="action-target">Target: ${escapeHtml(a.target)}</div>
    </div>
  `).join('');
}

function setupEventListeners() {
  // Chip button autofill
  document.querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const prompt = btn.getAttribute('data-prompt');
      const textarea = document.getElementById('composer-text');
      if (textarea && prompt) {
        textarea.value = prompt;
        textarea.focus();
      }
    });
  });

  // Send letter handler
  const sendBtn = document.getElementById('btn-send-letter');
  if (sendBtn) {
    sendBtn.addEventListener('click', handleSendLetter);
  }

  // Top compose button
  const composeBtn = document.getElementById('btn-compose-top');
  if (composeBtn) {
    composeBtn.addEventListener('click', () => {
      const newSubject = prompt("Enter letter subject for Howard:", "New Marketing Campaign & Lead Review");
      if (newSubject) {
        const newThread = {
          id: "thread_" + Date.now(),
          subject: newSubject,
          recipient: "Howard (Your Work Bestie) <howard@hubspot.mail>",
          date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          messages: [
            {
              sender: "Howard Vance",
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              body: `Hey friend! I see you started a new dispatch on "${newSubject}". What are we tackling in HubSpot today?`
            }
          ],
          crmActions: []
        };
        howardAgent.threads.unshift(newThread);
        howardAgent.save();
        activeThreadId = newThread.id;
        renderThreadList();
        renderActiveThread();
      }
    });
  }
}

async function handleSendLetter() {
  const textarea = document.getElementById('composer-text');
  const sendBtn = document.getElementById('btn-send-letter');
  const thinkingEl = document.getElementById('agent-thinking');
  const stepLabel = document.getElementById('agent-step-label');

  if (!textarea || !textarea.value.trim()) return;

  const userText = textarea.value.trim();
  textarea.value = '';
  sendBtn.disabled = true;
  thinkingEl.style.display = 'flex';

  renderActiveThread();

  try {
    await howardAgent.dispatchUserLetter(
      activeThreadId,
      userText,
      (statusText) => {
        if (stepLabel) stepLabel.textContent = statusText;
      }
    );
  } catch (err) {
    console.error("Howard Dispatch Error:", err);
  } finally {
    thinkingEl.style.display = 'none';
    sendBtn.disabled = false;
    renderThreadList();
    renderActiveThread();
    renderCrmActions();
  }
}

function formatMarkdown(text) {
  let html = escapeHtml(text);
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Inline code
  html = html.replace(/`(.*?)`/g, '<code style="background:#f1f5f9; padding:2px 6px; border-radius:4px; font-family:var(--font-typewriter); font-size:0.85em;">$1</code>');
  
  // Blockquotes
  html = html.replace(/^&gt;\s?(.*?)$/gm, '<blockquote>$1</blockquote>');
  
  // Bullet points
  html = html.replace(/^• (.*?)$/gm, '<li style="margin-left: 1.25rem; margin-bottom: 0.35rem;">$1</li>');
  
  // Paragraphs
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
