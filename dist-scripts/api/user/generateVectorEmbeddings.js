import fs from 'fs';
import { EmbeddingFun } from './../../Gemini';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const methods = JSON.parse(fs.readFileSync('../../app/manimDoc.json', 'utf-8'));
for (const method of methods) {
    const embedding = await EmbeddingFun(method.signature + " " + method.doc);
    // Save to Postgres
    await prisma.$executeRawUnsafe(`INSERT INTO "Manim" ("name", "doc", "embedding") VALUES ($1, $2, $3)`, method.name, method.doc, `[${embedding.join(",")}]` // vector expects array syntax
    );
    console.log("embeddings generated");
}
