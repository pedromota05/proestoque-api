import { Router } from "express";
import * as CategoriaController from "../controllers/categoria.controller";

const router = Router();

router.get("/", CategoriaController.listar);
router.get("/:id", CategoriaController.buscarPorId);

export default router;
