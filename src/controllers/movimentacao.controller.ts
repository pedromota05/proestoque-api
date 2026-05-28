import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma/client";
import { AppError } from "../middlewares/errorHandler";

export class MovimentacaoController {
  async registrar(req: Request, res: Response, next: NextFunction) {
    try {
      const produtoId = req.params.id as string;
      const { tipo, quantidade, observacao } = req.body;

      const produto = await prisma.produto.findUnique({
        where: { id: produtoId },
      });

      if (!produto) {
        throw new AppError("Produto não encontrado", 404);
      }

      if (tipo === "SAIDA" && quantidade > produto.quantidade) {
        throw new AppError("Saldo insuficiente para esta saída", 400);
      }

      let novaQtd = produto.quantidade;
      if (tipo === "ENTRADA") {
        novaQtd += quantidade;
      } else if (tipo === "SAIDA") {
        novaQtd -= quantidade;
      } else {
        throw new AppError("Tipo de movimentação inválido", 400);
      }

      const [, movimentacao] = await prisma.$transaction([
        prisma.produto.update({
          where: { id: produtoId },
          data: { quantidade: novaQtd, ultimaMovimentacao: new Date() },
        }),
        prisma.movimentacao.create({
          data: {
            tipo,
            quantidade,
            observacao,
            produtoId,
          },
        }),
      ]);

      return res.status(201).json(movimentacao);
    } catch (error) {
      next(error);
    }
  }

  async listarPorProduto(req: Request, res: Response, next: NextFunction) {
    try {
      const produtoId = req.params.id as string;

      const movimentacoes = await prisma.movimentacao.findMany({
        where: { produtoId },
        orderBy: { criadoEm: "desc" },
      });

      return res.json(movimentacoes);
    } catch (error) {
      next(error);
    }
  }
}

export const movimentacaoController = new MovimentacaoController();
