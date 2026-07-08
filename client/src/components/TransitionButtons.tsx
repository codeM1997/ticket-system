// TransitionButtons: shows only valid next-status options for current status
// Requirements: 5.7, 5.8

import type { Status } from "../types";

const VALID_TRANSITIONS: Record<Status, Status[]> = {
  Open: ["In Progress", "Cancelled"],
  "In Progress": ["Resolved", "Cancelled"],
  Resolved: ["Closed"],
  Closed: [],
  Cancelled: [],
};

export function getValidTransitions(currentStatus: Status): Status[] {
  return VALID_TRANSITIONS[currentStatus] ?? [];
}

export interface TransitionButtonsProps {
  currentStatus: Status;
  onTransition: (toStatus: Status) => void;
  disabled?: boolean;
}

export function TransitionButtons({ currentStatus, onTransition, disabled }: TransitionButtonsProps) {
  const options = getValidTransitions(currentStatus);

  if (options.length === 0) return null;

  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      {options.map((status) => (
        <button
          key={status}
          type="button"
          onClick={() => onTransition(status)}
          disabled={disabled}
          style={{
            padding: "0.4rem 0.8rem",
            borderRadius: "4px",
            border: "1px solid #1976d2",
            backgroundColor: "#e3f2fd",
            color: "#0d47a1",
            cursor: disabled ? "not-allowed" : "pointer",
            fontWeight: 500,
          }}
        >
          Move to {status}
        </button>
      ))}
    </div>
  );
}

export default TransitionButtons;
