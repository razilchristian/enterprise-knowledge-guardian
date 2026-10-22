"""Which department owns which document.

The PDFs state a department in their header, but parsing free text for it is
fragile. This mapping is explicit so ownership is never guessed -- and
ownership is what the governance model turns on: everyone may read every
document here, but only the owning department may change one.
"""

CATALOG: dict[str, tuple[str, str]] = {
    # filename stem -> (department, owner)
    "Employee Handbook v3.2": ("Human Resources", "Kajal Thakkar"),
    "HR Leave Policy": ("Human Resources", "Kajal Thakkar"),
    "Manager Guide": ("Human Resources", "Kajal Thakkar"),
    "Employee Onboarding Checklist": ("Human Resources", "Kajal Thakkar"),
    "Annual Performance Review Framework": ("Human Resources", "Kajal Thakkar"),
    "Code of Conduct": ("Human Resources", "Kajal Thakkar"),
    # Underscored filenames, matching how these two arrived.
    "Employee_Separation_and_Documentation_Policy": ("Human Resources", "Kajal Thakkar"),
    "HR_Service_Standards": ("Human Resources", "Kajal Thakkar"),

    "Vendor Master Agreement": ("Legal", "Michael Torres"),
    "Vendor Risk Assessment Matrix": ("Legal", "Michael Torres"),
    "Data Processing Agreement": ("Legal", "Michael Torres"),
    "Non-Disclosure Agreement Template": ("Legal", "Michael Torres"),

    "Engineering Standards & Best Practices": ("Engineering", "Priya Patel"),
    "API Architecture Guidelines": ("Engineering", "Priya Patel"),
    "Cloud Infrastructure Runbook": ("Engineering", "Priya Patel"),
    "Release Management Process": ("Engineering", "Priya Patel"),
    "Third-Party Software License Inventory": ("Engineering", "Priya Patel"),

    "Security Incident Response Playbook": ("Security", "James Rivera"),
    "SOC 2 Compliance Report": ("Security", "James Rivera"),
    "Disaster Recovery Plan": ("Security", "James Rivera"),

    "IT Procurement Policy": ("Operations", "James Rivera"),

    "Expense Reimbursement Policy": ("Finance", "Rachel Kim"),
    "Q3 2024 Financial Summary": ("Finance", "Rachel Kim"),

    # The 2026 master policies. Each is owned by the department that owned the
    # legacy documents it supersedes -- not by whoever happened to upload it,
    # which is what the UI's upload form recorded and why these are listed here.
    "HR_Leave_Policy_2026_Unified": ("Human Resources", "Kajal Thakkar"),
    "GLOBAL_PERFORMANCE_REVIEW_POLICY_2026_UNIFIED": ("Human Resources", "Kajal Thakkar"),
    "GLOBAL_ENTERPRISE_DATA_RETENTION_POLICY_2026_UNIFIED": ("Legal", "Michael Torres"),
    "GLOBAL_ENTERPRISE_VENDOR_PROCUREMENT_MASTER_2026": ("Legal", "Michael Torres"),
    "GLOBAL_SECURITY_INCIDENT_RESPONSE_MASTER_2026": ("Security", "James Rivera"),
}

DEFAULT = ("Operations", "Unassigned")


def lookup(stem: str) -> tuple[str, str]:
    """Department and owner for a document, by filename stem.

    Falls back to matching with underscores and spaces treated alike, so a file
    named `HR_Service_Standards.pdf` still resolves if the catalog key uses
    spaces. Silently defaulting to Operations would mis-attribute ownership,
    which is what the approval model turns on.
    """
    if stem in CATALOG:
        return CATALOG[stem]

    normalized = stem.replace("_", " ").strip().lower()
    for key, value in CATALOG.items():
        if key.replace("_", " ").strip().lower() == normalized:
            return value
    return DEFAULT
