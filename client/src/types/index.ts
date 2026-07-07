// Enums

export type Priority = "Low" | "Medium" | "High" | "Critical";

export type Status = "Open" | "In Progress" | "Resolved" | "Closed" | "Cancelled";

// Models

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Comment {
  id: string;
  message: string;
  createdAt: string;
  ticketId: string;
  createdBy: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  assignedTo: string | null;
  comments?: Comment[];
}

// Request payloads

export interface CreateTicketPayload {
  title: string;
  description: string;
  priority: Priority;
  createdBy: string;
}

export interface UpdateTicketPayload {
  title?: string;
  description?: string;
  priority?: Priority;
  assignedTo?: string | null;
}

export interface TransitionPayload {
  toStatus: Status;
}

export interface CreateCommentPayload {
  message: string;
  createdBy: string;
}

// Response shapes

export interface TicketListResponse {
  tickets: Ticket[];
}

export interface UserListResponse {
  users: User[];
}

// Error shapes

export interface ValidationError {
  field?: string;
  message: string;
}

export interface ApiErrorBody {
  errors?: ValidationError[];
  error?: string;
}
