import express from "express";
import cors from "cors";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Healthcheck
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "🚀 ProEstoque API está no ar!",
    timestamp: new Date().toISOString(),
  });
});

// Rotas da API
app.use("/api", routes);

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

export default app;
