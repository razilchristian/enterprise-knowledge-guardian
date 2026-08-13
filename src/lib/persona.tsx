"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { demoUsers, personas } from "@/data";
import type { Persona, Role, User } from "@/types";

/**
 * Nexora is one platform for the whole organization. Everybody reads the same
 * knowledge base; the persona only decides which lens opens first and who is
 * accountable for approving a change.
 *
 * Nothing in here filters documents. If you find yourself reaching for this
 * context to decide whether someone may *see* something, the answer is yes.
 */
interface PersonaContextValue {
  user: User;
  persona: Persona;
  setRole: (role: Role) => void;
  /** Can this persona sign off on a change to a document owned by `department`? */
  canApprove: (department?: string) => boolean;
}

const PersonaContext = createContext<PersonaContextValue | null>(null);

const personaFor = (role: Role): Persona =>
  personas.find((p) => p.role === role) ?? personas[0];

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("Employee");

  const user = demoUsers[role];
  const persona = personaFor(role);

  const canApprove = useCallback(
    (department?: string) => {
      switch (persona.approvalScope) {
        case "organization":
          return true;
        case "department":
          return department === undefined || department === user.department;
        default:
          return false;
      }
    },
    [persona.approvalScope, user.department]
  );

  const value = useMemo(
    () => ({ user, persona, setRole, canApprove }),
    [user, persona, canApprove]
  );

  return <PersonaContext.Provider value={value}>{children}</PersonaContext.Provider>;
}

export function usePersona() {
  const context = useContext(PersonaContext);
  if (!context) throw new Error("usePersona must be used within a PersonaProvider");
  return context;
}

/** Initials for avatar chips, e.g. "Sarah Chen" -> "SC". */
export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
