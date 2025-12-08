"use server";

import { client } from "./sanity";
import { AIImageMetadata } from "./types";

/**
 * MOCK: Simulates the "Nano Banana" AI Generation process.
 * In production, this would call your custom FLUX/Stable Diffusion API.
 */
// 1. Define the Real AI Generation Function (OpenAI DALL-E 3)
export async function generateArchitectureImage(metadata: AIImageMetadata): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        console.warn("⚠️ No OPENAI_API_KEY found. Falling back to Mock mode.");
        return getMockImage(metadata.style);
    }

    try {
        console.log("🎨 Generatng Real AI Image with DALL-E 3...");

        // 1. Enrich the Material Description
        const materialDescriptors: Record<string, string> = {
            'Brick Tile': 'architectural facade clad in sleek, thin brick tiles with precise grouting. The focus is on the repetitive bond pattern and the texture of the clay tiles.',
            'Exposed Brick': 'raw, textured exposed solid brickwork. The bricks have a natural, handmade clay surface structure, rustic and authentic.',
            'Clay Ceiling Tile': 'exposed vaulted ceiling constructed from terracotta clay ceiling tiles (jack arch or catalan vault style). The image looks upwards or at the interior ceiling structure.',
            'Clay Flooring Tile': 'premium terracotta clay flooring tiles arranged in a herringbone or geometric pattern. Low angle shot focusing on the floor texture and finish.',
            'Brick Pavers': 'a landscaped pathway or patio paved with durable clay brick pavers. Weathered, natural texture.',
            'Terracotta Jali': 'intricate perforated terracotta jali screen wall (breeze blocks). Sunlight is filtering through the geometric patterns, casting dramatic shadows.',
            'Clay Facade Panels': 'modern ventilated facade system using large-format terracotta clay panels. Sleek, linear, and high-tech architectural finish.'
        };

        const richMaterialDescription = materialDescriptors[metadata.material] || `${metadata.material} architectural elements`;

        // 2. Construct a Product-Centric Prompt
        // We force the AI to focus on the MATERIAL application, not just a generic house.
        const prompt = `Architectural closeup photography of a ${metadata.projectType} feature wall using ${metadata.material}.
        
        Subject: ${richMaterialDescription}.
        
        Style: ${metadata.style} architecture.
        Material Color: ${metadata.colorProfile}.
        Lighting: ${metadata.lightingStyle}, emphasizing the tactile texture of the ${metadata.material}.
        Environment: ${metadata.climate}.
        
        Composition: The image must be a "Feature Shot" or "Detail Shot" where the ${metadata.material} takes up 70% of the frame. It should showcase the build quality, texture, and pattern of the product. High-end architectural magazine quality, 8k resolution.`;

        console.log("PROMPT:", prompt);

        const response = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "dall-e-3",
                prompt: prompt,
                n: 1,
                size: "1024x1024",
                quality: "hd",
                style: "natural" // 'vivid' might be too fake, 'natural' matches architectural catalog style
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenAI API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const imageUrl = data.data[0].url;

        console.log("✅ DALL-E 3 Generated:", imageUrl);
        return imageUrl;

    } catch (error) {
        console.error("❌ AI Generation Failed:", error);
        // Fallback so the app doesn't crash on demo
        return getMockImage(metadata.style);
    }
}

// 2. Helper for the Mock Fallback (only used if no API Key)
function getMockImage(style: string): string {
    const mockImages: Record<string, string> = {
        'Modern Minimal': 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80',
        'Rustic': 'https://images.unsplash.com/photo-1481253127861-534498168948?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80',
        'Industrial': 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80',
        'Heritage / Vernacular': 'https://images.unsplash.com/photo-1599691689239-1b333434d284?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80',
        'Industrial Earthy': 'https://images.unsplash.com/photo-1565538810643-b5bdb639036e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80',
        'default': 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80'
    };
    return mockImages[style] || mockImages['default'];
}

/**
 * Uploads a generated image to Sanity and creates the metadata document.
 * This connects the "Nano Banana" output to your CMS.
 */
export async function uploadToSanity(imageUrl: string, metadata: AIImageMetadata) {
    try {
        console.log("Uploding to Sanity:", metadata.title);

        // 1. Fetch the image from the (generated) URL
        const res = await fetch(imageUrl);

        if (!res.ok) {
            throw new Error(`Failed to fetch image from ${imageUrl}: ${res.status} ${res.statusText}`);
        }

        const contentType = res.headers.get("content-type");
        console.log("Image fetched. Status:", res.status, "Content-Type:", contentType);

        if (!contentType || !contentType.startsWith("image/")) {
            throw new Error(`Invalid content type: ${contentType}`);
        }

        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        console.log("Image Buffer size:", buffer.length);

        // 2. Upload Asset
        const asset = await client.assets.upload('image', buffer, {
            filename: `${metadata.title.replace(/\s+/g, '-').toLowerCase()}.jpg`,
            contentType: contentType || 'image/jpeg'
        });

        // 3. Create Document
        const doc = {
            _type: 'architecturalImage',
            // title is already in ...metadata, removing explicit assignment to avoid duplication warning
            image: {
                _type: 'image',
                asset: {
                    _type: 'reference',
                    _ref: asset._id
                }
            },
            ...metadata, // Spread all AI metadata fields
            generatedAt: new Date().toISOString()
        };

        const createdDoc = await client.create(doc);
        console.log("✅ Sanity Doc Created:", createdDoc._id);
        return createdDoc;

    } catch (e) {
        console.error("Sanity Upload Error:", e);
        throw e;
    }
}

/**
 * Fetch the latest generated images from Sanity
 */
export async function getLatestGenerations(limit = 10): Promise<any[]> {
    const query = `*[_type == "architecturalImage"] | order(generatedAt desc) [0...${limit}] {
        _id,
        title,
        description,
        "imageUrl": image.asset->url,
        style,
        material,
        projectType,
        lightingStyle,
        generatedAt
    }`;

    try {
        const data = await client.fetch(query);
        return data;
    } catch (error) {
        console.error("Error fetching Sanity generations:", error);
        return [];
    }
}
