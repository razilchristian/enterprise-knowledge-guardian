import type {
  Document, Conflict, Agent, Workflow, ActivityEvent,
  KnowledgeNode, KnowledgeEdge, Notification, Integration,
  User, MetricData, IntelligenceEvent, SecurityFeature, ComplianceBadge,
  AgentNode, Persona, Role, AccessPrinciple,
} from "@/types";

// ── Personas ──
// One platform, one knowledge base. The role only decides what surfaces
// first and who signs off on a change — never what a person is allowed to read.
export const personas: Persona[] = [
  {
    role: "Employee",
    covers: "Support staff, associates, engineers, new hires",
    intent: "Get a straight answer about a policy, and know when there isn't one.",
    approvalScope: "none",
    landing: "/workspace",
    icon: "user",
  },
  {
    role: "Department Owner",
    covers: "HR lead, General Counsel, Engineering lead, Security lead",
    intent: "Keep the documents I own consistent, and resolve what gets flagged.",
    approvalScope: "department",
    landing: "/conflicts",
    icon: "user-cog",
  },
  {
    role: "Director",
    covers: "CEO, Director, VP",
    intent: "See where the organization disagrees with itself, and sign off on fixes.",
    approvalScope: "organization",
    landing: "/dashboard",
    icon: "crown",
  },
];

// Demo identities for the role switcher. Every one of them can read all 20
// documents below — they differ only in lens and approval rights.
export const demoUsers: Record<Role, User> = {
  Employee: {
    id: "u-3",
    name: "Dev Anand",
    email: "dev.anand@acmecorp.com",
    avatar: "/avatar.png",
    role: "Employee",
    title: "Associate Engineer",
    department: "Engineering",
  },
  "Department Owner": {
    id: "u-2",
    name: "Sarah Chen",
    email: "sarah.chen@acmecorp.com",
    avatar: "/avatar.png",
    role: "Department Owner",
    title: "Head of Human Resources",
    department: "Human Resources",
  },
  Director: {
    id: "u-1",
    name: "Alex Morgan",
    email: "alex.morgan@acmecorp.com",
    avatar: "/avatar.png",
    role: "Director",
    title: "Chief Executive Officer",
    department: "Operations",
  },
};

// ── Current User ──
export const currentUser: User = demoUsers.Employee;

// ── Documents ──
export const documents: Document[] = [
  { id: "doc-1", name: "Employee Handbook v3.2", type: "PDF", owner: "Sarah Chen", department: "Human Resources", lastUpdated: new Date(Date.now() - 3600000 * 2), status: "Conflict Detected", risk: "High", version: "3.2", size: "2.4 MB", pages: 94, aiConfidence: 96, summary: "Comprehensive employee guidelines covering onboarding, benefits, leave, conduct, and termination. Guardian detected a conflicting casual-leave entitlement across three HR sources.", keyFindings: ["Casual leave entitlement conflicts with HR Policy §4.2 and Manager Guide §3.1", "Outdated reference to 2023 benefits package", "Missing GDPR data handling addendum"], entities: ["GDPR", "Casual Leave", "OSHA", "FMLA"], referencedPolicies: ["HR Leave Policy", "Manager Guide", "Benefits Guide"] },
  { id: "doc-2", name: "HR Leave Policy", type: "DOCX", owner: "Sarah Chen", department: "Human Resources", lastUpdated: new Date(Date.now() - 3600000 * 5), status: "Analyzed", risk: "High", version: "2.1", size: "840 KB", pages: 18, aiConfidence: 94, summary: "Defines leave eligibility, casual leave entitlement, and manager approval requirements." },
  { id: "doc-3", name: "Security Incident Response Playbook", type: "PDF", owner: "James Rivera", department: "Security", lastUpdated: new Date(Date.now() - 86400000 * 330), status: "Outdated", risk: "Critical", version: "1.8", size: "3.1 MB", pages: 67 },
  { id: "doc-4", name: "Vendor Master Agreement", type: "PDF", owner: "Michael Torres", department: "Legal", lastUpdated: new Date(Date.now() - 86400000 * 3), status: "Analyzed", risk: "Medium", version: "4.0", size: "1.9 MB", pages: 42 },
  { id: "doc-5", name: "API Architecture Guidelines", type: "MD", owner: "Priya Patel", department: "Engineering", lastUpdated: new Date(Date.now() - 3600000 * 12), status: "Analyzed", risk: "Low", version: "2.3", size: "320 KB", pages: 28 },
  { id: "doc-6", name: "Engineering Standards & Best Practices", type: "PDF", owner: "Priya Patel", department: "Engineering", lastUpdated: new Date(Date.now() - 86400000 * 14), status: "Needs Review", risk: "Medium", version: "3.1", size: "1.2 MB", pages: 55 },
  { id: "doc-7", name: "Data Processing Agreement", type: "PDF", owner: "Michael Torres", department: "Legal", lastUpdated: new Date(Date.now() - 86400000 * 7), status: "Analyzed", risk: "Low", version: "2.0", size: "950 KB", pages: 31 },
  { id: "doc-8", name: "Q3 2024 Financial Summary", type: "PPTX", owner: "Rachel Kim", department: "Finance", lastUpdated: new Date(Date.now() - 86400000 * 21), status: "Analyzed", risk: "Low", version: "1.0", size: "4.2 MB", pages: 24 },
  { id: "doc-9", name: "IT Procurement Policy", type: "PDF", owner: "James Rivera", department: "Operations", lastUpdated: new Date(Date.now() - 86400000 * 60), status: "Outdated", risk: "Medium", version: "1.4", size: "680 KB", pages: 19 },
  { id: "doc-10", name: "Non-Disclosure Agreement Template", type: "DOCX", owner: "Michael Torres", department: "Legal", lastUpdated: new Date(Date.now() - 86400000 * 2), status: "Analyzed", risk: "Low", version: "5.2", size: "210 KB", pages: 8 },
  { id: "doc-11", name: "SOC 2 Compliance Report", type: "PDF", owner: "James Rivera", department: "Security", lastUpdated: new Date(Date.now() - 86400000 * 45), status: "Needs Review", risk: "High", version: "2.0", size: "5.8 MB", pages: 112 },
  { id: "doc-12", name: "Employee Onboarding Checklist", type: "DOCX", owner: "Sarah Chen", department: "Human Resources", lastUpdated: new Date(Date.now() - 86400000 * 8), status: "Analyzed", risk: "Low", version: "3.0", size: "340 KB", pages: 12 },
  { id: "doc-13", name: "Cloud Infrastructure Runbook", type: "MD", owner: "Priya Patel", department: "Engineering", lastUpdated: new Date(Date.now() - 3600000 * 48), status: "Analyzed", risk: "Low", version: "4.1", size: "520 KB", pages: 34 },
  { id: "doc-14", name: "Annual Performance Review Framework", type: "PDF", owner: "Sarah Chen", department: "Human Resources", lastUpdated: new Date(Date.now() - 86400000 * 90), status: "Outdated", risk: "Medium", version: "2.1", size: "1.1 MB", pages: 27 },
  { id: "doc-15", name: "Vendor Risk Assessment Matrix", type: "PPTX", owner: "Michael Torres", department: "Legal", lastUpdated: new Date(Date.now() - 86400000 * 5), status: "Conflict Detected", risk: "High", version: "1.3", size: "2.8 MB", pages: 16 },
  { id: "doc-16", name: "Code of Conduct", type: "PDF", owner: "Sarah Chen", department: "Human Resources", lastUpdated: new Date(Date.now() - 86400000 * 120), status: "Needs Review", risk: "Medium", version: "2.0", size: "780 KB", pages: 22 },
  { id: "doc-17", name: "Disaster Recovery Plan", type: "PDF", owner: "James Rivera", department: "Security", lastUpdated: new Date(Date.now() - 86400000 * 200), status: "Outdated", risk: "Critical", version: "1.2", size: "2.3 MB", pages: 48 },
  { id: "doc-18", name: "Release Management Process", type: "MD", owner: "Priya Patel", department: "Engineering", lastUpdated: new Date(Date.now() - 86400000 * 3), status: "Analyzed", risk: "Low", version: "3.5", size: "280 KB", pages: 15 },
  { id: "doc-19", name: "Expense Reimbursement Policy", type: "DOCX", owner: "Rachel Kim", department: "Finance", lastUpdated: new Date(Date.now() - 86400000 * 30), status: "Analyzed", risk: "Low", version: "2.4", size: "190 KB", pages: 9 },
  { id: "doc-20", name: "Third-Party Software License Inventory", type: "TXT", owner: "Priya Patel", department: "Engineering", lastUpdated: new Date(Date.now() - 86400000 * 15), status: "Needs Review", risk: "Medium", version: "1.7", size: "45 KB", pages: 6 },
];

