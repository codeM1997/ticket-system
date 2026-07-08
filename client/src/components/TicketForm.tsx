import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateTicket, useUpdateTicket, useUsers } from "../hooks/useTickets";
import { ApiError } from "../api/tickets";
import type { Priority, Ticket, ValidationError } from "../types";

const PRIORITIES: Priority[] = ["Low", "Medium", "High", "Critical"];

interface TicketFormProps {
  mode: "create" | "edit";
  ticket?: Ticket;
}

interface FieldErrors {
  title?: string;
  description?: string;
  priority?: string;
  createdBy?: string;
  assignedTo?: string;
}

export function TicketForm({ mode, ticket }: TicketFormProps) {
  const navigate = useNavigate();
  const { data: usersData } = useUsers();
  const createMutation = useCreateTicket();
  const updateMutation = useUpdateTicket();

  const [title, setTitle] = useState(ticket?.title ?? "");
  const [description, setDescription] = useState(ticket?.description ?? "");
  const [priority, setPriority] = useState<string>(ticket?.priority ?? "");
  const [createdBy, setCreatedBy] = useState(ticket?.createdBy ?? "");
  const [assignedTo, setAssignedTo] = useState(ticket?.assignedTo ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");

  // Sync if ticket prop changes (edit mode)
  useEffect(() => {
    if (ticket) {
      setTitle(ticket.title);
      setDescription(ticket.description);
      setPriority(ticket.priority);
      setCreatedBy(ticket.createdBy);
      setAssignedTo(ticket.assignedTo ?? "");
    }
  }, [ticket]);

  const users = usersData?.users ?? [];

  function validate(): FieldErrors {
    const errs: FieldErrors = {};
    if (!title.trim()) errs.title = "Title is required";
    if (!description.trim()) errs.description = "Description is required";
    if (!PRIORITIES.includes(priority as Priority)) errs.priority = "Priority must be Low, Medium, High, or Critical";
    if (mode === "create" && !createdBy) errs.createdBy = "Creator is required";
    return errs;
  }

  const fieldErrors = validate();
  const hasErrors = Object.keys(fieldErrors).length > 0;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors(fieldErrors);
    if (hasErrors) return;

    setServerError("");

    if (mode === "create") {
      createMutation.mutate(
        { title: title.trim(), description: description.trim(), priority: priority as Priority, createdBy, assignedTo: assignedTo || null },
        {
          onSuccess: (created) => navigate(`/tickets/${created.id}`),
          onError: (err) => handleApiError(err),
        }
      );
    } else if (ticket) {
      updateMutation.mutate(
        {
          id: ticket.id,
          payload: {
            title: title.trim(),
            description: description.trim(),
            priority: priority as Priority,
            assignedTo: assignedTo || null,
          },
        },
        {
          onSuccess: () => navigate(`/tickets/${ticket.id}`),
          onError: (err) => handleApiError(err),
        }
      );
    }
  }

  function handleApiError(err: unknown) {
    if (err instanceof ApiError && err.body.errors) {
      const mapped: FieldErrors = {};
      err.body.errors.forEach((ve: ValidationError) => {
        if (ve.field) (mapped as Record<string, string>)[ve.field] = ve.message;
      });
      if (Object.keys(mapped).length > 0) {
        setErrors(mapped);
      } else {
        setServerError(err.message);
      }
    } else if (err instanceof ApiError) {
      setServerError(err.message);
    } else {
      setServerError("An unexpected error occurred");
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2>{mode === "create" ? "Create Ticket" : "Edit Ticket"}</h2>

      {serverError && (
        <div role="alert" style={alertStyle}>{serverError}</div>
      )}

      <div style={fieldStyle}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? "title-error" : undefined}
        />
        {errors.title && <span id="title-error" style={errorStyle} role="alert">{errors.title}</span>}
      </div>

      <div style={fieldStyle}>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? "description-error" : undefined}
        />
        {errors.description && <span id="description-error" style={errorStyle} role="alert">{errors.description}</span>}
      </div>

      <div style={fieldStyle}>
        <label htmlFor="priority">Priority</label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          aria-invalid={!!errors.priority}
          aria-describedby={errors.priority ? "priority-error" : undefined}
        >
          <option value="">Select priority</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        {errors.priority && <span id="priority-error" style={errorStyle} role="alert">{errors.priority}</span>}
      </div>

      {mode === "create" && (
        <div style={fieldStyle}>
          <label htmlFor="createdBy">Created By</label>
          <select
            id="createdBy"
            value={createdBy}
            onChange={(e) => setCreatedBy(e.target.value)}
            aria-invalid={!!errors.createdBy}
            aria-describedby={errors.createdBy ? "createdBy-error" : undefined}
          >
            <option value="">Select user</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          {errors.createdBy && <span id="createdBy-error" style={errorStyle} role="alert">{errors.createdBy}</span>}
        </div>
      )}

      <div style={fieldStyle}>
        <label htmlFor="assignedTo">Assigned To</label>
        <select
          id="assignedTo"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
        >
          <option value="">Unassigned</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      </div>

      <button type="submit" disabled={hasErrors || isPending}>
        {isPending ? "Saving..." : mode === "create" ? "Create Ticket" : "Save Changes"}
      </button>
    </form>
  );
}

const fieldStyle: React.CSSProperties = {
  marginBottom: "1rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
};

const errorStyle: React.CSSProperties = {
  color: "#611a15",
  fontSize: "0.85rem",
};

const alertStyle: React.CSSProperties = {
  padding: "0.75rem 1rem",
  marginBottom: "1rem",
  borderRadius: "4px",
  border: "1px solid #8a1f11",
  backgroundColor: "#fdecea",
  color: "#611a15",
};

export default TicketForm;
