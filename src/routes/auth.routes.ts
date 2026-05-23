import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate";
import { autenticar } from "../middlewares/auth";
import { registroSchema, loginSchema } from "../schemas/auth.schema";

const router = Router();

router.post("/registro", validate(registroSchema), authController.registrar);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.get("/me", autenticar, authController.perfil);

export default router;
