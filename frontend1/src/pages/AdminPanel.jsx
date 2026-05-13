import { useEffect, useState } from "react";
import { authApi, blogApi } from "../api/axios";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [postsCount, setPostsCount] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const [usersResponse, postsResponse] = await Promise.all([
        authApi.get("/admin/users"),
        blogApi.get("/blog")
      ]);
      setUsers(usersResponse.data);
      setPostsCount(postsResponse.data.length);
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao carregar usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleRole = async (user) => {
    const nextRole = user.role === "admin" ? "user" : "admin";
    try {
      await authApi.put(`/admin/users/${user.id}/role`, { role: nextRole });
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao atualizar role.");
    }
  };

  const totalAdmins = users.filter((user) => user.role === "admin").length;

  return (
    <section className="page">
      <div className="admin-title-row">
        <h1 className="page-title">// PAINEL DE ADMINISTRACAO</h1>
        <span className="warn-badge">⚠ ACESSO RESTRITO</span>
      </div>
      {error && <p className="error-pill">{error}</p>}

      <div className="stats-grid">
        <article className="stat-card users">
          <p className="muted">Total de usuarios</p>
          <div className="stat-value">{users.length}</div>
        </article>
        <article className="stat-card posts">
          <p className="muted">Total de posts</p>
          <div className="stat-value">{postsCount}</div>
        </article>
        <article className="stat-card admins">
          <p className="muted">Total de admins</p>
          <div className="stat-value">{totalAdmins}</div>
        </article>
      </div>

      {loading ? (
        <div className="loading-wrap">
          <div className="pulse-dot" />
          <p className="muted mono">Carregando painel...</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Role</th>
                <th>Acao</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="mono">{user.id}</td>
                  <td>{user.username}</td>
                  <td>
                    <span className={`role-pill ${user.role}`}>{user.role}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => toggleRole(user)}
                      className={`btn-pill ${user.role === "admin" ? "red" : "green"}`}
                    >
                      {user.role === "admin" ? "Rebaixar" : "Promover"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
