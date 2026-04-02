import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import MemberOneResourceList from "./pages/MemberOne/ResourceListPage";
import TicketList from "./pages/Tickets/TicketList";
import CreateTicket from "./pages/Tickets/CreateTicket";
import TicketDetails from "./pages/Tickets/TicketDetails";

/**
 * Main App Component
 * Routes for Smart Campus Operations Hub
 */
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Bar */}
        <nav className="bg-white shadow-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏢</span>
              <h1 className="text-xl font-bold text-gray-900">
                Smart Campus Hub
              </h1>
            </div>
            <div className="flex items-center gap-6">
              <Link to="/resources" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                Resources (M1)
              </Link>
              <Link to="/tickets" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                Tickets (M3)
              </Link>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          {/* Member 1 - Resource Management */}
          <Route path="/" element={<MemberOneResourceList />} />
          <Route path="/resources" element={<MemberOneResourceList />} />

          {/* Member 3 - Incident Ticketing */}
          <Route path="/tickets" element={<TicketList />} />
          <Route path="/tickets/new" element={<CreateTicket />} />
          <Route path="/tickets/:id" element={<TicketDetails />} />

          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Footer */}
        <footer className="bg-gray-800 text-white mt-12">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="font-bold text-lg mb-3">Smart Campus Hub</h3>
                <p className="text-gray-400 text-sm">
                  Centralised platform for managing university resources and
                  operations
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-3">Member 1 Module</h3>
                <ul className="text-gray-400 text-sm space-y-2">
                  <li>Facilities & Assets Catalogue</li>
                  <li>Resource Management</li>
                  <li>Advanced Filtering & Search</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-3">Technologies</h3>
                <ul className="text-gray-400 text-sm space-y-2">
                  <li>Spring Boot Backend</li>
                  <li>React Frontend</li>
                  <li>MySQL Database</li>
                  <li>Tailwind CSS</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-700 pt-6 text-center text-gray-400 text-sm">
              <p>© 2026 Smart Campus Operations Hub - IT3030 PAF Assignment</p>
              <p>Member 1: Facilities & Assets Catalogue Module</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
