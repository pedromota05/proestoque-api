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
};
