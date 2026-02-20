import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding products...");

  await prisma.product.createMany({
    data: [
      {
        name: "Royal Stag",
        brand: "Royal",
        category: "IML",
        unitSize: "750ml",
        basePrice: 800
      },
      {
        name: "Tuborg Beer",
        brand: "Tuborg",
        category: "BEER",
        unitSize: "650ml",
        basePrice: 150
      },
      {
        name: "Blenders Pride",
        brand: "BP",
        category: "IML",
        unitSize: "180ml",
        basePrice: 120
      }
    ]
  });

  console.log("Seeding complete ✅");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });