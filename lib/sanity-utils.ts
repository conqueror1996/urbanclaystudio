"use server";

import { client } from "./sanity";
import { AIImageMetadata } from "./types";

/**
 * MOCK: Simulates the "Nano Banana" AI Generation process.
 * In production, this would call your custom FLUX/Stable Diffusion API.
 */
// 1. Define the Real AI Generation Function (OpenAI DALL-E 3)
/**
 * SMART RETRIEVAL:
 * Instead of generating fake AI images, we query the Sanity CMS for
 * EXISTING "Actual Photos" that match the client's preferences.
 * 
 * This treats Sanity as a Digital Asset Management (DAM) system.
 */
export async function generateArchitectureImage(metadata: AIImageMetadata): Promise<string> {
    console.log("🔍 Searching for actual project photo matching:", metadata);

    try {
        // 1. Prioritize Exact Matches (Material + Style + Color)
        // We look for any image in your catalog that matches the user's input.
        const exactMatchQuery = `*[_type == "architecturalImage" && material == $material && style == $style] | order(generatedAt desc)[0] {
            "imageUrl": image.asset->url
        }`;

        const exactParams = {
            material: metadata.material,
            style: metadata.style
        };

        const exactMatch = await client.fetch(exactMatchQuery, exactParams, { next: { revalidate: 3600 } });

        if (exactMatch && exactMatch.imageUrl) {
            console.log("✅ Found exact match in Catalog:", exactMatch.imageUrl);
            return exactMatch.imageUrl;
        }

        // 2. Fallback: Match just by Material (Most important for a product co)
        console.log("⚠️ No exact match found. Falling back to Material filtering...");
        const materialQuery = `*[_type == "architecturalImage" && material == $material] | order(generatedAt desc)[0] {
            "imageUrl": image.asset->url
        }`;

        const materialMatch = await client.fetch(materialQuery, { material: metadata.material }, { next: { revalidate: 3600 } });

        if (materialMatch && materialMatch.imageUrl) {
            return materialMatch.imageUrl;
        }

        // 3. Last Resort: Return the most recent upload (or a generic fallback asset)
        console.log("⚠️ No material match found. Showing latest portfolio item...");
        const latestQuery = `*[_type == "architecturalImage"] | order(generatedAt desc)[0] {
            "imageUrl": image.asset->url
        }`;
        const latestMatch = await client.fetch(latestQuery, {}, { next: { revalidate: 3600 } });

        if (latestMatch && latestMatch.imageUrl) {
            return latestMatch.imageUrl;
        }

        throw new Error("No images found in CMS. Please upload actual photos to Sanity Studio.");

    } catch (error) {
        console.error("❌ Smart Retrieval Failed:", error);
        // Fallback to a placeholder specifically for "Missing Content"
        return "https://placehold.co/1024x1024/1a1a1a/FFF?text=Upload+Actual+Photos+To+Sanity";
    }
}

// Upload is now primarily for Admin usage, but we keep it compatible
// in case we want to re-enable AI later or allow user uploads.
export async function uploadToSanity(imageUrl: string, metadata: AIImageMetadata) {
    // If we are just Retrieving, we don't necessarily need to Upload again,
    // unless this function is used by an Admin Uploader script.
    // For the Onboarding flow -> "Fetch Only" mode efficiently skips this.

    // Check if the URL is internal (already from Sanity) to avoid re-upload loops
    if (imageUrl.includes('cdn.sanity.io')) {
        console.log("ℹ️ Image is already hosted on Sanity. Skipping upload.");
        return;
    }

    // ... (Keep existing upload logic if needed for external sources)
    // For now, we return early as the new flow is "Read Only" from Catalog.
    return;
}


/**
 * REPLACEMENT: Get matched inspiration images for the Swipe View.
 * Instead of showing the user's *own* previous creations (getLatestGenerations),
 * we show *Catalog Items* that match their current selections.
 */
