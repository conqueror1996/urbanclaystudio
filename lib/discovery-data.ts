
import {
    OnboardingData,
    FeedItem,
    FeedSection
} from "./types";

// Enhanced Asset Library with "Photorealistic" candidates
const ASSET_LIBRARY = [
    {
        id: '1',
        title: 'Linear Terracotta Facade',
        category: 'Clay Facade Panels',
        imageUrl: 'https://images.unsplash.com/photo-1620626012053-1c167f7eb08f?q=80&w=1000&auto=format&fit=crop',
        tags: ['Modern', 'Linear', 'Commercial'],
        isPremium: true
    },
    {
        id: '2',
        title: 'Perforated Brick Screen',
        category: 'Terracotta Jali',
        imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1000&auto=format&fit=crop',
        tags: ['Rustic', 'Ventilation', 'Residential'],
        isPremium: false
    },
    {
        id: '3',
        title: 'Monolithic Clay Wall',
        category: 'Exposed Brick',
        imageUrl: 'https://images.unsplash.com/photo-1596275150824-34327bd78169?q=80&w=1000&auto=format&fit=crop',
        tags: ['Minimal', 'Texture', 'Interior'],
        isPremium: true
    },
    {
        id: '4',
        title: 'Geometric Clay Pavers',
        category: 'Clay Flooring',
        imageUrl: 'https://images.unsplash.com/photo-1486749842146-276709f7a73f?q=80&w=1000&auto=format&fit=crop',
        tags: ['Pattern', 'Outdoor', 'Landscape'],
        isPremium: false
    },
    {
        id: '5',
        title: 'Contemporary Villa Facade',
        category: 'Cladding',
        imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1000&auto=format&fit=crop',
        tags: ['Modern', 'Residential', 'Luxury'],
        isPremium: true
    },
    {
        id: '6',
        title: 'Rustic Education Campus',
        category: 'Exposed Brick',
        imageUrl: 'https://images.unsplash.com/photo-1565538810643-b5bdb639036e?q=80&w=1000&auto=format&fit=crop',
        tags: ['Institutional', 'Brick', 'Texture'],
        isPremium: false
    }
];

// Mock "AI Generator" that selects images based on complex taste vector
export function generatePersonalizedFeed(user: OnboardingData): FeedSection[] {

    // 1. Decode User Taste
    const style = user.architecturalStyle || 'Modern Minimal';
    const project = user.projectType || 'Residential';
    const location = user.projectLocation || 'Urban Context';
    const material = user.interestedMaterials[0] || 'Exposed Brick';

    // 2. Select Base Image Library (Simulating AI Generation)
    // In a real app, this would use the `tasteVector` to query a Vector DB or trigger Stable Diffusion
    let selectedLibrary = ASSET_LIBRARY;

    if (style === 'Rustic') {
        selectedLibrary = ASSET_LIBRARY.filter(i => i.tags.includes('Rustic') || i.category.includes('Brick'));
    } else if (style === 'Modern Minimal') {
        selectedLibrary = ASSET_LIBRARY.filter(i => i.tags.includes('Modern') || i.category.includes('Facade'));
    }

    // Fallback if filter is too aggressive
    if (selectedLibrary.length < 4) selectedLibrary = ASSET_LIBRARY;

    // 3. Construct "AI Generated" Items with Metadata
    const generateSmartItem = (baseItem: any, index: number): FeedItem => {
        return {
            ...baseItem,
            id: `ai-gen-${index}-${Date.now()}`,
            // Add the sophisticated metadata you requested
            aiMetadata: {
                title: `${style} ${project} in ${location}`,
                description: `Photorealistic ${style.toLowerCase()} facade featuring ${material.toLowerCase()} with cinematic lighting.`,
                style: style,
                material: material,
                colorProfile: user.colorPreference || 'Natural Clay',
                projectType: project,
                climate: 'Tropical / Humid', // Inferred from location typically
                lightingStyle: index % 2 === 0 ? 'Golden Hour' : 'Soft Overcast',
                compositionStyle: 'Rule of Thirds',
                textureLevel: style === 'Rustic' ? 'High' : 'Medium',
                embeddingHint: `${style.toLowerCase()}, ${material.toLowerCase()}, architectural photography, 4k, cinematic, ${project.toLowerCase()}`
            }
        };
    };

    const curratedItems = selectedLibrary.slice(0, 4).map(generateSmartItem);
    const materialItems = ASSET_LIBRARY.slice(2, 6).map(generateSmartItem);
    const trendingItems = ASSET_LIBRARY.slice(0, 4).reverse().map(generateSmartItem);

    return [
        {
            id: 'section-1',
            title: 'Curated for your Project',
            subtitle: `AI-selected for your ${style} taste`,
            type: 'grid',
            items: curratedItems
        },
        {
            id: 'section-2',
            title: 'Material Expressions',
            subtitle: `Matching your interest in ${material}`,
            type: 'carousel',
            items: materialItems
        },
        {
            id: 'section-3',
            title: 'Architect-Selected Favorites',
            subtitle: `Trending in ${location}`,
            type: 'grid',
            items: trendingItems
        }
    ];
}
