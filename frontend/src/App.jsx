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
import TicketDetails from "./pages/Tickets/TicketDetails";
import CreateBooking from "./pages/Bookings/CreateBooking";
import MyBookings from "./pages/Bookings/MyBookings";
import AdminBookings from "./pages/Bookings/AdminBookings";
import BookingDetails from "./pages/Bookings/BookingDetails";
import HelpPage from "./pages/Help/HelpPage";
import LoginPage from "./pages/Auth/LoginPage";
import { useUser } from "./context/UserContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useUser();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

/**
 * Main App Component
 * Professional UI Layout with Sidebar and TopBar
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Application Routes */}
        <Route 
          path="/*" 
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/resources" element={<ResourceList />} />
                  <Route path="/tickets" element={<TicketList />} />
                  <Route path="/tickets/:id" element={<TicketDetails />} />
                  <Route path="/bookings" element={<Navigate to="/bookings/my" replace />} />
                  <Route path="/bookings/new" element={<CreateBooking />} />
                  <Route path="/bookings/my" element={<MyBookings />} />
                  <Route path="/bookings/admin" element={<AdminBookings />} />
                  <Route path="/bookings/:id" element={<BookingDetails />} />
                  <Route path="/help" element={<HelpPage />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