export async function getInspirationImages(materials: string[], style: string): Promise<any[]> {
    console.log("🔍 Fetching inspiration for:", { materials, style });

    // STRICT MATCH: Material matches exactly
    // (Removed Unsplash exclusion to allow mocks in dev environment)
    const query = `*[_type == "architecturalImage" && material in $materials] [0...15] {
        _id,
        title,
        "imageUrl": image.asset->url,
        style,
        material,
        projectType
    }`;

    try {
        let data = await client.fetch(query,
            { materials, style },
            { next: { revalidate: 3600 } }
        );

        // FALLBACK 1: If no exact material match, try matching by Style + Project Type
        if (!data || data.length === 0) {
            console.log("⚠️ No exact material match. Trying fallback by Style...");
            const fallbackQueryResult = await client.fetch(
                `*[_type == "architecturalImage" && style == $style] [0...10] {
                    _id,
                    title,
                    "imageUrl": image.asset->url,
                    style,
                    material,
                    projectType
                }`,
                { style },
                { next: { revalidate: 3600 } }
            );
            data = fallbackQueryResult;
        }

        // FALLBACK 2: If still nothing, just get *any* architectural images (to avoid empty state)
        if (!data || data.length === 0) {
            console.log("⚠️ No style match. Getting generic fallback...");
            const genericFallback = await client.fetch(
                `*[_type == "architecturalImage"] | order(_createdAt desc) [0...10] {
                    _id,
                    title,
                    "imageUrl": image.asset->url,
                    style,
                    material,
                    projectType
                }`,
                {},
                { next: { revalidate: 3600 } }
            );
            data = genericFallback;
        }

        console.log(`✅ Found ${data.length} inspiration images`);
        return data;
    } catch (error) {
        console.error("❌ Error fetching inspiration:", error);
        return [];
    }
}

/**
 * Fetch the latest generated images from Sanity
 * (Keeping this for the "History" or "Feed" view, but not for matching)
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
        const data = await client.fetch(query, {}, { next: { revalidate: 60 } });
        return data;
    } catch (error) {
        console.error("Error fetching Sanity generations:", error);
        return [];
    }
}

/**
 * SMART SEARCH: Matches existing catalog items using AI-derived filters.
 */
export async function searchCatalog(filters: any): Promise<any[]> {
    console.log("🔍 Executing Smart Search with filters:", filters);

    // optimize GROQ query construction
    const conditions = ['_type == "architecturalImage"'];

    if (filters.materials && filters.materials.length > 0) {
        // match any of the detected materials
        conditions.push(`material in $materials`);
    }

    if (filters.styles && filters.styles.length > 0) {
        conditions.push(`style in $styles`);
    }

    if (filters.projectTypes && filters.projectTypes.length > 0) {
        conditions.push(`projectType in $projectTypes`);
    }

    // Free text search (matches title or any other text fields if they exist)
    if (filters.freeText) {
        // Using wildcards for simple text match
        conditions.push(`(title match $freeText + "*" || style match $freeText + "*" || material match $freeText + "*")`);
    }

    const query = `*[${conditions.join(' && ')}] | order(generatedAt desc) {
        _id,
        title,
        "imageUrl": image.asset->url,
        style,
        material,
        projectType,
        generatedAt
    }`;

    try {
        const data = await client.fetch(query, {
            materials: filters.materials,
            styles: filters.styles,
            projectTypes: filters.projectTypes,
            freeText: filters.freeText
        }, { next: { revalidate: 60 } });
        console.log(`✅ Smart Search found ${data.length} items`);
        return data;
    } catch (error) {
        console.error("❌ Smart Search Error:", error);
        return [];
    }
}

// NEW: Direct File Upload from CMS Uploader
export async function uploadDirectToSanity(formData: FormData) {
    const file = formData.get('file') as File;
    const material = formData.get('material') as string;
    const style = formData.get('style') as string;
    const projectType = formData.get('projectType') as string;

    if (!file) throw new Error("No file uploaded");

    console.log(`📤 Uploading ${file.name} to Sanity...`);

    // 1. Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Upload Asset
    const asset = await client.assets.upload('image', buffer, {
        filename: file.name
    });

    // 3. Create Document
    const doc = {
        _type: 'architecturalImage',
        title: `${material} - ${projectType} (${style})`,
        image: {
            _type: 'image',
            asset: {
                _type: 'reference',
                _ref: asset._id
            }
        },
        material: material,
        style: style,
        projectType: projectType,
        colorProfile: 'Custom',
        generatedAt: new Date().toISOString(),
        isUserUpload: true
    };

    const createdDoc = await client.create(doc);
    console.log("✅ Asset Created in Sanity:", createdDoc._id);
    return createdDoc;
}

