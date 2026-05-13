import express from "express";
import pool from "../db.js";
import { verifyToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.use(verifyToken, requireAdmin);

router.get("/users", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, username, role, created_at FROM users ORDER BY created_at DESC"
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ erro: "Erro interno do servidor", detalhes: err.message });
  }
});

router.put("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    if (!["admin", "user"].includes(role)) {
      return res.status(400).json({ message: "Role invalida. Use admin ou user." });
    }

    const [rows] = await pool.execute("SELECT id FROM users WHERE id = ?", [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario nao encontrado." });
    }

    await pool.execute("UPDATE users SET role = ? WHERE id = ?", [role, req.params.id]);
    return res.json({ message: "Role atualizada com sucesso." });
  } catch (err) {
    return res.status(500).json({ erro: "Erro interno do servidor", detalhes: err.message });
  }
});

export default router;
