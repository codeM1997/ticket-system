// TicketDetail: full ticket view with comments and transition buttons
// Requirements: 3.1, 3.3, 5.7, 5.8, 6.4

import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTicket, useTransitionTicket, useUsers } from "../hooks/useTickets";
import { ApiError } from "../api/tickets";
import type { Status } from "../types";
import { StatusBadge } from "./StatusBadge";
import { ErrorMessage } from "./ErrorMessage";
import { TransitionButtons } from "./TransitionButtons";
import { CommentList } from "./CommentList";

export function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: ticket, isLoading, error } = useTicket(id ?? "");
  const { data: usersData } = useUsers();
  const transitionMutation = useTransitionTicket();
  const [transitionError, setTransitionError] = useState<string | null>(null);

  if (isLoading) return <p>Loading...</p>;

  if (error) {
    if (error instanceof ApiError && error.status === 404) {
      return <ErrorMessage message="Ticket not found" />;
    }
    const msg = error instanceof ApiError
      ? error.message
      : "Unable to connect to server. Check your connection.";
    return <ErrorMessage message={msg} />;
  }

  if (!ticket) return <ErrorMessage message="Ticket not found" />;

  const users = usersData?.users ?? [];
  const creatorName = users.find((u) => u.id === ticket.createdBy)?.name ?? ticket.createdBy;
  const assigneeName = ticket.assignedTo
    ? (users.find((u) => u.id === ticket.assignedTo)?.name ?? ticket.assignedTo)
    : "Unassigned";

  function handleTransition(toStatus: Status) {
    setTransitionError(null);
    transitionMutation.mutate(
      { id: ticket!.id, payload: { toStatus } },
      {
        onError: (err) => {
          const msg = err instanceof ApiError
            ? err.message
            : "Transition failed. Please try again.";
          setTransitionError(msg);
        },
      }
    );
  }

  return (
    <div>
      <Link to="/">&larr; Back to list</Link>

      <h2 style={{ marginTop: "1rem" }}>{ticket.title}</h2>

      <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1rem" }}>
        <StatusBadge status={ticket.status} />
        <span style={{ fontSize: "0.85rem", color: "#666" }}>
          Priority: <strong>{ticket.priority}</strong>
        </span>
      </div>

      <p>{ticket.description}</p>

      <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.25rem 1rem", fontSize: "0.9rem" }}>
        <dt style={{ fontWeight: 600 }}>Creator</dt>
        <dd style={{ margin: 0 }}>{creatorName}</dd>
        <dt style={{ fontWeight: 600 }}>Assignee</dt>
        <dd style={{ margin: 0 }}>{assigneeName}</dd>
        <dt style={{ fontWeight: 600 }}>Created</dt>
        <dd style={{ margin: 0 }}>{new Date(ticket.createdAt).toLocaleString()}</dd>
        <dt style={{ fontWeight: 600 }}>Updated</dt>
        <dd style={{ margin: 0 }}>{new Date(ticket.updatedAt).toLocaleString()}</dd>
      </dl>

      <h3 style={{ marginTop: "1.5rem" }}>Status Transitions</h3>
      {transitionError && <ErrorMessage message={transitionError} />}
      <TransitionButtons
        currentStatus={ticket.status}
        onTransition={handleTransition}
        disabled={transitionMutation.isPending}
      />

      <h3 style={{ marginTop: "1.5rem" }}>Comments</h3>
      <CommentList comments={ticket.comments ?? []} />
    </div>
  );
}

export default TicketDetail;
