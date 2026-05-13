import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { blogApi } from "../api/axios";
import { useAuth } from "../context/AuthContext";

function formatDateTime(dateInput) {
  const date = new Date(dateInput);
  return `${date.toLocaleDateString("pt-BR")} ${date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  })}`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const response = await blogApi.get("/blog");
      setPosts(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao carregar posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleDelete = async (id) => {
    try {
      await blogApi.delete(`/blog/${id}`);
      await loadPosts();
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao excluir post.");
    }
  };

  return (
    <section className="page">
      <header className="feed-header">
        <h1 className="page-title">// FEED DE POSTS</h1>
        <Link className="btn-yellow" to="/blog/new">
          Novo Post
        </Link>
      </header>
      {error && <p className="error-pill">{error}</p>}

      {loading ? (
        <div className="loading-wrap">
          <div className="pulse-dot" />
          <p className="muted mono">Carregando feed...</p>
        </div>
      ) : null}

      {!loading && posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⌁</div>
          <p className="muted">Nenhum post ainda no laboratorio.</p>
          <Link className="btn-primary inline-btn" to="/blog/new">
            Criar primeiro post
          </Link>
        </div>
      ) : null}

      {!loading && posts.length > 0 ? (
        <div className="posts-grid">
          {posts.map((post) => {
            const canEdit = user?.role === "admin" || user?.id === post.user_id;
            const isMine = user?.id === post.user_id;

            return (
              <article key={post.id} className="post-card">
                <h3>
                  {post.title}
                  {isMine ? <span className="chip-own">• seu post</span> : null}
                </h3>
                <div className="post-meta">
                  {post.username} - {formatDateTime(post.created_at)}
                </div>
                <div
                  className="post-preview"
                  // [VULN] Injection — renderizacao com dangerouslySetInnerHTML cria sink de stored XSS para conteudo salvo sem sanitizacao.
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
                {canEdit ? (
                  <div className="post-actions">
                    <Link className="btn-pill green" to={`/blog/${post.id}/edit`}>
                      Editar
                    </Link>
                    <button className="btn-pill red" type="button" onClick={() => handleDelete(post.id)}>
                      Excluir
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
