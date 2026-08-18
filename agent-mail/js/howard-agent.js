/* ==========================================================================
   Howard (Agent Mail & Work Bestie) - AI Reasoning & CRM Mutation Engine
   ========================================================================== */

export const INITIAL_THREADS = [
  {
    id: "thread_q4_audit",
    subject: "Audit Q4 Re-engagement Sequences & Silent Lead Scoring",
    recipient: "Howard (Your Work Bestie) <howard@hubspot.mail>",
    date: "August 18, 2026",
    messages: [
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
> *Subject: Quick idea for {{contact.company}}'s workforce CSR goals*  
> "Hey {{contact.firstname}}, noticed you led social impact at {{contact.company}}. We recently built an AI workforce onramp pilot with Goodwill that automated volunteer verification. Worth a 4-minute sync next Tuesday?"

> **Touch 2 (The Social Proof):**  
> *Subject: How Google onramped 250+ tech apprentices (Case Study)*  
> "Sharing our latest metric breakdown on verifiable volunteer hours. Let me know if you'd like the slide deck."

> **Touch 3 (The Clean Break):**  
> *Subject: Permission to close your file?*  
> "Assuming your team is locked for Q4. I'll take this off your radar unless you'd like to revisit in Q1."

I've already saved these drafts into our HubSpot Marketing Email templates. Take your time looking them over—no rush at all.

Yours in productivity,  
**Howard**`
      }
    ],
    crmActions: [
      {
        timestamp: "9:15 AM",
        type: "PROPERTY_UPDATE",
        detail: "Updated 'howard_lead_score' to 88 for 14 enterprise contacts",
        target: "HubSpot Contacts (Batch #48)"
      },
      {
        timestamp: "9:17 AM",
        type: "LIST_MUTATION",
        detail: "Created smart dynamic list 'Q4 High-Intent CSR Partners'",
        target: "HubSpot Marketing Lists"
      },
      {
        timestamp: "9:18 AM",
        type: "DEDUPLICATION",
        detail: "Merged duplicate company record 'Acme Industrial' (ID: 88192)",
        target: "HubSpot Companies"
      }
    ]
  },
  {
    id: "thread_watercooler",
    subject: "Watercooler Check-in: How's our pipeline looking?",
    recipient: "Howard (Your Work Bestie) <howard@hubspot.mail>",
    date: "August 17, 2026",
    messages: [
      {
        sender: "You",
        timestamp: "3:40 PM",
        body: "Howard, quick sanity check. How's our marketing pipeline holding up today? Be honest!"
      },
      {
        sender: "Howard Vance",
        timestamp: "3:45 PM",
        body: `Honestly? You're doing great. 

I just ran the numbers across our deal pipeline in HubSpot:
• 8 deals moved into **Proposal Stage** this week (that's +22% vs last month).
• Our average deal velocity decreased by 3.2 days because of our automated LinkedIn certificate verification.
• There's one bottleneck on the $45k Grant Track deal with Metro Health—their procurement team opened our email 6 times without replying. 

I quietly updated their deal health score to **Needs Nudge** in HubSpot and queued a friendly follow-up memo on the deal record so your sales rep knows exactly what to say.

Log off early if you can today—the pipeline is in good hands!

Best,  
**Howard**`
      }
    ],
    crmActions: [
      {
        timestamp: "3:42 PM",
        type: "DEAL_METRIC",
        detail: "Flagged Metro Health ($45k) deal stage as 'Needs Nudge'",
        target: "HubSpot Deals (ID: 99120)"
      },
      {
        timestamp: "3:44 PM",
        type: "TIMELINE_MEMO",
        detail: "Appended Private Procurement Nudge Note to deal timeline",
        target: "HubSpot Deal Activity"
      }
    ]
  }
];

export class HowardAgent {
  constructor() {
    this.threads = JSON.parse(localStorage.getItem('howard_agent_threads') || 'null') || INITIAL_THREADS;
    this.crmActions = JSON.parse(localStorage.getItem('howard_crm_actions') || 'null') || this.getAllSeedActions();
  }

  getAllSeedActions() {
    const actions = [];
    INITIAL_THREADS.forEach(t => {
      if (t.crmActions) actions.push(...t.crmActions);
    });
    return actions;
  }

  save() {
    localStorage.setItem('howard_agent_threads', JSON.stringify(this.threads));
    localStorage.setItem('howard_crm_actions', JSON.stringify(this.crmActions));
  }

  getThreads() {
    return this.threads;
  }

  getThread(id) {
    return this.threads.find(t => t.id === id) || this.threads[0];
  }

  async dispatchUserLetter(threadId, userText, onStepUpdate) {
    const thread = this.getThread(threadId);
    
    // Add user message
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    thread.messages.push({
      sender: "You",
      timestamp: timeStr,
      body: userText
    });
    this.save();

    // Step 1: Thinking
    onStepUpdate("Howard received your letter and is brewing a fresh espresso...", 1200);
    await new Promise(r => setTimeout(r, 1200));

    // Step 2: CRM Inspection & Mutation
    onStepUpdate("Howard is inspecting HubSpot Contact & Deal records in the background...", 1500);
    await new Promise(r => setTimeout(r, 1500));

    // Generate CRM actions
    const newAction = {
      timestamp: timeStr,
      type: "SILENT_AGENT_MUTATION",
      detail: `Howard executed background audit & enriched CRM properties based on dispatch: "${userText.substring(0, 38)}..."`,
      target: "HubSpot CRM Engine (Live)"
    };
    this.crmActions.unshift(newAction);
    if (!thread.crmActions) thread.crmActions = [];
    thread.crmActions.unshift(newAction);

    // Step 3: Drafting response
    onStepUpdate("Howard is putting fountain pen to paper and sealing your reply...", 1300);
    await new Promise(r => setTimeout(r, 1300));

    // Howard's dynamic reply
    const howardReply = this.generateHowardResponse(userText);
    thread.messages.push({
      sender: "Howard Vance",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      body: howardReply
    });

    this.save();
    return {
      thread,
      newAction,
      howardReply
    };
  }

  generateHowardResponse(prompt) {
    const lower = prompt.toLowerCase();

    if (lower.includes("subject") || lower.includes("line") || lower.includes("email")) {
      return `Hey there! I took a close look at our past open rates in HubSpot and brainstormed three distinct subject line angles for you:

1. **The Curiosity Hook:** *"A quick question regarding {{contact.company}}'s Q4 tech onramps"* (Targeting 58% open rate)
2. **The Peer Proof:** *"How 14 non-profit teams cut volunteer audit times in half"*
3. **The Executive Direct:** *"{{contact.firstname}}, 4 minutes for workforce training next week?"*

**Silent CRM Work Done:**
• Tagged all active leads with \`A/B_Subject_Test_Cohort_A\`.
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
}

export const howardAgent = new HowardAgent();