// ── Conflicts ──
export const conflicts: Conflict[] = [
  { id: "con-1", title: "Casual leave entitlement mismatch", description: "Three HR sources prescribe 10, 12, and 15 casual-leave days, creating a high-risk policy conflict.", severity: "High", status: "Open", documentA: { name: "Employee Handbook v3.2", section: "§7.3 — Casual Leave", content: "All full-time employees are entitled to ten (10) days of casual leave per calendar year, subject to manager approval and standard carry-forward rules." }, documentB: { name: "HR Leave Policy", section: "§4.2 — Casual Leave Entitlement", content: "Eligible employees receive twelve (12) days of casual leave annually. The Manager Guide currently references fifteen (15) days for the same employee group." }, departments: ["Human Resources"], detectedAt: new Date(Date.now() - 3600000 * 2), aiExplanation: "Guardian searched every HR source in the organization and found competing entitlements: 10 days in the Handbook, 12 days in the HR Leave Policy, and 15 days in the Manager Guide. Rather than choosing a source, it flags the uncertainty because employees could receive inconsistent benefits guidance. Every employee sees this same conflict, not a filtered version of it.", recommendedResolution: "Confirm the approved entitlement with Compensation & Benefits, then amend the two outdated sources. Route the final change through HR approval and notify affected managers.", semanticSimilarity: 68, changes: 3 },
  { id: "con-2", title: "Equipment return policy inconsistency", description: "Conflicting deadlines for returning company equipment upon termination.", severity: "High", status: "Open", documentA: { name: "Employee Handbook v3.2", section: "§12.4 — Termination Procedures", content: "All company property, including laptops, access badges, and peripherals, must be returned within five (5) business days of the last working day." }, documentB: { name: "IT Procurement Policy", section: "§8.1 — Asset Recovery", content: "Terminated employees must return all issued hardware and access credentials no later than their final day of employment. Failure to return equipment within 24 hours of termination will result in payroll deduction." }, departments: ["Human Resources", "Operations"], detectedAt: new Date(Date.now() - 3600000 * 8), aiExplanation: "The Handbook allows 5 business days for equipment return, while IT Policy demands return on the final day with a 24-hour penalty window. Employees receive contradictory instructions.", recommendedResolution: "Standardize to a 3-business-day return window and remove the payroll deduction clause pending legal review.", semanticSimilarity: 78, changes: 4 },
  { id: "con-3", title: "Vendor liability cap discrepancy", description: "Master agreement and risk matrix define different liability caps for vendor engagements.", severity: "High", status: "In Review", documentA: { name: "Vendor Master Agreement", section: "§14.2 — Liability Limitations", content: "The aggregate liability of the vendor shall not exceed two times (2x) the total contract value for the preceding twelve-month period." }, documentB: { name: "Vendor Risk Assessment Matrix", section: "Tier 1 Risk Controls", content: "Maximum vendor liability exposure must be capped at the total annual contract value (1x) for all Tier 1 vendors." }, departments: ["Legal"], detectedAt: new Date(Date.now() - 86400000 * 1), aiExplanation: "The Master Agreement sets a 2x liability cap while the Risk Assessment Matrix limits it to 1x for Tier 1 vendors. This could expose the company to underinsured vendor relationships.", recommendedResolution: "Legal should determine the appropriate cap and update both documents. Consider a tiered approach: 2x for critical services, 1x for standard.", semanticSimilarity: 85, changes: 2 },
  { id: "con-4", title: "Incident response timeline mismatch", description: "Security playbook and engineering standards define different incident response SLAs.", severity: "Medium", status: "Open", documentA: { name: "Security Incident Response Playbook", section: "§3.1 — Response Timeline", content: "Critical security incidents must be acknowledged within 15 minutes and initial response team assembled within 30 minutes." }, documentB: { name: "Engineering Standards & Best Practices", section: "§9.2 — Incident Management", content: "P0 incidents require acknowledgment within 30 minutes. The incident commander should be designated within 1 hour of initial report." }, departments: ["Security", "Engineering"], detectedAt: new Date(Date.now() - 86400000 * 3), aiExplanation: "Security expects 15-minute acknowledgment while Engineering allows 30 minutes. This dual standard could delay critical incident response.", recommendedResolution: "Adopt the 15-minute security standard across both documents and align the escalation timeline.", semanticSimilarity: 71, changes: 5 },
  { id: "con-5", title: "PTO accrual rate difference", description: "Employee handbook and onboarding checklist reference different PTO accrual rates.", severity: "Medium", status: "Open", documentA: { name: "Employee Handbook v3.2", section: "§7.3 — Paid Time Off", content: "Full-time employees accrue 15 days of PTO per year during their first three years of employment, increasing to 20 days after the third anniversary." }, documentB: { name: "Employee Onboarding Checklist", section: "Benefits Summary", content: "New hires receive 18 days of PTO annually, with increases based on tenure milestones outlined in the benefits guide." }, departments: ["Human Resources"], detectedAt: new Date(Date.now() - 86400000 * 5), aiExplanation: "The Handbook states 15 days for new hires while the Onboarding Checklist promises 18 days. New employees may receive incorrect information about their benefits.", recommendedResolution: "Verify the current PTO policy with Compensation & Benefits and update both documents to reflect the accurate accrual rate.", semanticSimilarity: 88, changes: 2 },
  { id: "con-6", title: "Code review requirement conflict", description: "Engineering standards and release process have different code review approval requirements.", severity: "Medium", status: "Resolved", documentA: { name: "Engineering Standards & Best Practices", section: "§4.1 — Code Review Policy", content: "All code changes require a minimum of two (2) peer reviews from senior engineers before merging to the main branch." }, documentB: { name: "Release Management Process", section: "§2.4 — Merge Requirements", content: "Pull requests require one (1) approved review from any team member with write access before merge." }, departments: ["Engineering"], detectedAt: new Date(Date.now() - 86400000 * 12), aiExplanation: "Engineering Standards require two senior reviews while Release Management allows one review from any contributor. This inconsistency could lead to insufficient code review.", recommendedResolution: "Update Release Management to require two reviews, with at least one from a senior engineer, matching the Engineering Standards.", semanticSimilarity: 82, changes: 3 },
  { id: "con-7", title: "Data retention period variance", description: "DPA and security playbook specify different data retention periods.", severity: "Medium", status: "Open", documentA: { name: "Data Processing Agreement", section: "§6.2 — Data Retention", content: "Personal data shall be retained for a maximum of thirty-six (36) months following the end of the service period, after which it must be securely deleted." }, documentB: { name: "Security Incident Response Playbook", section: "§11.1 — Log Retention", content: "All security logs, including those containing personal data, shall be retained for a minimum of sixty (60) months to support forensic investigation requirements." }, departments: ["Legal", "Security"], detectedAt: new Date(Date.now() - 86400000 * 7), aiExplanation: "The DPA limits personal data retention to 36 months while Security requires 60 months for logs. This could put the company in violation of GDPR data minimization principles.", recommendedResolution: "Implement separate retention schedules for security logs (anonymized) vs. personal data, ensuring GDPR compliance while maintaining security forensic capabilities.", semanticSimilarity: 65, changes: 4 },
  { id: "con-8", title: "Expense approval threshold discrepancy", description: "Financial policy and procurement policy define different approval thresholds.", severity: "Low", status: "Dismissed", documentA: { name: "Expense Reimbursement Policy", section: "§3.1 — Approval Levels", content: "Expenses exceeding $500 require manager approval. Expenses above $2,000 require VP-level authorization." }, documentB: { name: "IT Procurement Policy", section: "§4.3 — Purchase Authorization", content: "All IT purchases above $1,000 require manager and director dual approval. Purchases above $5,000 require CFO sign-off." }, departments: ["Finance", "Operations"], detectedAt: new Date(Date.now() - 86400000 * 20), aiExplanation: "Different approval thresholds across policies create ambiguity for IT-related expenses that could fall under either policy.", recommendedResolution: "Create a unified approval matrix that clearly delineates thresholds by expense category.", semanticSimilarity: 58, changes: 6 },
  { id: "con-9", title: "Performance review cycle mismatch", description: "Handbook references annual reviews but the framework is designed for bi-annual cycles.", severity: "Medium", status: "Open", documentA: { name: "Employee Handbook v3.2", section: "§8.1 — Performance Reviews", content: "Formal performance evaluations are conducted annually during Q4. Mid-year check-ins are encouraged but not mandatory." }, documentB: { name: "Annual Performance Review Framework", section: "§1.2 — Review Cadence", content: "The performance review cycle consists of two formal evaluation periods: mid-year (June-July) and end-of-year (November-December). Both reviews are mandatory." }, departments: ["Human Resources"], detectedAt: new Date(Date.now() - 86400000 * 10), aiExplanation: "The Handbook suggests annual reviews with optional mid-year check-ins, while the Framework mandates bi-annual mandatory reviews. Managers may not conduct the required mid-year evaluations.", recommendedResolution: "Update the Employee Handbook to reflect the bi-annual review cadence as described in the Performance Review Framework.", semanticSimilarity: 76, changes: 3 },
  { id: "con-10", title: "Software license compliance gap", description: "License inventory shows more seats than engineering standards permit for certain tools.", severity: "Low", status: "Open", documentA: { name: "Third-Party Software License Inventory", section: "License Allocation", content: "Figma Enterprise: 45 active seats. Maximum contractual allocation: 30 seats." }, documentB: { name: "Engineering Standards & Best Practices", section: "§11.3 — Approved Tools", content: "Design tools usage should not exceed departmental allocation of 30 seats as per current licensing agreement." }, departments: ["Engineering"], detectedAt: new Date(Date.now() - 86400000 * 2), aiExplanation: "The license inventory shows 15 seats over the contractual limit for Figma, potentially exposing the company to license compliance violations.", recommendedResolution: "Audit active Figma users, remove unused seats, and negotiate a license upgrade if demand exceeds 30 seats.", semanticSimilarity: 90, changes: 1 },
];

