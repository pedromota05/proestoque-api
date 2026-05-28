import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

// Puxa a URL de conexão do Render (ou do seu .env local)
const connectionString = process.env.DATABASE_URL;

// Cria o motor de conexão do Postgres
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Entrega o motor para o Prisma
export const prisma = new PrismaClient({ adapter });