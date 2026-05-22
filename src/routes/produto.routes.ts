import { Router } from "express";
import * as ProdutoController from "../controllers/produto.controller";

const router = Router();

router.get("/", ProdutoController.listar);
router.get("/:id", ProdutoController.buscarPorId);
router.post("/", ProdutoController.criar);
router.put("/:id", ProdutoController.atualizar);
router.delete("/:id", ProdutoController.deletar);

export default router;