// ── Agents ──
export const agents: Agent[] = [
  { id: "agent-1", name: "Contract Review Agent", description: "Analyzes vendor contracts for risk, compliance gaps, and unfavorable terms. Compares clauses against internal policy standards.", owner: "Michael Torres", runs: 342, successRate: 97.2, lastRun: new Date(Date.now() - 3600000 * 0.25), status: "Active", icon: "file-search", department: "Legal", avgDuration: "4m 32s", documentsProcessed: 1840 },
  { id: "agent-2", name: "HR Policy Auditor", description: "Continuously monitors HR documents for internal consistency, regulatory compliance, and outdated provisions.", owner: "Sarah Chen", runs: 218, successRate: 95.8, lastRun: new Date(Date.now() - 3600000 * 1), status: "Active", icon: "shield-check", department: "Human Resources", avgDuration: "6m 15s", documentsProcessed: 960 },
  { id: "agent-3", name: "Security Compliance Agent", description: "Validates security documentation against SOC 2, GDPR, and ISO 27001 frameworks. Flags gaps and generates remediation tasks.", owner: "James Rivera", runs: 156, successRate: 99.1, lastRun: new Date(Date.now() - 3600000 * 3), status: "Idle", icon: "lock", department: "Security", avgDuration: "8m 48s", documentsProcessed: 720 },
  { id: "agent-4", name: "Code Review Agent", description: "Reviews pull requests for adherence to engineering standards, security vulnerabilities, and performance concerns.", owner: "Priya Patel", runs: 1247, successRate: 93.4, lastRun: new Date(Date.now() - 3600000 * 0.5), status: "Running", icon: "code", department: "Engineering", avgDuration: "2m 10s", documentsProcessed: 4200 },
  { id: "agent-5", name: "Resume Skill Gap Agent", description: "Analyzes candidate resumes against job requirements, identifies skill gaps, and generates structured hiring recommendations.", owner: "Sarah Chen", runs: 89, successRate: 91.7, lastRun: new Date(Date.now() - 86400000 * 1), status: "Idle", icon: "users", department: "Human Resources", avgDuration: "1m 45s", documentsProcessed: 340 },
  { id: "agent-6", name: "Vendor Risk Agent", description: "Evaluates vendor risk profiles based on contract terms, financial health indicators, and compliance certifications.", owner: "Michael Torres", runs: 134, successRate: 96.5, lastRun: new Date(Date.now() - 3600000 * 6), status: "Active", icon: "alert-triangle", department: "Legal", avgDuration: "5m 22s", documentsProcessed: 580 },
  { id: "agent-7", name: "Document Summarizer", description: "Generates concise, structured summaries of long documents with key findings, action items, and risk indicators.", owner: "Alex Morgan", runs: 892, successRate: 98.3, lastRun: new Date(Date.now() - 3600000 * 0.1), status: "Active", icon: "file-text", department: "Operations", avgDuration: "1m 15s", documentsProcessed: 3200 },
  { id: "agent-8", name: "Knowledge Health Monitor", description: "Tracks document freshness, identifies stale knowledge, detects missing owners, and monitors cross-reference integrity.", owner: "Alex Morgan", runs: 67, successRate: 100, lastRun: new Date(Date.now() - 3600000 * 12), status: "Idle", icon: "activity", department: "Operations", avgDuration: "12m 30s", documentsProcessed: 12482 },
];

