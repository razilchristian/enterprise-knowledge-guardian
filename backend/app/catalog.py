"""Which department owns which document.

The PDFs state a department in their header, but parsing free text for it is
fragile. This mapping is explicit so ownership is never guessed -- and
ownership is what the governance model turns on: everyone may read every
document here, but only the owning department may change one.
"""

CATALOG: dict[str, tuple[str, str]] = {
    # filename stem -> (department, owner)
    "Employee Handbook v3.2": ("Human Resources", "Sarah Chen"),
    "HR Leave Policy": ("Human Resources", "Sarah Chen"),
    "Manager Guide": ("Human Resources", "Sarah Chen"),
    "Employee Onboarding Checklist": ("Human Resources", "Sarah Chen"),
    "Annual Performance Review Framework": ("Human Resources", "Sarah Chen"),
    "Code of Conduct": ("Human Resources", "Sarah Chen"),
    # Underscored filenames, matching how these two arrived.
    "Employee_Separation_and_Documentation_Policy": ("Human Resources", "Sarah Chen"),
    "HR_Service_Standards": ("Human Resources", "Sarah Chen"),

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
