import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { blogApi } from "../api/axios";

export default function EditPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", content: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPost = async () => {
      try {
        const response = await blogApi.get(`/blog/${id}`);
        setForm({
          title: response.data.title,
          content: response.data.content
        });
      } catch (err) {
        setError(err.response?.data?.message || "Erro ao carregar post.");
      }
    };
    loadPost();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await blogApi.put(`/blog/${id}`, form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao atualizar post.");
    }
  };

  return (
    <section className="editor-shell page">
      <h1 className="page-title">// EDITAR POST</h1>
      <form onSubmit={handleSubmit} className="form-grid">
        <label className="field-label" htmlFor="title">
          Titulo
        </label>
        <input
          id="title"
          className="input lg"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Titulo do post"
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
          placeholder="Conteudo do post"
          required
        />
        <p className="counter muted mono">{form.content.length} / ∞ caracteres</p>
        <button type="submit" className="btn-primary">
          Salvar alteracoes
        </button>
        <Link className="muted" to="/">
          Cancelar
        </Link>
      </form>
      {error && <p className="error-pill">{error}</p>}
    </section>
  );
}