// ── Agent Nodes (for Contract Review Agent detail) ──
export const contractReviewNodes: AgentNode[] = [
  { id: "an-1", type: "trigger", title: "New Document Uploaded", description: "Triggered when a contract is added to the Legal workspace", status: "completed", details: "Vendor Master Agreement v4.0 detected", icon: "upload" },
  { id: "an-2", type: "action", title: "Document Ingestion", description: "Parse and structure the document for analysis", status: "completed", details: "42 pages processed, 186 paragraphs extracted", icon: "file-input" },
  { id: "an-3", type: "action", title: "Extract Clauses", description: "Identify and categorize contract clauses using AI", status: "completed", details: "12 clauses identified across 8 categories", icon: "scissors" },
  { id: "an-4", type: "action", title: "Check Against Policies", description: "Compare extracted clauses with internal policy standards", status: "completed", details: "Compared against 6 internal policies", icon: "check-circle" },
  { id: "an-5", type: "action", title: "Identify Risks", description: "Flag potential risks, non-standard terms, and compliance gaps", status: "completed", details: "3 risks identified: 1 high, 2 medium", icon: "alert-triangle" },
  { id: "an-6", type: "output", title: "Generate Report", description: "Compile findings into a structured review report", status: "completed", details: "Report generated with 94% confidence", icon: "file-text" },
  { id: "an-7", type: "approval", title: "Human Approval", description: "Route to legal team lead for final review and sign-off", status: "pending", details: "Awaiting review from Michael Torres", icon: "user-check" },
];

