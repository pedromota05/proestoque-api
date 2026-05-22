import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(422).json({
          status: "error",
          message: "Erro de validação",
          erros: error.issues.map((e) => ({
            campo: e.path.join("."),
            mensagem: e.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
}
