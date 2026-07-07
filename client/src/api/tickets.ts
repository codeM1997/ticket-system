import type {
  ApiErrorBody,
  Comment,
  CreateCommentPayload,
  CreateTicketPayload,
  Ticket,
  TicketListResponse,
  TransitionPayload,
  UpdateTicketPayload,
  UserListResponse,
} from "../types";

// Typed error thrown by all API wrappers.
export class ApiError extends Error {
  public status: number;
  public body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody) {
    const msg =
      body.errors?.map((e) => e.message).join(", ") ||
      body.error ||
      "Unknown error";
    super(msg);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    const headers: Record<string, string> = { ...init?.headers as Record<string, string> };
    if (init?.body) {
      headers["Content-Type"] = "application/json";
    }
    res = await fetch(path, { ...init, headers });
  } catch {
    throw new ApiError(0, { error: "Unable to connect to server. Check your connection." });
  }

  if (!res.ok) {
    let body: ApiErrorBody;
    try {
      body = await res.json();
    } catch {
      body = { error: "Internal server error" };
    }
    throw new ApiError(res.status, body);
  }

  return res.json() as Promise<T>;
}

// Tickets

export function listTickets(params?: { search?: string; status?: string }): Promise<TicketListResponse> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.status) query.set("status", params.status);
  const qs = query.toString();
  return request<TicketListResponse>(`/api/tickets${qs ? `?${qs}` : ""}`);
}

export function getTicket(id: string): Promise<Ticket> {
  return request<Ticket>(`/api/tickets/${id}`);
}

export function createTicket(payload: CreateTicketPayload): Promise<Ticket> {
  return request<Ticket>("/api/tickets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateTicket(id: string, payload: UpdateTicketPayload): Promise<Ticket> {
  return request<Ticket>(`/api/tickets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function transitionTicket(id: string, payload: TransitionPayload): Promise<Ticket> {
  return request<Ticket>(`/api/tickets/${id}/transitions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Comments

export function addComment(ticketId: string, payload: CreateCommentPayload): Promise<Comment> {
  return request<Comment>(`/api/tickets/${ticketId}/comments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Users

export function listUsers(): Promise<UserListResponse> {
  return request<UserListResponse>("/api/users");
}
