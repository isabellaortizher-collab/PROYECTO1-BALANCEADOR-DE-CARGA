import jwt from "jsonwebtoken";

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token ausente ou invalido." });
  }

  const token = authHeader.split(" ")[1];

  // [VULN] Security Misconfiguration — fallback para segredo fraco quando JWT_SECRET esta ausente.
  const secret = process.env.JWT_SECRET || "secret";

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalido ou expirado." });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Acesso restrito a administradores." });
  }
  return next();
}

export {
  verifyToken,
  requireAdmin
};
