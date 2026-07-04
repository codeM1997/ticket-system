import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  VALID_TRANSITIONS,
  getValidTransitions,
} from "../../src/stateMachine.js";

// Feature: support-ticket-management, Property 9: Frontend presents only valid next-status options
//
// Validates Requirements 5.8.
//
// Scope: server-side portion. The frontend renders transition buttons from
// getValidTransitions(currentStatus); this file asserts that the server-side
// source of truth exposes exactly the expected set for every known status,
// and returns an empty set for unknown strings. The client-side rendering
// portion is covered by task 18.1.

type Status = "Open" | "In Progress" | "Resolved" | "Closed" | "Cancelled";

const ALL_STATUSES: readonly Status[] = [
  "Open",
  "In Progress",
  "Resolved",
  "Closed",
  "Cancelled",
] as const;

// Reference map derived directly from design.md / requirements 5.1-5.5.
// Kept independent from VALID_TRANSITIONS so a bug that mutated the source
// would still be caught by this test.
const EXPECTED_TRANSITIONS: Record<Status, readonly Status[]> = {
  Open: ["In Progress", "Cancelled"],
  "In Progress": ["Resolved", "Cancelled"],
  Resolved: ["Closed"],
  Closed: [],
  Cancelled: [],
};

const asSet = <T>(xs: readonly T[]): Set<T> => new Set(xs);

describe("Property 9 (server-side): getValidTransitions exposes exact valid set", () => {
  it("VALID_TRANSITIONS map covers every known status and no extras", () => {
    // Guards the reference map: any drift between design and code fails here.
    expect(asSet(Object.keys(VALID_TRANSITIONS))).toEqual(asSet(ALL_STATUSES));
  });

  it("returned set equals expected set for every known status", () => {
    fc.assert(
      fc.property(fc.constantFrom(...ALL_STATUSES), (status) => {
        const actual = getValidTransitions(status);
        const expected = EXPECTED_TRANSITIONS[status];

        // Set equality: no missing target, no extra target, no duplicates.
        expect(asSet(actual)).toEqual(asSet(expected));
        expect(actual).toHaveLength(expected.length);
      }),
      { numRuns: 100 },
    );
  });

  it("returned array has no duplicate entries", () => {
    fc.assert(
      fc.property(fc.constantFrom(...ALL_STATUSES), (status) => {
        const actual = getValidTransitions(status);
        expect(new Set(actual).size).toBe(actual.length);
      }),
      { numRuns: 100 },
    );
  });

  it("every exposed target is itself a known status", () => {
    const known = asSet<string>(ALL_STATUSES);
    fc.assert(
      fc.property(fc.constantFrom(...ALL_STATUSES), (status) => {
        for (const target of getValidTransitions(status)) {
          expect(known.has(target)).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("returns an empty array for unknown status strings", () => {
    // Requirement 5.8 constrains the frontend to show only valid options.
    // Unknown statuses have no valid next-status, so the exposed set must be
    // empty. Filter out accidental collisions with known status names.
    const knownStatuses = asSet<string>(ALL_STATUSES);
    const unknownStatus = fc
      .string({ minLength: 0, maxLength: 32 })
      .filter((s) => !knownStatuses.has(s));

    fc.assert(
      fc.property(unknownStatus, (status) => {
        expect(getValidTransitions(status)).toEqual([]);
      }),
      { numRuns: 100 },
    );
  });
});
