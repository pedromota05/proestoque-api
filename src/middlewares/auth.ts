import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config";

// Estende a interface Request do Express para incluir o payload do JWT
declare global {
  namespace Express {
    interface Request {
      usuario?: JwtPayload;
    }
  }
}

export function autenticar(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      status: "error",
      message: "Token de autenticação não fornecido.",
    });
    return;
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    res.status(401).json({
      status: "error",
      message: "Token mal formatado.",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    req.usuario = decoded;
    next();
  } catch {
    res.status(401).json({
      status: "error",
      message: "Token inválido ou expirado.",
    });
  }
}
