import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma/client";
import { AppError } from "../middlewares/errorHandler";

export async function listar(req: Request, res: Response, next: NextFunction) {
  try {
    const categorias = await prisma.categoria.findMany({
      include: {
        _count: {
          select: { produtos: true },
        },
      },
      orderBy: { nome: "asc" },
    });

    res.json(categorias);
  } catch (error) {
    next(error);
  }
}

export async function buscarPorId(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;

    const categoria = await prisma.categoria.findUnique({
      where: { id },
      include: {
        _count: {
          select: { produtos: true },
        },
      },
    });

    if (!categoria) {
      throw new AppError("Categoria não encontrada.", 404);
    }

    res.json(categoria);
  } catch (error) {
    next(error);
  }
}
