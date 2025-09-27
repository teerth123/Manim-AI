"use server";
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { embed } from 'ai';
export async function X({ prompt }) {
    const model = google('gemini-2.5-flash');
    const { text, reasoning } = await generateText({
        model: model,
        system: `You are a professional prompt engineer specializing in generating Manim visualizations ` +
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
            `Prioritize subtle dark-mode aesthetics, and ensure the visuals are easy to follow.`,
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
    // console.log(LLMRepsonse)
    // return Response.json({
    //   LLMRepsonse
    // })
}
export async function EmbeddingFun(prompt) {
    const model = google.textEmbedding(`text-embedding-004`);
    const { embedding } = await embed({
        model,
        value: prompt,
    });
    return embedding;
}
