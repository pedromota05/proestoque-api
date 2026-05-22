import { Router } from "express";
import { movimentacaoController } from "../controllers/movimentacao.controller";

const router = Router();

router.post("/:id/movimentacao", movimentacaoController.registrar);
router.get("/:id/movimentacao", movimentacaoController.listarPorProduto);

export default router;