// ── Workflows ──
export const workflows: Workflow[] = [
  { id: "wf-1", name: "New Document Processing Pipeline", description: "Automatically classify, analyze, and index newly uploaded documents.", status: "Active", runs: 1248, lastRun: new Date(Date.now() - 3600000 * 0.5), owner: "Alex Morgan", department: "Operations", nodes: 7, successRate: 98.1 },
  { id: "wf-2", name: "Quarterly Policy Audit", description: "Systematic review of all policy documents for consistency and compliance.", status: "Active", runs: 12, lastRun: new Date(Date.now() - 86400000 * 7), owner: "Sarah Chen", department: "Human Resources", nodes: 9, successRate: 100 },
  { id: "wf-3", name: "Vendor Onboarding Review", description: "End-to-end vendor contract review with risk assessment and compliance checks.", status: "Active", runs: 89, lastRun: new Date(Date.now() - 86400000 * 2), owner: "Michael Torres", department: "Legal", nodes: 8, successRate: 96.6 },
  { id: "wf-4", name: "Incident Response Triage", description: "Automated classification and routing of security incidents.", status: "Active", runs: 34, lastRun: new Date(Date.now() - 3600000 * 18), owner: "James Rivera", department: "Security", nodes: 6, successRate: 97.1 },
  { id: "wf-5", name: "Resume Screening Pipeline", description: "Automated resume parsing, skill extraction, and candidate scoring.", status: "Draft", runs: 0, lastRun: new Date(Date.now() - 86400000 * 14), owner: "Sarah Chen", department: "Human Resources", nodes: 5, successRate: 0 },
  { id: "wf-6", name: "Compliance Report Generator", description: "Generate monthly compliance reports from audit data and policy analysis.", status: "Active", runs: 24, lastRun: new Date(Date.now() - 86400000 * 4), owner: "James Rivera", department: "Security", nodes: 8, successRate: 100 },
  { id: "wf-7", name: "Knowledge Base Refresh", description: "Periodic scan of all documents for staleness and accuracy.", status: "Paused", runs: 6, lastRun: new Date(Date.now() - 86400000 * 30), owner: "Alex Morgan", department: "Operations", nodes: 5, successRate: 83.3 },
  { id: "wf-8", name: "Contract Renewal Alert", description: "Monitor contract expiration dates and trigger renewal workflows.", status: "Active", runs: 156, lastRun: new Date(Date.now() - 86400000 * 1), owner: "Michael Torres", department: "Legal", nodes: 4, successRate: 99.4 },
  { id: "wf-9", name: "Engineering Docs Sync", description: "Synchronize engineering documentation from GitHub repos and internal wikis.", status: "Active", runs: 340, lastRun: new Date(Date.now() - 3600000 * 6), owner: "Priya Patel", department: "Engineering", nodes: 6, successRate: 95.3 },
  { id: "wf-10", name: "Board Deck Preparation", description: "Compile and summarize key metrics for quarterly board presentations.", status: "Draft", runs: 0, lastRun: new Date(Date.now() - 86400000 * 60), owner: "Rachel Kim", department: "Finance", nodes: 7, successRate: 0 },
];

