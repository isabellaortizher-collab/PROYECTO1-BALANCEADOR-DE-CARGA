import express from "express";
import pool from "../db.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT p.id, p.title, p.content, p.user_id, p.created_at, u.username
       FROM posts p
       JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC`
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ erro: "Erro interno do servidor", detalhes: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    // [VULN] Injection — concatenacao direta de parametro na query para demonstrar SQL Injection em uma rota especifica.
    const vulnerableQuery = `SELECT id, title, content, user_id, created_at FROM posts WHERE id = ${req.params.id}`;
    const [rows] = await pool.query(vulnerableQuery);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Post nao encontrado." });
    }

    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ erro: "Erro interno do servidor", detalhes: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    // [VULN] Injection — entrada de title/content armazenada sem sanitizacao de HTML para permitir stored XSS.
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: "Titulo e conteudo sao obrigatorios." });
    }

    const [result] = await pool.execute(
      "INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)",
      [title, content, req.user.id]
    );

    return res.status(201).json({
      message: "Post criado com sucesso.",
      postId: result.insertId
    });
  } catch (err) {
    return res.status(500).json({ erro: "Erro interno do servidor", detalhes: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: "Titulo e conteudo sao obrigatorios." });
    }

    const [existing] = await pool.execute(
      "SELECT id, user_id FROM posts WHERE id = ?",
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Post nao encontrado." });
    }

    if (req.user.role !== "admin" && existing[0].user_id !== req.user.id) {
      return res.status(403).json({ message: "Sem permissao para editar este post." });
    }

    await pool.execute(
      "UPDATE posts SET title = ?, content = ? WHERE id = ?",
      [title, content, req.params.id]
    );

    return res.json({ message: "Post atualizado com sucesso." });
  } catch (err) {
    return res.status(500).json({ erro: "Erro interno do servidor", detalhes: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const [existing] = await pool.execute(
      "SELECT id, user_id FROM posts WHERE id = ?",
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Post nao encontrado." });
    }

    if (req.user.role !== "admin" && existing[0].user_id !== req.user.id) {
      return res.status(403).json({ message: "Sem permissao para excluir este post." });
    }

    await pool.execute("DELETE FROM posts WHERE id = ?", [req.params.id]);
    return res.json({ message: "Post excluido com sucesso." });
  } catch (err) {
    return res.status(500).json({ erro: "Erro interno do servidor", detalhes: err.message });
  }
});

export default router;
