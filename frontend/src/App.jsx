import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import { useUser } from "./context/UserContext";
import Layout from "./components/Layout/Layout";
import HelpPage from "./pages/Help/HelpPage";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import LoginPage from "./pages/Auth/LoginPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import ResourceList from "./pages/Resources/ResourceListPage";
import TicketList from "./pages/Tickets/TicketList";
import TicketDetails from "./pages/Tickets/TicketDetails";
import CreateBooking from "./pages/Bookings/CreateBooking";
import MyBookings from "./pages/Bookings/MyBookings";
import AdminBookings from "./pages/Bookings/AdminBookings";
import BookingDetails from "./pages/Bookings/BookingDetails";
import SettingsPage from "./pages/Admin/SettingsPage";

const AppLayout = () => {
  const { isAuthenticated } = useUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

/**
 * Main App Component
 * Professional UI Layout with Sidebar and TopBar
 */
function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={<AppLayout />}>
          {/* Dashboard / Home */}
          <Route index element={<Dashboard />} />

          {/* Resource Management */}
          <Route path="resources" element={<ResourceList />} />

          {/* Member 3 - Incident Ticketing */}
          <Route path="tickets" element={<TicketList />} />
          <Route path="tickets/new" element={<Navigate to="/tickets" replace />} />
          <Route path="tickets/:id" element={<TicketDetails />} />

          {/* Member 2 - Booking Management */}
          <Route path="bookings" element={<Navigate to="/bookings/my" replace />} />
          <Route path="bookings/new" element={<CreateBooking />} />
          <Route path="bookings/my" element={<MyBookings />} />
          <Route
            path="bookings/admin"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]} redirectTo="/bookings/my">
                <AdminBookings />
              </ProtectedRoute>
            }
          />
          <Route path="bookings/:id" element={<BookingDetails />} />
          <Route path="help" element={<HelpPage />} />
          <Route
            path="settings"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]} redirectTo="/">
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