// ── Activity Events ──
export const activityEvents: ActivityEvent[] = [
  { id: "act-1", who: "Alex Morgan", isAI: false, action: "Approved", resource: "Casual Leave Policy Review", agent: "HR Policy Auditor", timestamp: new Date(Date.now() - 60000 * 2), result: "Success" },
  { id: "act-2", who: "Contract Review Agent", isAI: true, action: "Analyzed", resource: "42 vendor contracts", agent: "Contract Review Agent", timestamp: new Date(Date.now() - 60000 * 15), result: "Success", details: "3 risks identified across 42 contracts" },
  { id: "act-3", who: "Sarah Chen", isAI: false, action: "Uploaded", resource: "Employee Handbook v3.2", timestamp: new Date(Date.now() - 3600000 * 1), result: "Success" },
  { id: "act-4", who: "Knowledge Health Monitor", isAI: true, action: "Flagged", resource: "Security Incident Response Playbook", agent: "Knowledge Health Monitor", timestamp: new Date(Date.now() - 3600000 * 2), result: "Success", details: "Document not reviewed in 11 months" },
  { id: "act-5", who: "Priya Patel", isAI: false, action: "Modified", resource: "API Architecture Guidelines", timestamp: new Date(Date.now() - 3600000 * 4), result: "Success" },
  { id: "act-6", who: "HR Policy Auditor", isAI: true, action: "Analyzed", resource: "HR Leave Policy", agent: "HR Policy Auditor", timestamp: new Date(Date.now() - 3600000 * 5), result: "Success", details: "1 conflict detected across 3 HR sources" },
  { id: "act-7", who: "Michael Torres", isAI: false, action: "Reviewed", resource: "Vendor Master Agreement", timestamp: new Date(Date.now() - 3600000 * 8), result: "Success" },
  { id: "act-8", who: "Code Review Agent", isAI: true, action: "Analyzed", resource: "PR #847 — Auth refactor", agent: "Code Review Agent", timestamp: new Date(Date.now() - 3600000 * 10), result: "Success", details: "2 suggestions, 0 blockers" },
  { id: "act-9", who: "James Rivera", isAI: false, action: "Created", resource: "Incident Response Triage workflow", timestamp: new Date(Date.now() - 86400000 * 1), result: "Success" },
  { id: "act-10", who: "Document Summarizer", isAI: true, action: "Analyzed", resource: "Q3 2024 Financial Summary", agent: "Document Summarizer", timestamp: new Date(Date.now() - 86400000 * 1), result: "Success" },
  { id: "act-11", who: "Alex Morgan", isAI: false, action: "Resolved", resource: "Code review requirement conflict", timestamp: new Date(Date.now() - 86400000 * 2), result: "Success" },
  { id: "act-12", who: "Security Compliance Agent", isAI: true, action: "Triggered", resource: "SOC 2 gap analysis", agent: "Security Compliance Agent", timestamp: new Date(Date.now() - 86400000 * 3), result: "Pending", details: "Analysis in progress — estimated 8 minutes remaining" },
  { id: "act-13", who: "Rachel Kim", isAI: false, action: "Uploaded", resource: "Q3 2024 Financial Summary", timestamp: new Date(Date.now() - 86400000 * 4), result: "Success" },
  { id: "act-14", who: "Vendor Risk Agent", isAI: true, action: "Flagged", resource: "3 vendor contracts expiring within 30 days", agent: "Vendor Risk Agent", timestamp: new Date(Date.now() - 86400000 * 5), result: "Success" },
  { id: "act-15", who: "Sarah Chen", isAI: false, action: "Approved", resource: "Updated onboarding checklist", timestamp: new Date(Date.now() - 86400000 * 6), result: "Success" },
];

// ── Knowledge Graph ──
export const knowledgeNodes: KnowledgeNode[] = [
  { id: "kn-1", label: "Employee Handbook", type: "document", description: "Core HR policy document covering all employee guidelines", connections: 8, lastUpdated: new Date(Date.now() - 3600000 * 2), health: "conflicting" },
  { id: "kn-2", label: "HR Leave Policy", type: "policy", description: "Defines casual leave entitlement and approval rules", connections: 5, lastUpdated: new Date(Date.now() - 3600000 * 5), health: "healthy" },
  { id: "kn-3", label: "Human Resources", type: "department", description: "HR department managing people operations", connections: 12, lastUpdated: new Date(Date.now() - 3600000 * 1) },
  { id: "kn-4", label: "HR Policy Auditor", type: "agent", description: "AI agent monitoring HR document consistency", connections: 6, lastUpdated: new Date(Date.now() - 3600000 * 1), health: "healthy" },
  { id: "kn-5", label: "Sarah Chen", type: "person", description: "Head of Human Resources", connections: 9, lastUpdated: new Date(Date.now() - 3600000 * 1) },
  { id: "kn-6", label: "Security Playbook", type: "document", description: "Incident response procedures and protocols", connections: 4, lastUpdated: new Date(Date.now() - 86400000 * 330), health: "outdated" },
  { id: "kn-7", label: "Vendor Contracts", type: "project", description: "Active vendor management and contract portfolio", connections: 7, lastUpdated: new Date(Date.now() - 86400000 * 3) },
  { id: "kn-8", label: "Engineering Standards", type: "document", description: "Development best practices and guidelines", connections: 6, lastUpdated: new Date(Date.now() - 86400000 * 14), health: "at-risk" },
  { id: "kn-9", label: "SOC 2 Compliance", type: "system", description: "Security compliance framework and controls", connections: 5, lastUpdated: new Date(Date.now() - 86400000 * 45), health: "at-risk" },
  { id: "kn-10", label: "Michael Torres", type: "person", description: "General Counsel — Legal Department", connections: 8, lastUpdated: new Date(Date.now() - 3600000 * 8) },
  { id: "kn-11", label: "Code of Conduct", type: "policy", description: "Company behavioral standards and ethics guidelines", connections: 4, lastUpdated: new Date(Date.now() - 86400000 * 120), health: "outdated" },
  { id: "kn-12", label: "Contract Review Agent", type: "agent", description: "AI agent for automated contract analysis", connections: 5, lastUpdated: new Date(Date.now() - 3600000 * 0.25), health: "healthy" },
];

