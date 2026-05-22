import { Router } from "express";
import * as ProdutoController from "../controllers/produto.controller";
import { autenticar } from "../middlewares/auth";

const router = Router();

// Protege todas as rotas de produtos
router.use(autenticar);

router.get("/", ProdutoController.listar);
router.get("/:id", ProdutoController.buscarPorId);
router.post("/", ProdutoController.criar);
router.put("/:id", ProdutoController.atualizar);
router.delete("/:id", ProdutoController.deletar);

export default router;
