import { useState } from "react";
import { Link, NavLink, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import CreatePostPage from "./pages/CreatePostPage";
import EditPostPage from "./pages/EditPostPage";
import AdminPanel from "./pages/AdminPanel";
import { useAuth } from "./context/AuthContext";

function Layout({ children }) {
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navClass = ({ isActive }) => `nav-link${isActive ? " active" : ""}`;

  return (
    <div className="app-shell">
      <header className="navbar">
        <div className="container nav-inner">
          <Link className="logo" to="/">
            Mini Forum Seguro/Lab
          </Link>
          <button className="menu-toggle" type="button" onClick={() => setMenuOpen((prev) => !prev)}>
            ☰
          </button>
          <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
            {isAuthenticated && (
              <>
                <NavLink className={navClass} to="/" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </NavLink>
                <NavLink className={navClass} to="/posts/new" onClick={() => setMenuOpen(false)}>
                  Novo Post
                </NavLink>
                {user?.role === "admin" && (
                  <NavLink className={navClass} to="/admin" onClick={() => setMenuOpen(false)}>
                    Painel Admin
                  </NavLink>
                )}
              </>
            )}
            {!isAuthenticated && (
              <>
                <NavLink className={navClass} to="/login" onClick={() => setMenuOpen(false)}>
                  Entrar
                </NavLink>
                <NavLink className={navClass} to="/register" onClick={() => setMenuOpen(false)}>
                  Cadastrar
                </NavLink>
              </>
            )}
          </nav>
          <div className="nav-right">
            {isAuthenticated ? (
              <>
                <span className="badge-user">{user?.username}</span>
                <button className="btn-logout" type="button" onClick={logout}>
                  Sair
                </button>
              </>
            ) : null}
          </div>
        </div>
      </header>
      <main className="container page">{children}</main>
    </div>
  );
}

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/posts/new"
          element={
            <PrivateRoute>
              <CreatePostPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/posts/:id/edit"
          element={
            <PrivateRoute>
              <EditPostPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />
      </Routes>
    </Layout>
  );
}