export const knowledgeEdges: KnowledgeEdge[] = [
  { id: "ke-1", source: "kn-1", target: "kn-2", label: "references", strength: 0.92 },
  { id: "ke-2", source: "kn-1", target: "kn-3", label: "owned by", strength: 0.95 },
  { id: "ke-3", source: "kn-2", target: "kn-3", label: "managed by", strength: 0.88 },
  { id: "ke-4", source: "kn-4", target: "kn-1", label: "monitors", strength: 0.90 },
  { id: "ke-5", source: "kn-4", target: "kn-2", label: "monitors", strength: 0.90 },
  { id: "ke-6", source: "kn-5", target: "kn-3", label: "leads", strength: 0.99 },
  { id: "ke-7", source: "kn-5", target: "kn-1", label: "owns", strength: 0.95 },
  { id: "ke-8", source: "kn-6", target: "kn-9", label: "supports", strength: 0.78 },
  { id: "ke-9", source: "kn-7", target: "kn-10", label: "managed by", strength: 0.92 },
  { id: "ke-10", source: "kn-12", target: "kn-7", label: "analyzes", strength: 0.88 },
  { id: "ke-11", source: "kn-8", target: "kn-11", label: "references", strength: 0.65 },
  { id: "ke-12", source: "kn-10", target: "kn-7", label: "oversees", strength: 0.94 },
  { id: "ke-13", source: "kn-1", target: "kn-11", label: "references", strength: 0.80 },
];

// ── Notifications ──
export const notifications: Notification[] = [
  { id: "notif-1", title: "Policy conflict detected", description: "Three HR sources disagree on casual leave entitlement. Visible to everyone.", type: "conflict", read: false, timestamp: new Date(Date.now() - 3600000 * 2), actionUrl: "/conflicts/con-1" },
  { id: "notif-2", title: "Agent completed review", description: "Contract Review Agent analyzed 42 vendor contracts. 3 risks identified.", type: "agent", read: false, timestamp: new Date(Date.now() - 60000 * 15), actionUrl: "/agents/agent-1" },
  { id: "notif-3", title: "Approval required", description: "AI-generated compliance summary for Q3 requires your sign-off.", type: "approval", read: false, timestamp: new Date(Date.now() - 3600000 * 4), actionUrl: "/documents/doc-11" },
  { id: "notif-4", title: "Document becoming stale", description: "Security Incident Response Playbook hasn't been reviewed in 11 months.", type: "document", read: false, timestamp: new Date(Date.now() - 3600000 * 6) },
  { id: "notif-5", title: "Workflow completed", description: "New Document Processing Pipeline completed successfully for 3 documents.", type: "system", read: true, timestamp: new Date(Date.now() - 3600000 * 12) },
  { id: "notif-6", title: "New integration available", description: "GitHub Enterprise integration is now available for your workspace.", type: "system", read: true, timestamp: new Date(Date.now() - 86400000 * 1) },
  { id: "notif-7", title: "Vendor contract expiring", description: "3 vendor contracts are expiring within the next 30 days.", type: "document", read: true, timestamp: new Date(Date.now() - 86400000 * 2) },
  { id: "notif-8", title: "Knowledge health alert", description: "Security documentation health dropped to 64%. Review recommended.", type: "system", read: true, timestamp: new Date(Date.now() - 86400000 * 3) },
  { id: "notif-9", title: "Agent error", description: "Resume Skill Gap Agent encountered a parsing error on 2 documents.", type: "agent", read: true, timestamp: new Date(Date.now() - 86400000 * 4) },
  { id: "notif-10", title: "Conflict resolved", description: "Code review requirement conflict has been marked as resolved.", type: "conflict", read: true, timestamp: new Date(Date.now() - 86400000 * 5) },
];

// ── Integrations ──
export const integrations: Integration[] = [
  { id: "int-1", name: "Google Drive", description: "Sync documents and folders from Google Drive.", icon: "hard-drive", connected: true, lastSync: new Date(Date.now() - 3600000 * 1), documentsIndexed: 3420 },
  { id: "int-2", name: "Microsoft 365", description: "Connect SharePoint, OneDrive, and Outlook.", icon: "layout-grid", connected: true, lastSync: new Date(Date.now() - 3600000 * 2), documentsIndexed: 5840 },
  { id: "int-3", name: "Slack", description: "Send notifications and search messages.", icon: "message-square", connected: true, lastSync: new Date(Date.now() - 60000 * 5) },
  { id: "int-4", name: "GitHub", description: "Index repositories, PRs, and documentation.", icon: "github", connected: true, lastSync: new Date(Date.now() - 3600000 * 6), documentsIndexed: 2180 },
  { id: "int-5", name: "Jira", description: "Sync project issues, epics, and documentation.", icon: "ticket", connected: false },
  { id: "int-6", name: "Notion", description: "Import pages and databases from Notion.", icon: "book-open", connected: false },
  { id: "int-7", name: "Confluence", description: "Index Confluence spaces and pages.", icon: "globe", connected: true, lastSync: new Date(Date.now() - 86400000 * 1), documentsIndexed: 1060 },
  { id: "int-8", name: "Dropbox", description: "Sync files and folders from Dropbox Business.", icon: "box", connected: false },
  { id: "int-9", name: "Salesforce", description: "Connect CRM data, contracts, and documents.", icon: "cloud", connected: false },
];

// ── Dashboard Metrics ──
export const dashboardMetrics: MetricData[] = [
  { label: "Documents Indexed", value: "12,482", change: 18.4, changeLabel: "vs last month", icon: "file-text", trend: "up" },
  { label: "Knowledge Sources", value: "38", change: 5.6, changeLabel: "vs last month", icon: "database", trend: "up" },
  { label: "Active Agents", value: "17", change: 3, changeLabel: "new this week", icon: "bot", trend: "up" },
  { label: "Pending Reviews", value: "23", change: -12.5, changeLabel: "vs last week", icon: "clock", trend: "down" },
  { label: "Detected Conflicts", value: "8", change: 2, changeLabel: "new today", icon: "alert-triangle", trend: "up" },
  { label: "Outdated Documents", value: "14", change: -3, changeLabel: "resolved this week", icon: "alert-circle", trend: "down" },
  { label: "AI Actions Today", value: "126", change: 34.2, changeLabel: "vs yesterday", icon: "zap", trend: "up" },
];

