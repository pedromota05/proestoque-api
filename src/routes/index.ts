import { Router } from "express";
import authRouter from "./auth.routes";
import produtoRouter from "./produto.routes";
import categoriaRouter from "./categoria.routes";
import movimentacaoRouter from "./movimentacao.routes";

const router = Router();

// Rotas públicas (autenticação)
router.use("/auth", authRouter);

// Rotas privadas (protegidas por JWT)
router.use("/produtos", produtoRouter);
router.use("/produtos", movimentacaoRouter);
router.use("/categorias", categoriaRouter);

export default router;
