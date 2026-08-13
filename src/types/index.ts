// ── Common Types ──

/**
 * Nexora runs an open knowledge model: every person in the organization can
 * read every policy document, regardless of which department published it.
 * Cross-department conflict detection is only useful if people can actually
 * see across departments, so reading is never gated.
 *
 * A Role therefore does NOT control what you can see. It controls two things:
 *   1. Which lens the platform opens on — what surfaces first for this person.
 *   2. What you may approve — governance still needs an accountable human.
 */
export type Role = "Employee" | "Department Owner" | "Director";

/** Scope of change a role is accountable for approving. Never a read boundary. */
export type ApprovalScope = "none" | "department" | "organization";

export interface Persona {
  role: Role;
  /** Real-world job titles this persona covers, for the role picker. */
  covers: string;
  /** What this persona comes to the platform to do. */
  intent: string;
  approvalScope: ApprovalScope;
  /** Route this persona lands on after sign-in. */
  landing: string;
  icon: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  title: string;
  department: Department;
}

export type Department = "Legal" | "Human Resources" | "Engineering" | "Security" | "Operations" | "Finance";

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: "conflict" | "agent" | "approval" | "system" | "document";
  read: boolean;
  timestamp: Date;
  actionUrl?: string;
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  lastSync?: Date;
  documentsIndexed?: number;
}

// ── Document Types ──

export type DocumentType = "PDF" | "DOCX" | "PPTX" | "TXT" | "Code" | "MD";

export type DocumentStatus =
  | "Analyzed"
  | "Processing"
  | "Needs Review"
  | "Outdated"
  | "Conflict Detected";

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  owner: string;
  department: Department;
  lastUpdated: Date;
  status: DocumentStatus;
  risk: RiskLevel;
  version: string;
  size: string;
  pages?: number;
  aiConfidence?: number;
  summary?: string;
  keyFindings?: string[];
  entities?: string[];
  referencedPolicies?: string[];
}

// ── Conflict Types ──

export type ConflictSeverity = "High" | "Medium" | "Low";
export type ConflictStatus = "Open" | "In Review" | "Resolved" | "Dismissed";

export interface Conflict {
  id: string;
  title: string;
  description: string;
  severity: ConflictSeverity;
  status: ConflictStatus;
  documentA: { name: string; section: string; content: string };
  documentB: { name: string; section: string; content: string };
  departments: Department[];
  detectedAt: Date;
  aiExplanation: string;
  recommendedResolution: string;
  semanticSimilarity: number;
  changes: number;
}

// ── Agent Types ──

export type AgentStatus = "Active" | "Idle" | "Running" | "Error" | "Paused";

export interface Agent {
  id: string;
  name: string;
  description: string;
  owner: string;
  runs: number;
  successRate: number;
  lastRun: Date;
  status: AgentStatus;
  icon: string;
  department: Department;
  avgDuration: string;
  documentsProcessed: number;
}

export interface AgentNode {
  id: string;
  type: "trigger" | "action" | "condition" | "approval" | "output";
  title: string;
  description: string;
  status: "completed" | "running" | "pending" | "error";
  details?: string;
  icon: string;
}

// ── Workflow Types ──

export type WorkflowStatus = "Active" | "Draft" | "Paused" | "Archived";

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  runs: number;
  lastRun: Date;
  owner: string;
  department: Department;
  nodes: number;
  successRate: number;
}

export interface WorkflowNodeData {
  id: string;
  type: "trigger" | "ai-action" | "document" | "condition" | "approval" | "integration" | "output";
  label: string;
  description: string;
  icon: string;
  status?: "completed" | "running" | "pending" | "error";
}

// ── Knowledge Graph Types ──

export type KnowledgeNodeType = "document" | "person" | "policy" | "project" | "department" | "system" | "agent";

export interface KnowledgeNode {
  id: string;
  label: string;
  type: KnowledgeNodeType;
  description: string;
  connections: number;
  lastUpdated: Date;
  health?: "healthy" | "at-risk" | "outdated" | "conflicting";
}

export interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  strength: number;
}

// ── Activity Types ──

export type ActivityAction =
  | "Approved"
  | "Analyzed"
  | "Uploaded"
  | "Modified"
  | "Reviewed"
  | "Created"
  | "Deleted"
  | "Resolved"
  | "Flagged"
  | "Triggered";

export interface ActivityEvent {
  id: string;
  who: string;
  isAI: boolean;
  action: ActivityAction;
  resource: string;
  agent?: string;
  timestamp: Date;
  result: "Success" | "Pending" | "Failed";
  details?: string;
}

// ── Dashboard Types ──

export interface MetricData {
  label: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: string;
  trend: "up" | "down" | "neutral";
}

export interface IntelligenceEvent {
  id: string;
  type: "conflict" | "stale" | "agent" | "approval" | "insight" | "security";
  severity: "high" | "medium" | "low" | "info";
  title: string;
  description: string;
  source: string;
  timestamp: Date;
  actionLabel: string;
  actionUrl: string;
}

// ── Trust Center Types ──

/**
 * The open knowledge model, stated explicitly. Read is open to everyone;
 * only writing and approving are governed. Rendered on the Trust Center so
 * the rule is visible to users rather than buried in a permission table.
 */
export interface AccessPrinciple {
  id: string;
  action: "Read" | "Write" | "Approve";
  rule: string;
  detail: string;
  /** true when this action is open to every role, no gating at all. */
  openToEveryone: boolean;
  icon: string;
}

export interface SecurityFeature {
  id: string;
  name: string;
  description: string;
  status: "Operational" | "Configured" | "Needs Attention";
  icon: string;
}

export interface ComplianceBadge {
  name: string;
  status: "Active" | "In Progress" | "Planned";
  description: string;
  icon: string;
}
