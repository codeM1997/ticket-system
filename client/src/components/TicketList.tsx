import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTicketList, useUsers } from "../hooks/useTickets";
import { StatusBadge } from "./StatusBadge";
import { SearchFilter } from "./SearchFilter";
import { ErrorMessage } from "./ErrorMessage";

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function TicketList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const filters = {
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(status ? { status } : {}),
  };

  const { data, isLoading, error } = useTicketList(
    debouncedSearch || status ? filters : undefined
  );
  const { data: usersData } = useUsers();

  const tickets = data?.tickets ?? [];
  const hasFilters = !!(debouncedSearch || status);

  // Build userId to name map for assignee display
  const userMap = new Map(
    (usersData?.users ?? []).map((u) => [u.id, u.name])
  );

  if (error) {
    return <ErrorMessage message={(error as Error).message} />;
  }

  return (
    <div>
      <h2 style={{ marginBottom: "1rem" }}>Tickets</h2>
      <SearchFilter
        search={search}
        status={status}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
      />

      {isLoading && <p>Loading tickets...</p>}

      {!isLoading && tickets.length === 0 && !hasFilters && (
        <p>No tickets yet. Create one to get started.</p>
      )}

      {!isLoading && tickets.length === 0 && hasFilters && (
        <p>No tickets match your search criteria.</p>
      )}

      {!isLoading && tickets.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>
              <th style={{ padding: "0.5rem" }}>Title</th>
              <th style={{ padding: "0.5rem" }}>Priority</th>
              <th style={{ padding: "0.5rem" }}>Status</th>
              <th style={{ padding: "0.5rem" }}>Assignee</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "0.5rem" }}>
                  <Link to={`/tickets/${ticket.id}`}>{ticket.title}</Link>
                </td>
                <td style={{ padding: "0.5rem" }}>{ticket.priority}</td>
                <td style={{ padding: "0.5rem" }}>
                  <StatusBadge status={ticket.status} />
                </td>
                <td style={{ padding: "0.5rem" }}>
                  {ticket.assignedTo ? (userMap.get(ticket.assignedTo) ?? "Unknown") : "Unassigned"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TicketList;
