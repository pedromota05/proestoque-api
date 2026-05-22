import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { prisma } from "../prisma/client";
import { config } from "../config";
import { RegistroInput, LoginInput } from "../schemas/auth.schema";

const jwtOptions: SignOptions = {
  expiresIn: config.JWT_EXPIRES_IN as any,
};

export class AuthController {
  async registrar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { nome, email, senha } = req.body as RegistroInput;

      // Verifica se o e-mail já está em uso
      const usuarioExistente = await prisma.usuario.findUnique({
        where: { email },
      });

      if (usuarioExistente) {
        res.status(409).json({
          status: "error",
          message: "Este e-mail já está em uso.",
        });
        return;
      }

      // Criptografa a senha
      const senhaHash = await bcrypt.hash(senha, 10);

      // Cria o usuário
      const usuario = await prisma.usuario.create({
        data: { nome, email, senha: senhaHash },
      });

      // Gera o token JWT
      const token = jwt.sign({ sub: usuario.id }, config.JWT_SECRET, jwtOptions);

      // Retorna sem expor a senha
      const { senha: _, ...usuarioSemSenha } = usuario;

      res.status(201).json({
        token,
        usuario: usuarioSemSenha,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, senha } = req.body as LoginInput;

      // Busca o usuário pelo e-mail
      const usuario = await prisma.usuario.findUnique({
        where: { email },
      });

      if (!usuario) {
        res.status(401).json({
          status: "error",
          message: "E-mail ou senha inválidos.",
        });
        return;
      }

      // Compara a senha
      const senhaValida = await bcrypt.compare(senha, usuario.senha);

      if (!senhaValida) {
        res.status(401).json({
          status: "error",
          message: "E-mail ou senha inválidos.",
        });
        return;
      }

      // Gera o token JWT
      const token = jwt.sign({ sub: usuario.id }, config.JWT_SECRET, jwtOptions);

      // Retorna sem expor a senha
      const { senha: _, ...usuarioSemSenha } = usuario;

      res.status(200).json({
        token,
        usuario: usuarioSemSenha,
      });
    } catch (error) {
      next(error);
    }
  }

  async perfil(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.usuario?.sub as string;

      const usuario = await prisma.usuario.findUnique({
        where: { id: userId },
        select: {
          id: true,
          nome: true,
          email: true,
          criadoEm: true,
        },
      });

      if (!usuario) {
        res.status(404).json({
          status: "error",
          message: "Usuário não encontrado.",
        });
        return;
      }

      res.json({ usuario });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
