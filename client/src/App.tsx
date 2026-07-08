import { TicketList } from "./components/TicketList";

function App() {
  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "1rem" }}>
      <h1>Support Ticket Management</h1>
      <TicketList />
    </div>
  );
}

export default App;
