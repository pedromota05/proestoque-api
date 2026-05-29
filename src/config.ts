function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`❌ Variável de ambiente obrigatória "${name}" não definida.`);
  }
  return value;
}

export const config = {
  PORT: Number(process.env.PORT) || 3333,
  JWT_SECRET: getEnvVar("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  SMTP_HOST: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:8081",
};
