import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { EmbeddingFun } from "../../Gemini";
import pLimit from "p-limit";

const prisma = new PrismaClient();

interface ManimMethod {
  name: string;
  signature: string;
  doc: string;
}

async function main() {
  // 1️⃣ Load JSON
  const jsonPath = path.join(process.cwd(), "app/manimDoc.json");
  const methods: ManimMethod[] = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  console.log(`📂 Loaded ${methods.length} methods from JSON`);

  const BATCH_SIZE = 50;
  const CONCURRENCY = 10; // number of methods processed in parallel
  const limit = pLimit(CONCURRENCY);

  for (let i = 0; i < methods.length; i += BATCH_SIZE) {
    const batch = methods.slice(i, i + BATCH_SIZE);
    console.log(`➡️ Processing batch ${i / BATCH_SIZE + 1} (${batch.length} methods)`);

    // Process methods in parallel with limit
    await Promise.all(
      batch.map((method) =>
        limit(async () => {
          try {
            // 2️⃣ Check if method already exists
            const exists = await prisma.manim.findUnique({ where: { name: method.name } });
            if (exists) {
              console.log(`⚪ Skipped existing: ${method.name}`);
              return;
            }

            // 3️⃣ Generate embedding
            const embedding = await EmbeddingFun(method.signature + " " + method.doc);
            console.log(`🟢 Embedding generated for: ${method.name}`);

            // 4️⃣ Insert into DB
            await prisma.$executeRawUnsafe(
              `INSERT INTO "Manim" (name, doc, embedding) VALUES ($1, $2, ' [${embedding.join(",")}] '::vector)`,
              method.name,
              method.doc
            );
            console.log(`✅ Inserted into DB: ${method.name}`);
          } catch (err) {
            console.error(`❌ Error processing ${method.name}:`, err);
          }
        })
      )
    );

    // 5️⃣ Small delay between batches
    await new Promise((res) => setTimeout(res, 200));
    console.log(`💤 Finished batch ${i / BATCH_SIZE + 1}`);
  }

  console.log("🎉 All batches processed!");
}

main()
  .catch((err) => console.error("Fatal error:", err))
  .finally(async () => {
    await prisma.$disconnect();
    console.log("🔌 Prisma disconnected");
  });
