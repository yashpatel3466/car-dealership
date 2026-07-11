import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

function RequireAuth({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function Shell() {
  const { user, isAdmin, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <span className="brand">
          Overdrive <span className="brand-accent">Motors</span>
        </span>
        {user && (
          <div className="topbar-user">
            <span className="user-chip">
              {user.username} {isAdmin && <span className="role-badge">ADMIN</span>}
            </span>
            <button className="btn btn-ghost" onClick={logout}>
              Sign out
            </button>
          </div>
        )}
      </header>
      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Shell />
      </Router>
    </AuthProvider>
  );
}
