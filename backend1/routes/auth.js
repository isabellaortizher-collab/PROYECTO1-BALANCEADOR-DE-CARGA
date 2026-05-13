import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import pool from "../db.js";

const router = express.Router();

const registerValidation = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("O username deve ter entre 3 e 50 caracteres.")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Use apenas letras, numeros e underscore."),
  body("password")
    .isLength({ min: 6, max: 128 })
    .withMessage("A senha deve ter entre 6 e 128 caracteres.")
];

const loginValidation = [
  body("username").trim().notEmpty().withMessage("Username obrigatorio."),
  body("password").notEmpty().withMessage("Senha obrigatoria.")
];

router.post("/register", registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    const [existingUsers] = await pool.execute(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: "Usuario ja existe." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await pool.execute(
      "INSERT INTO users (username, password, role) VALUES (?, ?, 'user')",
      [username, hashedPassword]
    );

    return res.status(201).json({ message: "Cadastro realizado com sucesso." });
  } catch (err) {
    return res.status(500).json({ erro: "Erro interno do servidor", detalhes: err.message });
  }
});

router.post("/login", loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // [VULN] Identification and Authentication Failures — rota de login sem rate limiting para permitir teste de brute force.
    const { username, password } = req.body;
    const [rows] = await pool.execute(
      "SELECT id, username, password, role FROM users WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Credenciais invalidas." });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Credenciais invalidas." });
    }

    // [VULN] Security Misconfiguration — fallback para segredo fraco quando JWT_SECRET esta ausente.
    const secret = process.env.JWT_SECRET || "secret";

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      secret,
      { expiresIn: "1h" }
    );

    return res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (err) {
    return res.status(500).json({ erro: "Erro interno do servidor", detalhes: err.message });
  }
});

export default router;
