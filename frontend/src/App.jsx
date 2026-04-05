import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Dashboard from "./pages/Dashboard/Dashboard";
import ResourceList from "./pages/Resources/ResourceListPage";
import TicketList from "./pages/Tickets/TicketList";
import CreateTicket from "./pages/Tickets/CreateTicket";
import TicketDetails from "./pages/Tickets/TicketDetails";

/**
 * Main App Component
 * Professional UI Layout with Sidebar and TopBar
 */
function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Dashboard / Home */}
          <Route path="/" element={<Dashboard />} />

          {/* Resource Management */}
          <Route path="/resources" element={<ResourceList />} />

          {/* Member 3 - Incident Ticketing */}
          <Route path="/tickets" element={<TicketList />} />
          <Route path="/tickets/new" element={<CreateTicket />} />
          <Route path="/tickets/:id" element={<TicketDetails />} />

          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/tickets" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
