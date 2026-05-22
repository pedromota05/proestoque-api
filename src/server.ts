import "dotenv/config";
import app from "./app";
import { prisma } from "./prisma/client";

const PORT = process.env.PORT || 3333;

prisma
  .$connect()
  .then(() => {
    console.log("📦 Banco de dados conectado com sucesso!");

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
      console.log(`📋 API disponível em http://localhost:${PORT}/api`);
    });
  })
  .catch((error) => {
    console.error("❌ Erro ao conectar no banco de dados:", error);
    process.exit(1);
  });
