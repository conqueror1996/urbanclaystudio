'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export type SearchFilters = {
    materials?: string[];
    styles?: string[];
    moods?: string[];
    projectTypes?: string[];
    freeText?: string; // Fallback for things like "Red", "Sunset" 
}

export async function parseSearchQuery(query: string): Promise<SearchFilters> {
    if (!process.env.GEMINI_API_KEY) {
        console.warn("No API Key, falling back to simple text match");
        return { freeText: query };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // We ask AI to map the user's natural language to our specific schema values
    const prompt = `
    You are an AI Search Assistant for an Architectural Material Library.
    Transform the user's search query into structured filters.

    Current Facets:
    - Materials: "Brick Tile", "Exposed Brick", "Terracotta Jali", "Clay Flooring", "Roofing Tile", "Clay Ceiling Tile"
    - Styles: "Modern Minimal", "Rustic", "Heritage", "Industrial", "Contemporary"
    - Project Types: "Residential", "Commercial", "Hospitality", "Public", "Renovation"
    
    User Query: "${query}"

    Instructions:
    1. Extract relevant filters. If the user says "Modern offices with brick", extract Style: "Modern Minimal", Project: "Commercial", Material: "Exposed Brick" (or similar).
    2. Be fuzzy. "Old school" -> "Heritage". "Clean" -> "Modern Minimal".
    3. If there are descriptive words not fitting categories (like "Dark", "Red", "Sunset"), put them in "freeText".
    4. Return JSON only: { materials: [], styles: [], projectTypes: [], freeText: string }.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Smart Search Parsing Failed:", error);
        return { freeText: query };
    }
}
