'use server';

import { client } from "@/lib/sanity";
import { analyzeBuffer } from "@/app/actions/analyze-image";

// 1. Fetch all images that need analysis (or all images for a full re-index)
export async function getImagesToReindex(options: { forceAll?: boolean } = {}) {
    const query = options.forceAll
        ? `*[_type == "architecturalImage"] { _id, "url": image.asset->url }`
        : `*[_type == "architecturalImage" && (!defined(style) || !defined(material))] { _id, "url": image.asset->url }`;

    try {
        const images = await client.fetch(query);
        console.log(`🔍 Found ${images.length} images to re-index.`);
        return images;
    } catch (error) {
        console.error("Failed to fetch images for re-indexing:", error);
        return [];
    }
}

// 2. Process a Single Image (Analyze + Patch)
export async function reindexImage(id: string, url: string) {
    if (!url) return { success: false, error: "No URL" };

    try {
        console.log(`🔄 Re-indexing image ${id}...`);

        // 1. Fetch Image Buffer
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mimeType = response.headers.get("content-type") || "image/jpeg";

        // 2. Analyze
        const metadata = await analyzeBuffer(buffer, mimeType);

        if (!metadata) {
            throw new Error("AI Analysis returned null");
        }

        // 3. Patch Sanity
        await client
            .patch(id)
            .set({
                style: metadata.style,
                material: metadata.material,
                isAiAnalyzed: true
            })
            .commit();

        console.log(`✅ Updated ${id} with`, metadata);
        return { success: true, metadata };
    } catch (error) {
        console.error(`❌ Failed to re-index ${id}:`, error);
        return { success: false, error: String(error) };
    }
}
