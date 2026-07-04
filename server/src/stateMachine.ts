/**
 * Ticket status state machine.
 *
 * Valid transitions:
 *   Open        -> In Progress, Cancelled
 *   In Progress -> Resolved, Cancelled
 *   Resolved    -> Closed
 *   Closed      -> (terminal)
 *   Cancelled   -> (terminal)
 */
export const VALID_TRANSITIONS: Record<string, string[]> = {
  Open: ["In Progress", "Cancelled"],
  "In Progress": ["Resolved", "Cancelled"],
  Resolved: ["Closed"],
  Closed: [],
  Cancelled: [],
};

/**
 * Check whether a transition from `from` to `to` is allowed.
 * Returns false for unknown source statuses (including inherited Object
 * prototype keys such as "toString" and "hasOwnProperty").
 */
export function canTransition(from: string, to: string): boolean {
  if (!Object.hasOwn(VALID_TRANSITIONS, from)) return false;
  return VALID_TRANSITIONS[from].includes(to);
}

/**
 * Get the list of statuses reachable from `currentStatus` in one step.
 * Returns an empty array for terminal or unknown statuses (including
 * inherited Object prototype keys).
 */
export function getValidTransitions(currentStatus: string): string[] {
  if (!Object.hasOwn(VALID_TRANSITIONS, currentStatus)) return [];
  return VALID_TRANSITIONS[currentStatus];
}
