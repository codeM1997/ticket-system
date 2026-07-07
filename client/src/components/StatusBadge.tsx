// StatusBadge: color-coded label per ticket status
// Requirements: 2.1, 3.1

import type { Status } from "../types";

const STATUS_COLORS: Record<Status, { bg: string; fg: string }> = {
  Open: { bg: "#e3f2fd", fg: "#0d47a1" },
  "In Progress": { bg: "#fff8e1", fg: "#8a6d00" },
  Resolved: { bg: "#e8f5e9", fg: "#1b5e20" },
  Closed: { bg: "#eceff1", fg: "#37474f" },
  Cancelled: { bg: "#fdecea", fg: "#611a15" },
};

export interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status];

  return (
    <span
      style={{
        display: "inline-block",
        padding: "0.15rem 0.6rem",
        borderRadius: "999px",
        fontSize: "0.8rem",
        fontWeight: 600,
        backgroundColor: colors.bg,
        color: colors.fg,
      }}
    >
      {status}
    </span>
  );
}

export default StatusBadge;
