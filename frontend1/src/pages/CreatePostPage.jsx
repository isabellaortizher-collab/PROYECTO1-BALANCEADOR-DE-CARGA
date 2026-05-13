import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { blogApi } from "../api/axios";

export default function CreatePostPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", content: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await blogApi.post("/blog", form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao criar post.");
    }
  };

  return (
    <section className="editor-shell page">
      <h1 className="page-title">// NOVO POST</h1>
      <form onSubmit={handleSubmit} className="form-grid">
        <label className="field-label" htmlFor="title">
          Titulo
        </label>
        <input
          id="title"
          className="input lg"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Digite um titulo impactante"
          required
        />
        <label className="field-label" htmlFor="content">
          Conteudo
        </label>
        <textarea
          id="content"
          className="textarea mono"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          placeholder="Conteudo (HTML permitido para laboratorio de XSS)"
          required
        />
        <p className="counter muted mono">{form.content.length} / ∞ caracteres</p>
        <button type="submit" className="btn-primary">
          Publicar
        </button>
        <Link className="muted" to="/">
          Cancelar
        </Link>
      </form>
      {error && <p className="error-pill">{error}</p>}
    </section>
  );
}
