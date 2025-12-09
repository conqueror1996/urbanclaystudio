'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function analyzeImage(formData: FormData) {
    const file = formData.get("file") as File;

    if (!file) {
        throw new Error("No file uploaded");
    }

    // If no API Key is set, return a mock response for now to prevent crashing
    if (!process.env.GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY is not set. Returning mock analysis.");
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        return {
            style: "Modern Minimal",
            material: "Exposed Brick"
        };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return analyzeBuffer(buffer, file.type);
}

export async function analyzeBuffer(buffer: Buffer, mimeType: string) {
    if (!process.env.GEMINI_API_KEY) {
        return { style: "Modern Minimal", material: "Exposed Brick" };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const base64 = buffer.toString('base64');

    // We give the AI clear "Visual Definitions" to look for
    const prompt = `Analyze this architectural image and classify the primary material.
  
    Use these definitions to decide:
    - "Terracotta Jali": Look for perforated blocks, lattice patterns, see-through screens, or intricate geometric breathing walls.
    - "Roofing Tile": Look for sloping surfaces, interlocking clay tiles (Mangalore/Spanish style) on top of a structure.
    - "Clay Flooring": Look for ground-level paving, square or rectangular clay tiles used for walking paths, patios, or interiors.
    - "Brick Tile": Look for thin, flat brick-like faces on vertical walls. Distinct from full masonry.
    - "Exposed Brick": Look for structural full-sized masonry walls, often rougher texture.
    
    3. Generate a Commercial Product Name: Combine the [Color] + [Texture/Form] + [Category]. 
       Examples: "Antique Red Jali", "Smoke Grey Linear Brick", "Weathered Terracotta Paver".
       Keep it professional, architectural, and under 5 words.

    Return JSON only: { "style": string, "material": string, "name": string }`;

    try {
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64,
                    mimeType: mimeType
                }
            }
        ]);
        const response = await result.response;
        const text = response.text();

        // Cleanup potential markdown formatting
        const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("AI Analysis failed:", error);
        return null;
    }
}
