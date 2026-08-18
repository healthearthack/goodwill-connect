/* ==========================================================================
   Goodwill Connect - Enterprise Data & Seed Datasets
   ========================================================================== */

export const INITIAL_USER = {
  id: "usr_gw_8921",
  name: "Jordan Hayes",
  email: "jordan.hayes@goodwillconnect.org",
  role: "VOLUNTEER", // or 'PARTNER'
  title: "Goodwill Tech Contributor & NHS Scholar",
  avatarInitials: "JH",
  verifiedHours: 25,
  pendingHours: 15,
  badges: [
    { id: "badge_1", name: "AI Ethics Auditor", tier: "Verified", icon: "✓", type: "emerald" },
    { id: "badge_2", name: "STEM Community Tutor", tier: "Gold", icon: "★", type: "purple" },
    { id: "badge_3", name: "Hardware Refurbisher", tier: "Active", icon: "⚙", type: "emerald" }
  ],
  claimedOpportunityIds: ["opp_seed_1"]
};

export const INITIAL_OPPORTUNITIES = [
  {
    id: "opp_seed_1",
    title: "Google Tech Entry Onramp: Open-Source AI Ethics & Web Accessibility",
    description: "Collaborate alongside senior Google tech mentors to audit open-source AI models for algorithmic bias and test web interface components for WCAG 2.1 AAA accessibility. Gain verifiable software engineering experience and institutional Goodwill career credentials directly applicable to your professional resume and LinkedIn profile.",
    category: "GOOGLE_TECH_ONRAMP",
    type: "GIVE_HOURS", // Volunteer opportunity
    posterId: "org_google_onramp",
    posterName: "Google Tech Onramp Partner",
    posterOrg: "Google Philanthropies & Goodwill National",
    avatarInitials: "GO",
    location: "Remote / Virtual Hub",
    hoursOffered: 40,
    requiredSkills: ["TypeScript", "AI Ethics", "WCAG 2.1", "Interface Testing"],
    isGooglePartnered: true,
    isVerifiedPartner: true,
    status: "OPEN",
    volunteerCount: 18,
    postedDaysAgo: "2d ago"
  },
  {
    id: "opp_seed_2",
    title: "High School NHS Peer Tutor: AP Calculus BC & SAT Math Prep",
    description: "Support underprivileged high school students preparing for AP Calculus and upcoming SAT math testing. Provide structured weekly 1-on-1 virtual problem-solving sessions. Ideal for National Honor Society (NHS) students and college undergraduates seeking certified community service hours for graduation and academic transcripts.",
    category: "STEM_TUTORING",
    type: "NEED_HELP", // Community request
    posterId: "org_community_austin",
    posterName: "Goodwill Youth & Education Center",
    posterOrg: "Goodwill Central Texas",
    avatarInitials: "ED",
    location: "Austin, TX / Online Zoom",
    hoursOffered: 15,
    requiredSkills: ["AP Calculus", "SAT Math", "Peer Mentoring", "Patience"],
    isGooglePartnered: false,
    isVerifiedPartner: true,
    status: "OPEN",
    volunteerCount: 6,
    postedDaysAgo: "3d ago"
  },
  {
    id: "opp_seed_3",
    title: "Goodwill E-Waste Hardware Refurbishing & Tech Recycling Drive",
    description: "Hands-on diagnostic testing, memory upgrades, SSD flashing, and lightweight Linux OS installations on donated corporate enterprise laptops. Refurbished hardware units are directly gifted to low-income families and digital literacy scholars.",
    category: "E_WASTE_RECYCLING",
    type: "GIVE_HOURS",
    posterId: "org_goodwill_hardware",
    posterName: "Goodwill Technology Refurb Hub",
    posterOrg: "Goodwill Industries International",
    avatarInitials: "HW",
    location: "San Francisco, CA / Regional Facilities",
    hoursOffered: 20,
    requiredSkills: ["Hardware Diagnostics", "Linux Deployment", "Device Provisioning"],
    isGooglePartnered: false,
    isVerifiedPartner: true,
    status: "OPEN",
    volunteerCount: 12,
    postedDaysAgo: "4d ago"
  },
  {
    id: "opp_seed_4",
    title: "Senior Citizen Digital Literacy & AI Safety Workshop Coach",
    description: "Lead small-group interactive sessions empowering senior citizens to master two-factor authentication, secure digital banking, scam detection, and generative AI voice cloning protection. Help bridge the generational digital divide with patience and clarity.",
    category: "COMMUNITY_HELP",
    type: "NEED_HELP",
    posterId: "org_senior_outreach",
    posterName: "Goodwill Community Outreach",
    posterOrg: "Goodwill Industries Community Services",
    avatarInitials: "SR",
    location: "Hybrid / Local Community Hubs",
    hoursOffered: 10,
    requiredSkills: ["Digital Literacy", "Cybersecurity Basics", "Empathy"],
    isGooglePartnered: false,
    isVerifiedPartner: true,
    status: "OPEN",
    volunteerCount: 9,
    postedDaysAgo: "1w ago"
  },
  {
    id: "opp_seed_5",
    title: "Microsoft Philanthropies: Cloud & AI Workforce Apprenticeship Prep",
    description: "Work with enterprise cloud architects to build automated data intake pipelines for local non-profit distribution networks. Mentorship includes Azure fundamentals and certified volunteer completion documentation for your LinkedIn credentials.",
    category: "GOOGLE_TECH_ONRAMP",
    type: "GIVE_HOURS",
    posterId: "org_msft_phil",
    posterName: "Microsoft Workforce Accelerator",
    posterOrg: "Microsoft & Goodwill Partner Network",
    avatarInitials: "MS",
    location: "Remote / Global",
    hoursOffered: 35,
    requiredSkills: ["Cloud Fundamentals", "Python Data Pipelines", "AI Workflows"],
    isGooglePartnered: true,
    isVerifiedPartner: true,
    status: "OPEN",
    volunteerCount: 24,
    postedDaysAgo: "Just now"
  }
];

export const LEADERBOARD_USERS = [
  { rank: 1, name: "Marcus Vance", badge: "Senior AI Mentor", hours: 145, initials: "MV" },
  { rank: 2, name: "Elena Rostova", badge: "NHS Lead Scholar", hours: 120, initials: "ER" },
  { rank: 3, name: "David K. Chen", badge: "Hardware Tech Lead", hours: 95, initials: "DC" },
  { rank: 4, name: "Sarah Jenkins", badge: "STEM Peer Coach", hours: 80, initials: "SJ" },
  { rank: 5, name: "Jordan Hayes (You)", badge: "Tech Contributor", hours: 25, initials: "JH" }
];
