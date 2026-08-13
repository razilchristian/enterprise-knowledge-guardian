"""Content for the six Tier-1 demo documents.

These are fictional Acme Corp policies written so that specific clauses
contradict each other across documents. The contradictions are the point --
they are what the conflict engine has to find:

    Casual leave     Handbook 10  vs  Leave Policy 12  vs  Manager Guide 15
    Equipment return Handbook 5 days  vs  IT Procurement same-day / 24h
    PTO              Handbook 15  vs  Onboarding Checklist 18
    Review cadence   Handbook annual  vs  Review Framework twice yearly

The numbers and section labels here must stay exactly as written -- the UI
cites these sections, and the detector compares these values. Changing "ten
(10)" to "10" is fine; changing it to "twelve" silently breaks the demo.

Each clause is padded with ordinary policy prose on purpose. Retrieval that
finds one sentence buried in several pages is the thing worth demonstrating.
"""

DOCUMENTS = [
    {
        "filename": "Employee Handbook v3.2.pdf",
        "title": "Employee Handbook",
        "version": "3.2",
        "department": "Human Resources",
        "owner": "Sarah Chen",
        "sections": [
            ("1.1", "Purpose and Scope", [
                "This handbook describes the terms, expectations, and benefits that apply to all "
                "full-time employees of Acme Corporation. It supersedes all previous editions and "
                "should be read alongside the department-specific policies published by Human "
                "Resources, Legal, and Operations.",
                "Where this handbook conflicts with a signed employment agreement, the employment "
                "agreement prevails. Where it conflicts with another internal policy, employees "
                "should raise the discrepancy with their manager or with Human Resources rather "
                "than assuming either source is correct.",
            ]),
            ("7.1", "Leave Overview", [
                "Acme Corporation provides several categories of leave: casual leave, paid time "
                "off, sick leave, parental leave, and unpaid personal leave. Entitlements are "
                "calculated on a calendar-year basis beginning 1 January.",
                "Employees joining part-way through a year accrue leave on a pro-rata basis, "
                "rounded up to the nearest half day. Leave balances are visible in the employee "
                "self-service portal and are updated overnight.",
            ]),
            ("7.2", "Public Holidays", [
                "Acme Corporation observes twelve public holidays per calendar year. The published "
                "holiday calendar is issued each November for the following year. Employees "
                "required to work on a public holiday are entitled to compensatory time off, to be "
                "taken within ninety days.",
            ]),
            ("7.3", "Casual Leave", [
                "All full-time employees are entitled to ten (10) days of casual leave per calendar "
                "year, subject to manager approval and standard carry-forward rules.",
                "Casual leave is intended for short, unplanned absences such as personal errands, "
                "family obligations, or brief illness not requiring medical certification. Requests "
                "of three or more consecutive days should be submitted at least one week in advance "
                "where circumstances allow.",
                "Unused casual leave may be carried forward to the following calendar year up to a "
                "maximum of five days. Any balance beyond that lapses on 31 December and is not "
                "paid out on termination.",
            ]),
            ("7.4", "Paid Time Off", [
                "Full-time employees accrue 15 days of PTO per year during their first three years "
                "of employment, increasing to 20 days after the third anniversary.",
                "Paid time off is distinct from casual leave and is intended for planned vacation. "
                "PTO requests should be submitted through the self-service portal at least two "
                "weeks in advance, and are approved subject to team coverage requirements.",
            ]),
            ("8.1", "Performance Reviews", [
                "Formal performance evaluations are conducted annually during Q4. Mid-year "
                "check-ins are encouraged but not mandatory.",
                "The annual review considers objectives agreed at the start of the cycle, peer "
                "feedback, and the employee's own self-assessment. Outcomes inform compensation "
                "review, which is processed separately in Q1 of the following year.",
            ]),
            ("12.4", "Termination Procedures", [
                "All company property, including laptops, access badges, and peripherals, must be "
                "returned within five (5) business days of the last working day.",
                "The employee's manager is responsible for confirming return of all issued items "
                "and notifying IT Operations so that system access can be revoked. Final settlement "
                "of salary and unused entitlements is processed in the payroll cycle following "
                "confirmation of asset return.",
            ]),
        ],
    },
    {
        "filename": "HR Leave Policy.pdf",
        "title": "HR Leave Policy",
        "version": "2.1",
        "department": "Human Resources",
        "owner": "Sarah Chen",
        "sections": [
            ("1.0", "Purpose", [
                "This policy defines leave eligibility, entitlement, and approval requirements for "
                "all employees of Acme Corporation. It is maintained by Human Resources and is the "
                "authoritative source for leave entitlement figures.",
            ]),
            ("4.1", "Eligibility", [
                "All employees on permanent full-time contracts are eligible for casual leave from "
                "their date of joining. Employees on probation may apply for casual leave with the "
                "written approval of their department head.",
                "Contractors and agency staff are not covered by this policy and should refer to "
                "the terms of their engagement.",
            ]),
            ("4.2", "Casual Leave Entitlement", [
                "Eligible employees receive twelve (12) days of casual leave annually.",
                "Entitlement is credited in full at the start of each calendar year. Employees who "
                "join mid-year receive a pro-rata credit calculated from their joining date to 31 "
                "December.",
            ]),
            ("4.3", "Application and Approval", [
                "Casual leave requests are submitted through the self-service portal and routed to "
                "the employee's reporting manager. Managers are expected to respond within two "
                "working days.",
                "Where a request is declined, the manager must record a reason. Employees may "
                "escalate a declined request to Human Resources for review.",
            ]),
        ],
    },
    {
        "filename": "Manager Guide.pdf",
        "title": "Manager Guide",
        "version": "1.4",
        "department": "Human Resources",
        "owner": "Sarah Chen",
        "sections": [
            ("1.0", "About This Guide", [
                "This guide supports people managers in applying Acme Corporation's employment "
                "policies consistently. It summarises the approvals a manager may grant without "
                "escalation, and the situations that require Human Resources involvement.",
            ]),
            ("3.1", "Time-off Guidance", [
                "Managers may approve up to fifteen (15) days of casual leave annually.",
                "Approval should take into account team coverage, project deadlines, and any "
                "pattern of short-notice absence. Managers are not required to justify approval of "
                "leave within this limit, but should record the decision in the self-service "
                "portal so that balances stay accurate.",
            ]),
            ("3.2", "When to Escalate", [
                "Requests that exceed the manager's approval limit, or that follow a pattern of "
                "repeated short-notice absence, should be escalated to Human Resources before a "
                "decision is communicated to the employee.",
                "Managers should also escalate any request where the employee disputes their "
                "recorded leave balance, as balance discrepancies often indicate a policy or "
                "system issue rather than an individual error.",
            ]),
        ],
    },
    {
        "filename": "IT Procurement Policy.pdf",
        "title": "IT Procurement Policy",
        "version": "1.4",
        "department": "Operations",
        "owner": "James Rivera",
        "sections": [
            ("1.0", "Scope", [
                "This policy governs the purchase, assignment, and recovery of information "
                "technology assets across Acme Corporation, including laptops, mobile devices, "
                "peripherals, and software licences.",
            ]),
            ("4.3", "Purchase Authorization", [
                "All IT purchases above $1,000 require manager and director dual approval. "
                "Purchases above $5,000 require CFO sign-off.",
                "Purchases below the $1,000 threshold may be approved by the requesting employee's "
                "reporting manager alone. Splitting a single purchase into multiple smaller orders "
                "to avoid a threshold is prohibited.",
            ]),
            ("8.1", "Asset Recovery", [
                "Terminated employees must return all issued hardware and access credentials no "
                "later than their final day of employment. Failure to return equipment within 24 "
                "hours of termination will result in payroll deduction.",
                "IT Operations maintains the asset register and is responsible for confirming "
                "recovery. Devices are wiped and re-imaged before reassignment, and any device not "
                "recovered within thirty days is reported as lost and remotely disabled.",
            ]),
        ],
    },
    {
        "filename": "Employee Onboarding Checklist.pdf",
        "title": "Employee Onboarding Checklist",
        "version": "3.0",
        "department": "Human Resources",
        "owner": "Sarah Chen",
        "sections": [
            ("1.0", "Before Day One", [
                "Human Resources issues the signed offer letter, collects identity and right-to-work "
                "documentation, and raises an IT provisioning request at least five working days "
                "before the start date.",
            ]),
            ("2.0", "Week One", [
                "The new joiner completes mandatory induction covering health and safety, "
                "information security, and the Code of Conduct. Their manager schedules a "
                "first-week check-in and confirms objectives for the first ninety days.",
            ]),
            ("3.0", "Benefits Summary", [
                "New hires receive 18 days of PTO annually, with increases based on tenure "
                "milestones outlined in the benefits guide.",
                "Enrolment in the medical scheme and pension plan opens on the first day of "
                "employment and must be completed within thirty days. Employees who do not enrol "
                "within that window wait until the next annual enrolment period.",
            ]),
        ],
    },
    {
        "filename": "Annual Performance Review Framework.pdf",
        "title": "Annual Performance Review Framework",
        "version": "2.1",
        "department": "Human Resources",
        "owner": "Sarah Chen",
        "sections": [
            ("1.1", "Purpose", [
                "This framework describes how performance is assessed at Acme Corporation, the "
                "cadence of formal reviews, and the responsibilities of employees, managers, and "
                "Human Resources within the cycle.",
            ]),
            ("1.2", "Review Cadence", [
                "The performance review cycle consists of two formal evaluation periods: mid-year "
                "(June-July) and end-of-year (November-December). Both reviews are mandatory.",
                "Each review requires a written self-assessment from the employee and a written "
                "assessment from the reporting manager. Reviews not completed within the published "
                "window are escalated to the department head.",
            ]),
            ("2.1", "Rating Scale", [
                "Performance is recorded on a five-point scale ranging from 'Below Expectations' "
                "to 'Outstanding'. Ratings are calibrated across each department before being "
                "released to employees, to reduce variation between individual managers.",
            ]),
        ],
    },
]
