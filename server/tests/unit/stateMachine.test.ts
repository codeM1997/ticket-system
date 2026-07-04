import { describe, it, expect } from "vitest";
import {
  VALID_TRANSITIONS,
  canTransition,
  getValidTransitions,
} from "../../src/stateMachine.js";

/**
 * Unit tests for the ticket status state machine.
 *
 * Validates Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6.
 *
 * Strategy: table-driven over the full cartesian product of known statuses.
 * The expected result for each (from, to) pair is derived directly from
 * VALID_TRANSITIONS, so this test is a self-consistent contract check that
 * also pins down the exact allowed set.
 */

const STATUSES = ["Open", "In Progress", "Resolved", "Closed", "Cancelled"] as const;
type Status = (typeof STATUSES)[number];

// Explicit expected valid transition set from design.md / requirements 5.1-5.5.
const EXPECTED_VALID_PAIRS: ReadonlyArray<[Status, Status]> = [
  ["Open", "In Progress"],
  ["Open", "Cancelled"],
  ["In Progress", "Resolved"],
  ["In Progress", "Cancelled"],
  ["Resolved", "Closed"],
];

const EXPECTED_VALID_SET = new Set(
  EXPECTED_VALID_PAIRS.map(([from, to]) => `${from}->${to}`),
);

const isExpectedValid = (from: Status, to: Status): boolean =>
  EXPECTED_VALID_SET.has(`${from}->${to}`);

// Cartesian product of every (from, to) pair.
const ALL_PAIRS: Array<{ from: Status; to: Status; expected: boolean }> = [];
for (const from of STATUSES) {
  for (const to of STATUSES) {
    ALL_PAIRS.push({ from, to, expected: isExpectedValid(from, to) });
  }
}

describe("stateMachine.VALID_TRANSITIONS map", () => {
  it("exposes an entry for every known status", () => {
    for (const status of STATUSES) {
      expect(VALID_TRANSITIONS).toHaveProperty(status);
      expect(Array.isArray(VALID_TRANSITIONS[status])).toBe(true);
    }
  });

  it.each([
    ["Open", ["In Progress", "Cancelled"]],
    ["In Progress", ["Resolved", "Cancelled"]],
    ["Resolved", ["Closed"]],
    ["Closed", []],
    ["Cancelled", []],
  ] as const)("status %s maps to the expected next-status set", (status, expected) => {
    expect([...VALID_TRANSITIONS[status]].sort()).toEqual([...expected].sort());
  });
});

describe("canTransition — table-driven over all (from, to) pairs", () => {
  const validPairs = ALL_PAIRS.filter((p) => p.expected);
  const invalidPairs = ALL_PAIRS.filter((p) => !p.expected);

  // Sanity: 5 statuses * 5 statuses = 25 total, 5 valid, 20 invalid.
  it("covers every combination exactly once", () => {
    expect(ALL_PAIRS).toHaveLength(STATUSES.length * STATUSES.length);
    expect(validPairs).toHaveLength(EXPECTED_VALID_PAIRS.length);
    expect(invalidPairs).toHaveLength(
      STATUSES.length * STATUSES.length - EXPECTED_VALID_PAIRS.length,
    );
  });

  // Requirements 5.1-5.5: every allowed transition returns true.
  it.each(validPairs)(
    "allows valid transition $from -> $to (Requirements 5.1-5.5)",
    ({ from, to }) => {
      expect(canTransition(from, to)).toBe(true);
    },
  );

  // Requirement 5.6: every disallowed pair returns false, including
  // self-transitions, backwards transitions, and cross transitions.
  it.each(invalidPairs)(
    "rejects invalid transition $from -> $to (Requirement 5.6)",
    ({ from, to }) => {
      expect(canTransition(from, to)).toBe(false);
    },
  );
});

describe("canTransition — unknown / malformed source status", () => {
  it.each([
    ["Unknown", "Open"],
    ["", "Open"],
    ["open", "In Progress"], // wrong case, not in map
    ["In Progress ", "Resolved"], // trailing whitespace
    ["Resolved", "unknown-target"],
  ])("returns false for %s -> %s", (from, to) => {
    expect(canTransition(from, to)).toBe(false);
  });
});

describe("getValidTransitions", () => {
  it.each([
    ["Open", ["In Progress", "Cancelled"]],
    ["In Progress", ["Resolved", "Cancelled"]],
    ["Resolved", ["Closed"]],
    ["Closed", []],
    ["Cancelled", []],
  ] as const)("returns the exact allowed set for %s", (status, expected) => {
    expect([...getValidTransitions(status)].sort()).toEqual([...expected].sort());
  });

  it("returns an empty array for unknown statuses", () => {
    expect(getValidTransitions("Unknown")).toEqual([]);
    expect(getValidTransitions("")).toEqual([]);
    expect(getValidTransitions("open")).toEqual([]);
  });

  it("agrees with canTransition for every (status, candidate) pair", () => {
    for (const from of STATUSES) {
      const allowed = getValidTransitions(from);
      for (const to of STATUSES) {
        expect(canTransition(from, to)).toBe(allowed.includes(to));
      }
    }
  });
});