// ── Intelligence Feed ──
export const intelligenceFeed: IntelligenceEvent[] = [
  { id: "ie-1", type: "conflict", severity: "high", title: "Casual leave conflict detected", description: "HR Handbook, Leave Policy, and Manager Guide prescribe 10, 12, and 15 days. Review required.", source: "HR Policy Auditor", timestamp: new Date(Date.now() - 3600000 * 2), actionLabel: "Review Conflict", actionUrl: "/conflicts/con-1" },
  { id: "ie-2", type: "stale", severity: "high", title: "Document becoming stale", description: "Security Incident Response Playbook has not been reviewed in 11 months. Last owner: James Rivera.", source: "Knowledge Health Monitor", timestamp: new Date(Date.now() - 3600000 * 3), actionLabel: "Review Document", actionUrl: "/documents/doc-3" },
  { id: "ie-3", type: "agent", severity: "info", title: "Agent completed workflow", description: "Vendor Contract Review Agent analyzed 42 documents. 3 risks identified, 1 requiring immediate attention.", source: "Contract Review Agent", timestamp: new Date(Date.now() - 60000 * 15), actionLabel: "View Results", actionUrl: "/agents/agent-1" },
  { id: "ie-4", type: "approval", severity: "medium", title: "Approval required", description: "AI generated an updated compliance summary for Q3. Requires owner sign-off before distribution.", source: "Compliance Report Generator", timestamp: new Date(Date.now() - 3600000 * 4), actionLabel: "Review & Approve", actionUrl: "/documents/doc-11" },
  { id: "ie-5", type: "insight", severity: "low", title: "Knowledge coverage improved", description: "Engineering documentation coverage increased from 72% to 81% after recent uploads.", source: "Knowledge Health Monitor", timestamp: new Date(Date.now() - 3600000 * 8), actionLabel: "View Details", actionUrl: "/knowledge" },
  { id: "ie-6", type: "conflict", severity: "medium", title: "Vendor liability cap discrepancy", description: "Master Agreement and Risk Assessment Matrix define different liability caps. Legal review needed.", source: "Contract Review Agent", timestamp: new Date(Date.now() - 86400000 * 1), actionLabel: "Compare Documents", actionUrl: "/conflicts/con-3" },
  { id: "ie-7", type: "security", severity: "medium", title: "Compliance gap identified", description: "SOC 2 compliance documentation has 3 sections requiring updates based on recent audit findings.", source: "Security Compliance Agent", timestamp: new Date(Date.now() - 86400000 * 2), actionLabel: "View Gaps", actionUrl: "/security" },
  { id: "ie-8", type: "stale", severity: "low", title: "Upcoming review deadline", description: "Annual Performance Review Framework is due for its annual review in 14 days.", source: "Knowledge Health Monitor", timestamp: new Date(Date.now() - 86400000 * 3), actionLabel: "Schedule Review", actionUrl: "/documents/doc-14" },
];

// ── Access Model ──
// Stated plainly so users can see the rule instead of guessing at it.
export const accessPrinciples: AccessPrinciple[] = [
  {
    id: "ap-read",
    action: "Read",
    rule: "Open to everyone",
    detail: "Every policy, SOP, handbook, contract, and technical doc is readable by every employee, in every department, at every level. There is no permission check on retrieval and no hidden shelf.",
    openToEveryone: true,
    icon: "book-open",
  },
  {
    id: "ap-write",
    action: "Write",
    rule: "Owner of the document",
    detail: "Editing a policy stays with the department that publishes it. Anyone can read the HR handbook; only HR can change it. Ownership is accountability, not secrecy.",
    openToEveryone: false,
    icon: "pencil",
  },
  {
    id: "ap-approve",
    action: "Approve",
    rule: "Owner, or Director for org-wide changes",
    detail: "AI never commits a change on its own. A flagged conflict becomes a review task that a named human accepts, edits, or rejects — with the full evidence attached.",
    openToEveryone: false,
    icon: "user-check",
  },
];

// ── Security Features ──
export const securityFeatures: SecurityFeature[] = [
  { id: "sec-1", name: "Open Knowledge Base", description: "One shared corpus for the whole company. No departmental silos, no per-document permissions, no filtered answers.", status: "Operational", icon: "book-open" },
  { id: "sec-2", name: "Data Encryption", description: "AES-256 encryption at rest, TLS 1.3 in transit for all data.", status: "Operational", icon: "lock" },
  { id: "sec-3", name: "Audit Logging", description: "Comprehensive audit trail for all user and AI agent actions, readable by everyone it concerns.", status: "Operational", icon: "scroll" },
  { id: "sec-4", name: "AI Governance", description: "Configurable AI boundaries, human-in-the-loop approvals, and output monitoring.", status: "Configured", icon: "brain" },
  { id: "sec-5", name: "Change Accountability", description: "Every edit and approval is attributed to a named owner. Reading is free; changing is signed.", status: "Operational", icon: "user-check" },
  { id: "sec-6", name: "Tenant Isolation", description: "Knowledge is open within your organization and never crosses the boundary out of it.", status: "Operational", icon: "building" },
];

export const complianceBadges: ComplianceBadge[] = [
  { name: "SOC 2 Type II", status: "Active", description: "Service Organization Control 2 compliance for security, availability, and confidentiality.", icon: "shield-check" },
  { name: "GDPR", status: "Active", description: "General Data Protection Regulation compliance for EU data subjects.", icon: "globe" },
  { name: "ISO 27001", status: "In Progress", description: "Information security management system certification.", icon: "award" },
];
