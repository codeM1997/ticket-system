// CommentForm: add comment with client-side validation
// Requirements: 6.1, 6.3, 13.3, 13.4

import { useState, useMemo } from "react";
import { useAddComment, useUsers } from "../hooks/useTickets";
import { ApiError } from "../api/tickets";
import { ErrorMessage } from "./ErrorMessage";
import type { User } from "../types";

export interface CommentFormProps {
  ticketId: string;
}

export function CommentForm({ ticketId }: CommentFormProps) {
  const [message, setMessage] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [errors, setErrors] = useState<{ message?: string; createdBy?: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const { data: usersData } = useUsers();
  const addCommentMutation = useAddComment();

  const users: User[] = usersData?.users ?? [];

  function validate(): { message?: string; createdBy?: string } {
    const errs: { message?: string; createdBy?: string } = {};
    if (!message.trim()) {
      errs.message = "Message is required";
    }
    if (!createdBy) {
      errs.createdBy = "User is required";
    }
    return errs;
  }

  const currentErrors = useMemo(() => validate(), [message, createdBy]);
  const hasErrors = Object.keys(currentErrors).length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setApiError(null);

    addCommentMutation.mutate(
      { ticketId, payload: { message: message.trim(), createdBy } },
      {
        onSuccess: () => {
          setMessage("");
          setCreatedBy("");
        },
        onError: (err) => {
          const msg = err instanceof ApiError
            ? err.message
            : "Unable to connect to server. Check your connection.";
          setApiError(msg);
        },
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
      <div style={{ marginBottom: "0.5rem" }}>
        <label htmlFor="comment-message" style={{ display: "block", fontWeight: 600, marginBottom: "0.25rem" }}>
          Comment
        </label>
        <textarea
          id="comment-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        {errors.message && (
          <span role="alert" style={{ color: "#c62828", fontSize: "0.85rem" }}>{errors.message}</span>
        )}
      </div>

      <div style={{ marginBottom: "0.5rem" }}>
        <label htmlFor="comment-user" style={{ display: "block", fontWeight: 600, marginBottom: "0.25rem" }}>
          User
        </label>
        <select
          id="comment-user"
          value={createdBy}
          onChange={(e) => setCreatedBy(e.target.value)}
          style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
        >
          <option value="">Select user</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
        {errors.createdBy && (
          <span role="alert" style={{ color: "#c62828", fontSize: "0.85rem" }}>{errors.createdBy}</span>
        )}
      </div>

      {apiError && <ErrorMessage message={apiError} />}

      <button
        type="submit"
        disabled={hasErrors || addCommentMutation.isPending}
        style={{
          padding: "0.5rem 1rem",
          borderRadius: "4px",
          border: "none",
          backgroundColor: hasErrors ? "#ccc" : "#1976d2",
          color: "#fff",
          cursor: hasErrors ? "not-allowed" : "pointer",
        }}
      >
        {addCommentMutation.isPending ? "Submitting..." : "Add Comment"}
      </button>
    </form>
  );
}

export default CommentForm;
