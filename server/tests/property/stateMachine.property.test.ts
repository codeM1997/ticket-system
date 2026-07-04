import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  canTransition,
  getValidTransitions,
} from "../../src/stateMachine.js";

// Feature: support-ticket-management, Property 7: Valid state machine transitions succeed
//
// Validates Requirements 5.1, 5.2, 5.3, 5.4, 5.5.
//
// Scope: server-side pure state-machine logic only. Persistence via HTTP is
// covered by the integration suite in task 10.1.

type Status = "Open" | "In Progress" | "Resolved" | "Closed" | "Cancelled";
type TransitionPair = readonly [Status, Status];

// Exact valid pair set from design.md Property 7 / requirements 5.1-5.5.
const VALID_PAIRS: readonly TransitionPair[] = [
  ["Open", "In Progress"],
  ["Open", "Cancelled"],
  ["In Progress", "Resolved"],
  ["In Progress", "Cancelled"],
  ["Resolved", "Closed"],
] as const;

describe("Property 7: Valid state machine transitions succeed", () => {
  it("canTransition returns true for every pair sampled from the valid set", () => {
    fc.assert(
      fc.property(fc.constantFrom(...VALID_PAIRS), ([from, to]) => {
        expect(canTransition(from, to)).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  it("getValidTransitions(from) includes to for every valid pair", () => {
    fc.assert(
      fc.property(fc.constantFrom(...VALID_PAIRS), ([from, to]) => {
        expect(getValidTransitions(from)).toContain(to);
      }),
      { numRuns: 100 },
    );
  });

  it("generating from-status then picking any of its valid targets always transitions", () => {
    // Alternative encoding: sample a from-status that has at least one valid
    // target, then draw the to-status from getValidTransitions(from). This
    // exercises the same property via a different generator path.
    const fromWithTargets = fc.constantFrom<Status>(
      "Open",
      "In Progress",
      "Resolved",
    );

    fc.assert(
      fc.property(
        fromWithTargets.chain((from) => {
          const targets = getValidTransitions(from) as Status[];
          return fc.tuple(fc.constant(from), fc.constantFrom(...targets));
        }),
        ([from, to]) => {
          expect(canTransition(from, to)).toBe(true);
          expect(getValidTransitions(from)).toContain(to);
        },
      ),
      { numRuns: 100 },
    );
  });
});
