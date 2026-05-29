import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { prisma } from "../prisma/client";
import { config } from "../config";
import { RegistroInput, LoginInput, SolicitarResetInput, RedefinirSenhaInput } from "../schemas/auth.schema";
import { AppError } from "../middlewares/errorHandler";

const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
  },
});

function generateRefreshToken(): string {
  return crypto.randomBytes(40).toString('hex');
}

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

      // Gera os tokens
      const refreshToken = generateRefreshToken();

      // Cria o usuário
      const usuario = await prisma.usuario.create({
        data: { nome, email, senha: senhaHash, refreshToken },
      });

      // Gera o token JWT (curta duração)
      const token = jwt.sign({ sub: usuario.id }, config.JWT_SECRET, { expiresIn: '15m' });

      // Retorna sem expor a senha
      const { senha: _, ...usuarioSemSenha } = usuario;

      res.status(201).json({
        token,
        refreshToken,
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

      // Gera os tokens
      const refreshToken = generateRefreshToken();
      const token = jwt.sign({ sub: usuario.id }, config.JWT_SECRET, { expiresIn: '15m' });

      // Atualiza o refresh token no banco
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { refreshToken },
      });

      // Retorna sem expor a senha
      const { senha: _, ...usuarioSemSenha } = usuario;

      res.status(200).json({
        token,
        refreshToken,
        usuario: usuarioSemSenha,
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(401).json({
          status: "error",
          message: "Refresh token não fornecido.",
        });
        return;
      }

      // Busca o usuário pelo refresh token
      const usuario = await prisma.usuario.findFirst({
        where: { refreshToken },
      });

      if (!usuario) {
        res.status(401).json({
          status: "error",
          message: "Refresh token inválido ou expirado.",
        });
        return;
      }

      // Gera novos tokens (Rotation)
      const novoRefreshToken = generateRefreshToken();
      const token = jwt.sign({ sub: usuario.id }, config.JWT_SECRET, { expiresIn: '15m' });

      // Atualiza o refresh token no banco
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { refreshToken: novoRefreshToken },
      });

      res.status(200).json({
        token,
        refreshToken: novoRefreshToken,
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

  async solicitarReset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body as SolicitarResetInput;

      const usuario = await prisma.usuario.findUnique({ where: { email } });

      // Retorna 200 sempre por segurança
      if (!usuario) {
        res.json({ message: "Se o e-mail existir em nossa base, enviaremos um link de recuperação." });
        return;
      }

      // Limpa tokens antigos
      await prisma.resetToken.deleteMany({ where: { usuarioId: usuario.id } });

      // Gera novo token
      const token = crypto.randomBytes(64).toString("hex");

      await prisma.resetToken.create({
        data: {
          token,
          usuarioId: usuario.id,
          expiraEm: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
        },
      });

      // Envia o e-mail
      const link = `${config.FRONTEND_URL}/redefinir-senha?token=${token}`;

      await transporter.sendMail({
        from: '"ProEstoque" <no-reply@proestoque.com>',
        to: usuario.email,
        subject: "Recuperação de Senha - ProEstoque",
        html: `
          <h3>Olá, ${usuario.nome}!</h3>
          <p>Você solicitou a redefinição da sua senha.</p>
          <p>Clique no link abaixo para criar uma nova senha:</p>
          <p><a href="${link}">${link}</a></p>
          <p>Se você não solicitou isso, pode ignorar este e-mail.</p>
        `,
      });

      res.json({ message: "Se o e-mail existir em nossa base, enviaremos um link de recuperação." });
    } catch (error) {
      next(error);
    }
  }

  async redefinirSenha(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, novaSenha } = req.body as RedefinirSenhaInput;

      const resetToken = await prisma.resetToken.findUnique({
        where: { token },
      });

      if (!resetToken || resetToken.expiraEm < new Date()) {
        throw new AppError("Token inválido ou expirado.", 400);
      }

      // Criptografa nova senha
      const senhaHash = await bcrypt.hash(novaSenha, 10);

      // Atualiza o usuário
      await prisma.usuario.update({
        where: { id: resetToken.usuarioId },
        data: { senha: senhaHash },
      });

      // Limpa os tokens do usuário
      await prisma.resetToken.deleteMany({
        where: { usuarioId: resetToken.usuarioId },
      });

      res.json({ message: "Senha redefinida com sucesso!" });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
