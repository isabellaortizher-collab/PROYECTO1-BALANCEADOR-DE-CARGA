import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import postsRoutes from "./routes/posts.js";

const app = express();
const port = process.env.PORT || 3002;

app.use(helmet());


app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "blog-api" });
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/auth/login" && req.method === "POST"
});

app.use("/api", apiLimiter);

app.use("/api/blog", postsRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API do mini blog em execucao." });
});

// [VULN] Security Misconfiguration — sem protecao CSRF para endpoints state-changing.
// [VULN] Security Misconfiguration — erros detalhados (incluindo stack em dev) retornados ao cliente.
app.use((error, req, res, next) => {
  const status = error.status || 500;
  const payload = {
    message: error.message || "Erro interno do servidor."
  };

  if (process.env.NODE_ENV !== "production") {
    payload.stack = error.stack;
  }

  return res.status(status).json(payload);
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Servidor backend rodando em http://localhost:${port}`);
});
