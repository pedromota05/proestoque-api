import { Request, Response, NextFunction } from "express";
import { Prisma } from "../../generated/prisma/client";

export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Erro customizado da aplicação
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
    return;
  }

  // Erro conhecido do Prisma (ex: violação de unique constraint)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    res.status(409).json({
      status: "error",
      message: "Conflito: o registro já existe ou viola uma restrição do banco de dados.",
    });
    return;
  }

  // Erro genérico / inesperado
  console.error("❌ Erro interno:", err);

  res.status(500).json({
    status: "error",
    message: "Erro interno do servidor.",
  });
}
