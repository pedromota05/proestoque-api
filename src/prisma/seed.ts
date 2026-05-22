import { prisma } from "./client";

const categorias = [
  { id: "cat-bebidas", nome: "Bebidas", icone: "🥤", cor: "#3B82F6" },
  { id: "cat-alimentos", nome: "Alimentos", icone: "🍎", cor: "#22C55E" },
  { id: "cat-limpeza", nome: "Limpeza", icone: "🧹", cor: "#A855F7" },
  { id: "cat-eletronicos", nome: "Eletrônicos", icone: "💻", cor: "#F59E0B" },
  { id: "cat-papelaria", nome: "Papelaria", icone: "📝", cor: "#EF4444" },
];

async function main() {
  console.log("🌱 Iniciando seed...");

  for (const categoria of categorias) {
    await prisma.categoria.upsert({
      where: { id: categoria.id },
      update: {},
      create: categoria,
    });
    console.log(`  ✅ Categoria "${categoria.nome}" criada/atualizada.`);
  }

  console.log("🌱 Seed finalizado com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
