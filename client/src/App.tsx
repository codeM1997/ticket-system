import React from "react";
import { Routes, Route, Link, useParams } from "react-router-dom";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { TicketList } from "./components/TicketList";
import { TicketForm } from "./components/TicketForm";
import { TicketDetail } from "./components/TicketDetail";
import { useTicket } from "./hooks/useTickets";
import { ErrorMessage } from "./components/ErrorMessage";

// ---- Error Boundary --------------------------------------------------------
// Catches render-time errors and unhandled React Query thrown errors.
// Displays appropriate message based on error type (network vs other).

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{ onReset?: () => void }>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{ onReset?: () => void }>) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const err = error as { status?: number; message?: string };

    // Network error (fetch threw — no status)
    if (!err.status && err.message?.toLowerCase().includes("network")) {
      return {
        hasError: true,
        message: "Unable to connect to server. Check your connection.",
      };
    }

    // 5xx server error
    if (typeof err.status === "number" && err.status >= 500) {
      return {
        hasError: true,
        message: "Something went wrong. Please try again later.",
      };
    }

    // Fallback for unexpected render errors
    return {
      hasError: true,
      message: "Something went wrong. Please try again later.",
    };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: "" });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "2rem" }}>
          <ErrorMessage message={this.state.message} />
          <button
            onClick={this.handleReset}
            style={{ marginTop: "1rem" }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ---- Edit route helper ------------------------------------------------------

function EditTicketRoute() {
  const { id } = useParams<{ id: string }>();
  const { data: ticket, isLoading } = useTicket(id ?? "");
  if (isLoading) return <p>Loading...</p>;
  if (!ticket) return <p>Ticket not found</p>;
  return <TicketForm mode="edit" ticket={ticket} />;
}

// ---- App shell --------------------------------------------------------------

function App() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset}>
          <div style={{ maxWidth: "960px", margin: "0 auto", padding: "1rem" }}>
            <h1>Support Ticket Management</h1>
            <nav style={{ marginBottom: "1rem" }}>
              <Link to="/">Tickets</Link>{" | "}
              <Link to="/tickets/new">New Ticket</Link>
            </nav>
            <Routes>
              <Route path="/" element={<TicketList />} />
              <Route path="/tickets/new" element={<TicketForm mode="create" />} />
              <Route path="/tickets/:id" element={<TicketDetail />} />
              <Route path="/tickets/:id/edit" element={<EditTicketRoute />} />
            </Routes>
          </div>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}

export default App;
