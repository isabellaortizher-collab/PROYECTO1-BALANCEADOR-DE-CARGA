import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/axios";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    try {
      await authApi.post("/auth/register", form);
      setSuccess("Cadastro realizado. Voce sera redirecionado para login.");
      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      const apiMessage =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        "Falha ao cadastrar usuario.";
      setError(apiMessage);
    }
  };

  return (
    <section className="auth-wrap">
      <article className="auth-card page">
        <div className="auth-icon mono">[🛡️]</div>
        <h1 className="auth-title">REGISTRO</h1>
        <p className="muted">Crie sua conta para participar do mini forum.</p>
        <form onSubmit={handleSubmit} className="form-grid">
          <label className="field-label" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            className="input"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="novo_usuario"
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
            Registrar
          </button>
        </form>
        {error && <p className="error-pill">{error}</p>}
        {success && <p className="success-pill">{success}</p>}
        <p className="muted">
          Ja possui conta?{" "}
          <Link to="/login" className="text-link">
            Entrar
          </Link>
        </p>
      </article>
    </section>
  );
}
