import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  canTransition,
  VALID_TRANSITIONS,
} from "../../src/stateMachine.js";

// Feature: support-ticket-management, Property 8: Invalid state machine transitions are rejected
//
// Validates Requirements 5.6.
//
// Scope: pure state-machine logic. HTTP-level rejection (400 response with
// "Invalid transition from X to Y" message) is exercised by the integration
// suite in task 10.1; this file only asserts canTransition returns false for
// every pair outside the valid set.

type Status = "Open" | "In Progress" | "Resolved" | "Closed" | "Cancelled";

const ALL_STATUSES: readonly Status[] = [
  "Open",
  "In Progress",
  "Resolved",
  "Closed",
  "Cancelled",
] as const;

// Exact valid pair set from design.md Property 7 / requirements 5.1-5.5.
const VALID_PAIRS: ReadonlySet<string> = new Set([
  "Open->In Progress",
  "Open->Cancelled",
  "In Progress->Resolved",
  "In Progress->Cancelled",
  "Resolved->Closed",
]);

const pairKey = (from: string, to: string) => `${from}->${to}`;

// All (from, to) permutations over ALL_STATUSES that are NOT in VALID_PAIRS.
// Includes self-transitions (Open->Open) and transitions out of terminal
// states (Closed->Open, Cancelled->Resolved, ...).
const INVALID_PAIRS: readonly (readonly [Status, Status])[] = ALL_STATUSES
  .flatMap((from) => ALL_STATUSES.map((to) => [from, to] as const))
  .filter(([from, to]) => !VALID_PAIRS.has(pairKey(from, to)));

describe("Property 8: Invalid state machine transitions are rejected", () => {
  it("VALID_PAIRS set matches VALID_TRANSITIONS exactly (guards the generator)", () => {
    const derived = new Set<string>();
    for (const [from, targets] of Object.entries(VALID_TRANSITIONS)) {
      for (const to of targets) derived.add(pairKey(from, to));
    }
    expect(derived).toEqual(VALID_PAIRS);
  });

  it("canTransition returns false for every pair sampled from the invalid set of known statuses", () => {
    fc.assert(
      fc.property(fc.constantFrom(...INVALID_PAIRS), ([from, to]) => {
        expect(canTransition(from, to)).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  it("canTransition returns false when either endpoint is an unknown status string", () => {
    // Any string not in ALL_STATUSES is an invalid endpoint. Requirement 5.6
    // makes no exception for unrecognised statuses. Filter out accidental
    // collisions with known status names.
    const knownStatuses = new Set<string>(ALL_STATUSES);
    const unknownStatus = fc
      .string({ minLength: 0, maxLength: 32 })
      .filter((s) => !knownStatuses.has(s));
    const anyStatus = fc.constantFrom<string>(...ALL_STATUSES);

    fc.assert(
      fc.property(
        fc.oneof(
          fc.tuple(unknownStatus, anyStatus),
          fc.tuple(anyStatus, unknownStatus),
          fc.tuple(unknownStatus, unknownStatus),
        ),
        ([from, to]) => {
          expect(canTransition(from, to)).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("canTransition returns false for every arbitrary (from, to) pair not in VALID_TRANSITIONS", () => {
    // Broader generator: any string pair. Guarded by filtering out the exact
    // valid pairs so a bug that widened the valid set would be caught.
    const anyString = fc.string({ minLength: 0, maxLength: 32 });

    fc.assert(
      fc.property(anyString, anyString, (from, to) => {
        fc.pre(!VALID_PAIRS.has(pairKey(from, to)));
        expect(canTransition(from, to)).toBe(false);
      }),
      { numRuns: 200 },
    );
  });
});
