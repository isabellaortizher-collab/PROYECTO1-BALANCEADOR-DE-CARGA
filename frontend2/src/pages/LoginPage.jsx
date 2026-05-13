import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const response = await authApi.post("/auth/login", form);
      login(response.data.token, response.data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Falha no login.");
    }
  };

  return (
    <section className="auth-wrap">
      <article className="auth-card page">
        <div className="auth-icon mono">[🔒]</div>
        <h1 className="auth-title">LOGIN SEGURO</h1>
        <p className="muted">Acesse sua conta para continuar no laboratorio.</p>
        <form onSubmit={handleSubmit} className="form-grid">
          <label className="field-label" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            className="input"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="seu_usuario"
            required
          />
          <label className="field-label" htmlFor="password">
            Senha
          </label>
          <input
            id="password"
            className="input"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="********"
            required
          />
          <button type="submit" className="btn-primary">
            Entrar
          </button>
        </form>
        {error && <p className="error-pill">{error}</p>}
        <p className="muted">
          Nao tem conta?{" "}
          <Link to="/register" className="text-link">
            Cadastre-se
          </Link>
        </p>
      </article>
    </section>
  );
}
