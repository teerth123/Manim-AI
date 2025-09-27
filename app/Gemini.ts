"use server"
import { google } from '@ai-sdk/google';
import { generateText, embed } from 'ai';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from "fs/promises";

const prisma = new PrismaClient();

// Interface for similarity search results
interface SimilarDocument {
  name: string;
  doc: string;
  similarity: number;
}

// Function to perform similarity search using Prisma with raw SQL
async function searchSimilarManimDocs(queryEmbedding: number[], topK: number = 5): Promise<SimilarDocument[]> {
  // Convert embedding array to pgvector format
  const embeddingString = `[${queryEmbedding.join(',')}]`;

  const results = await prisma.$queryRaw`
    SELECT 
      name,
      doc,
      1 - (embedding <=> ${embeddingString}::vector) AS similarity
    FROM "Manim"
    WHERE 1 - (embedding <=> ${embeddingString}::vector) > 0.7
    ORDER BY embedding <=> ${embeddingString}::vector
    LIMIT ${topK}
  ` as Array<{
    name: string;
    doc: string;
    similarity: number;
  }>;

  return results.map(row => ({
    name: row.name,
    doc: row.doc,
    similarity: row.similarity
  }));
}

export async function X({ prompt }: { prompt: string }) {
  const model = google('gemini-2.5-flash');

  try {
    // Get embedding for the user's prompt
    const queryEmbedding = await EmbeddingFun(prompt);

    // Search for similar Manim documentation
    const similarDocs = await searchSimilarManimDocs(queryEmbedding, 5);

    // Construct context from similar documents
    const contextFromDocs = similarDocs
      .map((doc, index) =>
        `=== ${doc.name} (similarity: ${doc.similarity.toFixed(3)}) ===\n${doc.doc}`
      )
      .join('\n\n');

    // Enhanced system prompt with retrieved context
    const enhancedSystemPrompt = `You are a professional prompt engineer specializing in generating Manim visualizations ` +
      `for mathematics and computer science. ` +
      `When generating scenes, always use the Geist Design System colors in dark mode. ` +
      `You are an expert in Manim Community v0.19.0.` +
      `Only use classes, methods, and arguments that exist in this version.` +
      `Do not use features from newer forks or other versions.` +
      `Always generate Python code that can run with v0.19.0.` +
      `Color usage guidelines: ` +
      `- Red 300 (#ff6666): highlights important elements or warnings. ` +
      `- Red 500 (#ff0000): critical elements or attention-grabbing shapes. ` +
      `- Pink 400 (#ff99ff): secondary highlights or decorative elements. ` +
      `- Pink 600 (#ff66ff): accent shapes and subtle highlights. ` +
      `- Blue 500 (#d3a0f0): main informative elements or nodes. ` +
      `- Blue 700 (#d1c6f0): secondary nodes or connecting shapes. ` +
      `- Green 500 (#80e080): success indicators or correct steps. ` +
      `- Green 700 (#4db84d): secondary positive actions or confirmations. ` +
      `- Teal 500 (#80e0e0): neutral shapes or background objects. ` +
      `- Teal 700 (#4db8b8): secondary neutral elements. ` +
      `- Purple 500 (#bf80ff): focus elements or emphasis. ` +
      `- Purple 700 (#a64dff): secondary emphasis. ` +
      `- Gray 1000 (#ffffff): background for high contrast elements. ` +
      `- Gray 800 (#111111): main background. ` +
      `- Gray Alpha 500 (rgba(255,255,255,0.24)): subtle highlights or glows. ` +
      `When responding, you must ONLY provide a single Python Manim code snippet ` +
      `for the given scene. Do NOT include explanations, comments, or any extra text. ` +
      `Always describe Manim scenes cleanly, specifying which colors ` +
      `should be used for shapes, text, highlights, and backgrounds. ` +
      `Prioritize subtle dark-mode aesthetics, and ensure the visuals are easy to follow.` +
      (contextFromDocs ? `\n\n=== RELEVANT MANIM DOCUMENTATION FOR REFERENCE ===\n${contextFromDocs}\n\nIMPORTANT: Use the above documentation as your primary reference for correct syntax, methods, and best practices. Make sure your generated code follows these exact patterns and uses only the methods, classes, and parameters shown in the documentation above. Do not use any methods or classes not mentioned in the provided documentation.` : '');

    const { text, reasoning } = await generateText({
      model: model,
      system: enhancedSystemPrompt,
      prompt: prompt,
      providerOptions: {
        google: {
          thinkingConfig: {
            thinkingBudget: 8192,
            includeThoughts: true,
          },
        },
      },
    });

    console.log('Retrieved similar docs:', similarDocs.map(d => d.name));
    console.log(reasoning);

    const filePath = path.join(process.cwd(), "manimations", "vector.py");
    await fs.writeFile(filePath, text, { encoding: "utf-8" });

    return text;
  } catch (error) {
    console.error('Error in X function:', error);
    // Fallback to original behavior if similarity search fails
    const { text, reasoning } = await generateText({
      model: model,
      system: `You are a professional prompt engineer specializing in generating Manim visualizations ` +
        `for mathematics and computer science. ` +
        `When generating scenes, always use the Geist Design System colors in dark mode. ` +
        `You are an expert in Manim Community v0.19.0.` +
        `Only use classes, methods, and arguments that exist in this version.` +
        `Do not use features from newer forks or other versions.` +
        `Always generate Python code that can run with v0.19.0.` +
        `When responding, you must ONLY provide a single Python Manim code snippet ` +
        `for the given scene. Do NOT include explanations, comments, or any extra text.`,
      prompt: prompt,
      providerOptions: {
        google: {
          thinkingConfig: {
            thinkingBudget: 8192,
            includeThoughts: true,
          },
        },
      },
    });

    console.log(reasoning);


    return text;
  } finally {
    await prisma.$disconnect();
  }
}

export async function EmbeddingFun(prompt: string) {
  const model = google.textEmbedding(`text-embedding-004`);
  const { embedding } = await embed({
    model,
    value: prompt,
  });
  return embedding;
}