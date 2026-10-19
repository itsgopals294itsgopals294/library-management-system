import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext.jsx';

// Layout
import AppLayout from './components/layout/AppLayout.jsx';

// Pages
import Dashboard from './pages/Dashboard.jsx';
import Catalog from './pages/Catalog.jsx';
import CirculationDesk from './pages/CirculationDesk.jsx';
import Inventory from './pages/Inventory.jsx';
import Reservations from './pages/Reservations.jsx';
import Fines from './pages/Fines.jsx';
import Members from './pages/Members.jsx';
import PatronPortal from './pages/PatronPortal.jsx';
import AuditLogs from './pages/AuditLogs.jsx';
import Settings from './pages/Settings.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

// Guard for staff only
const StaffRoute = ({ children }) => {
  const { user, isStaff, loading } = useAuth();
  if (loading) return null;
  if (!user || !isStaff) return <Navigate to="/catalog" replace />;
  return children;
};

// Guard for admin only
const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!user || !isAdmin) return <Navigate to="/" replace />;
  return children;
};

export const App = () => {
  const { user, isStaff } = useAuth();

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0f172a',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '600',
          },
        }}
      />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<AppLayout />}>
          {/* Main index: Dashboard for staff, Catalog for members */}
          <Route
            path="/"
            element={isStaff ? <Dashboard /> : <Catalog />}
          />
          <Route path="/catalog" element={<Catalog />} />

          {/* Staff circulation & inventory */}
          <Route
            path="/circulation"
            element={
              <StaffRoute>
                <CirculationDesk />
              </StaffRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <StaffRoute>
                <Inventory />
              </StaffRoute>
            }
          />
          <Route
            path="/members"
            element={
              <StaffRoute>
                <Members />
              </StaffRoute>
            }
          />

          {/* Holds & Fines accessible by both staff and members */}
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/fines" element={<Fines />} />

          {/* Member self-service portal */}
          <Route path="/portal" element={<PatronPortal />} />

          {/* Admin only */}
          <Route
            path="/audit-logs"
            element={
              <AdminRoute>
                <AuditLogs />
              </AdminRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <AdminRoute>
                <Settings />
              </AdminRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
