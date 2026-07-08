import { Routes, Route, Link, useParams } from "react-router-dom";
import { TicketList } from "./components/TicketList";
import { TicketForm } from "./components/TicketForm";
import { TicketDetail } from "./components/TicketDetail";
import { useTicket } from "./hooks/useTickets";

function EditTicketRoute() {
  const { id } = useParams<{ id: string }>();
  const { data: ticket, isLoading } = useTicket(id ?? "");
  if (isLoading) return <p>Loading...</p>;
  if (!ticket) return <p>Ticket not found</p>;
  return <TicketForm mode="edit" ticket={ticket} />;
}

function App() {
  return (
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
  );
}

export default App;
