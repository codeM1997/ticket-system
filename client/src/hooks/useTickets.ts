import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  addComment,
  createTicket,
  getTicket,
  listTickets,
  listUsers,
  transitionTicket,
  updateTicket,
} from "../api/tickets";
import type {
  CreateCommentPayload,
  CreateTicketPayload,
  TransitionPayload,
  UpdateTicketPayload,
} from "../types";

// Query key factory
export const ticketKeys = {
  list: (filters?: { search?: string; status?: string }) =>
    ["tickets", filters ?? {}] as const,
  detail: (id: string) => ["tickets", id] as const,
};

export const userKeys = {
  list: () => ["users"] as const,
};

export function useTicketList(filters?: { search?: string; status?: string }) {
  return useQuery({
    queryKey: ticketKeys.list(filters),
    queryFn: () => listTickets(filters),
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ticketKeys.detail(id),
    queryFn: () => getTicket(id),
    enabled: !!id,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTicketPayload) => createTicket(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTicketPayload }) =>
      updateTicket(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ticketKeys.detail(variables.id) });
    },
  });
}

export function useTransitionTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TransitionPayload }) =>
      transitionTicket(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ticketKeys.detail(variables.id) });
    },
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, payload }: { ticketId: string; payload: CreateCommentPayload }) =>
      addComment(ticketId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.detail(variables.ticketId) });
    },
  });
}

export function useUsers() {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: () => listUsers(),
  });
}
