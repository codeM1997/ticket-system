import type { Status } from "../types";

const ALL_STATUSES: Status[] = ["Open", "In Progress", "Resolved", "Closed", "Cancelled"];

export interface SearchFilterProps {
  search: string;
  status: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function SearchFilter({ search, status, onSearchChange, onStatusChange }: SearchFilterProps) {
  return (
    <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
      <input
        type="text"
        placeholder="Search tickets..."
        aria-label="Search tickets"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{ padding: "0.5rem", minWidth: "200px", flex: 1 }}
      />
      <select
        aria-label="Filter by status"
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        style={{ padding: "0.5rem" }}
      >
        <option value="">All Statuses</option>
        {ALL_STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}

export default SearchFilter;
