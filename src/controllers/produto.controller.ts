import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma/client";
import { AppError } from "../middlewares/errorHandler";

export async function listar(req: Request, res: Response, next: NextFunction) {
  try {
    const busca = req.query.busca as string | undefined;
    const categoriaId = req.query.categoriaId as string | undefined;
    const apenasAlerta = req.query.apenasAlerta as string | undefined;
    const pagina = (req.query.pagina as string) || "1";
    const limite = (req.query.limite as string) || "20";

    const paginaNum = Math.max(1, Number(pagina));
    const limiteNum = Math.max(1, Math.min(100, Number(limite)));

    const where: any = {};

    if (busca) {
      where.nome = {
        contains: String(busca),
        // SQLite não suporta mode: "insensitive" nativamente
      };
    }

    if (categoriaId) {
      where.categoriaId = String(categoriaId);
    }

    if (apenasAlerta === "true") {
      where.quantidade = {
        lt: prisma.produto.fields.quantidadeMinima,
      };
    }

    // Para o filtro apenasAlerta, buscar todos e filtrar em memória
    // pois Prisma/SQLite não suporta comparação entre colunas diretamente
    if (apenasAlerta === "true") {
      const todosProdutos = await prisma.produto.findMany({
        where: {
          ...(busca ? { nome: { contains: String(busca) } } : {}),
          ...(categoriaId ? { categoriaId: String(categoriaId) } : {}),
        },
        include: { categoria: true },
        orderBy: { nome: "asc" },
      });

      const produtosAlerta = todosProdutos.filter(
        (p) => p.quantidade < p.quantidadeMinima
      );

      const total = produtosAlerta.length;
      const inicio = (paginaNum - 1) * limiteNum;
      const produtosPaginados = produtosAlerta.slice(inicio, inicio + limiteNum);

      res.json({
        dados: produtosPaginados,
        paginacao: {
          pagina: paginaNum,
          limite: limiteNum,
          total,
          totalPaginas: Math.ceil(total / limiteNum),
        },
      });
      return;
    }

    const [produtos, total] = await Promise.all([
      prisma.produto.findMany({
        where,
        include: { categoria: true },
        orderBy: { nome: "asc" },
        skip: (paginaNum - 1) * limiteNum,
        take: limiteNum,
      }),
      prisma.produto.count({ where }),
    ]);

    res.json({
      dados: produtos,
      paginacao: {
        pagina: paginaNum,
        limite: limiteNum,
        total,
        totalPaginas: Math.ceil(total / limiteNum),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function buscarPorId(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;

    const produto = await prisma.produto.findUnique({
      where: { id },
      include: { categoria: true },
    });

    if (!produto) {
      throw new AppError("Produto não encontrado.", 404);
    }

    res.json(produto);
  } catch (error) {
    next(error);
  }
}

export async function criar(req: Request, res: Response, next: NextFunction) {
  try {
    const { nome, preco, categoriaId, quantidade, quantidadeMinima, unidade, observacao, foto } = req.body;

    if (!nome || preco === undefined || !categoriaId) {
      throw new AppError("Os campos 'nome', 'preco' e 'categoriaId' são obrigatórios.", 400);
    }

    const produto = await prisma.produto.create({
      data: {
        nome,
        preco: Number(preco),
        categoriaId,
        quantidade: quantidade !== undefined ? Number(quantidade) : 0,
        quantidadeMinima: quantidadeMinima !== undefined ? Number(quantidadeMinima) : 0,
        unidade: unidade || "un",
        observacao: observacao || null,
        foto: foto || null,
      },
      include: { categoria: true },
    });

    res.status(201).json(produto);
  } catch (error) {
    next(error);
  }
}

export async function atualizar(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { nome, preco, categoriaId, quantidade, quantidadeMinima, unidade, observacao, foto } = req.body;

    const produtoExistente = await prisma.produto.findUnique({ where: { id } });

    if (!produtoExistente) {
      throw new AppError("Produto não encontrado.", 404);
    }

    const produto = await prisma.produto.update({
      where: { id },
      data: {
        ...(nome !== undefined && { nome }),
        ...(preco !== undefined && { preco: Number(preco) }),
        ...(categoriaId !== undefined && { categoriaId }),
        ...(quantidade !== undefined && { quantidade: Number(quantidade) }),
        ...(quantidadeMinima !== undefined && { quantidadeMinima: Number(quantidadeMinima) }),
        ...(unidade !== undefined && { unidade }),
        ...(observacao !== undefined && { observacao }),
        ...(foto !== undefined && { foto }),
        ultimaMovimentacao: new Date(),
      },
      include: { categoria: true },
    });

    res.json(produto);
  } catch (error) {
    next(error);
  }
}

export async function deletar(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;

    const produtoExistente = await prisma.produto.findUnique({ where: { id } });

    if (!produtoExistente) {
      throw new AppError("Produto não encontrado.", 404);
    }

    await prisma.produto.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