/**
 * PERSONALIZED FEED ALGORITHM
 * "Instagram-like" matching based on User Taste Profile.
 */
export async function getPersonalizedFeed(preferences: {
    interestedMaterials: string[];
    architecturalStyle: string;
    projectType: string;
    tasteVector?: { modernity: number; rustic: number; luxury: number };
}): Promise<any[]> {
    console.log("🧠 Smart Algorithm: Generating Feed for", preferences);

    // 1. BROAD RETRIEVAL
    // Instead of filtering down to zero results, we fetch a broad "Candidate Pool".
    // We look for anything that vaguely matches ANY of their signals.
    let candidates: any[] = [];

    // Strategy: Fetch top 200 items that *might* be relevant
    const query = `*[_type == "architecturalImage"] | order(generatedAt desc)[0...200] {
            _id,
            title,
            "imageUrl": image.asset->url,
            "category": material,
            style,
            material,
            projectType,
            "isPremium": projectType == "Commercial" || projectType == "Industrial"
    }`;

    try {
        candidates = await client.fetch(query, {}, { next: { revalidate: 60 } });

        // 2. SMART SCORING ENGINE
        const scoredItems = candidates.map((item: any) => {
            let score = 0;

            // A. Explicit Material Match (High Precision)
            if (preferences.interestedMaterials && preferences.interestedMaterials.includes(item.material)) {
                score += 40;
            }

            // B. Architectural Style Match (Aesthetic Alignment)
            if (item.style === preferences.architecturalStyle) {
                score += 30;
            }

            // C. Project Type relevance (Context)
            if (item.projectType === preferences.projectType) {
                score += 20;
            }

            // D. Taste Vector Refining (The "Smart" Part)
            if (preferences.tasteVector) {
                const tv = preferences.tasteVector;

                // Modernity Bias
                if (tv.modernity > 0.7 && (item.style === 'Modern Minimal' || item.style === 'Contemporary')) score += 15;
                if (tv.modernity < 0.3 && (item.style === 'Rustic' || item.style === 'Heritage')) score += 15;

                // Rustic Bias
                if (tv.rustic > 0.7 && (item.style === 'Rustic' || item.material === 'Exposed Brick')) score += 15;

                // Luxury/Commercial Bias
                if (tv.luxury > 0.7 && item.isPremium) score += 20;
            }

            // E. Serendipity / Jitter (Avoid "Echo Chamber")
            // Adds small variations so refresh might show new things
            score += (Math.random() * 10);

            return { ...item, _score: score };
        });

        // 3. RANKING & DIVERSIFICATION
        scoredItems.sort((a, b) => b._score - a._score);

        // Deduplicate and return top 50
        const seen = new Set();
        return scoredItems.filter((item) => {
            const duplicate = seen.has(item.imageUrl);
            seen.add(item.imageUrl);
            return !duplicate;
        }).slice(0, 50);

    } catch (error) {
        console.error("Feed Algorithm Failed:", error);
        return [];
    }
}

/**
 * MORE LIKE THIS (Visual Similarity)
 * Finds items with matching attributes, excluding the current one.
 */
export async function getSimilarItems(currentId: string, attributes: {
    material: string;
    style: string;
    projectType: string;
}): Promise<any[]> {
    // We prioritize Material match, then Style match.
    // We EXCLUDE the current item ID.
    const query = `*[_type == "architecturalImage" && _id != $id && (material == $material || style == $style)] | order(generatedAt desc)[0...4] {
        _id,
        title,
        "imageUrl": image.asset->url,
        style,
        material
    }`;

    try {
        const similar = await client.fetch(query, {
            id: currentId,
            material: attributes.material,
            style: attributes.style
        }, { next: { revalidate: 3600 } }); // Cache for 1 hour
        return similar;
    } catch (error) {
        console.error("Similarity Search Failed:", error);
        return [];
    }
}

/**
 * FETCH SINGLE PRODUCT (Product Page)
 */
export async function getProductById(id: string): Promise<any> {
    const query = `*[_type == "architecturalImage" && _id == $id][0] {
        _id,
        title,
        description,
        "imageUrl": image.asset->url,
        style,
        material,
        projectType
    }`;

    try {
        const product = await client.fetch(query, { id }, { next: { revalidate: 3600 } }); // Cache for 1 hour
        return product;
    } catch (error) {
        console.error("Failed to fetch product:", error);
        return null;
    }
}


