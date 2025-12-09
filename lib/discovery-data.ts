
import {
    OnboardingData,
    FeedItem,
    FeedSection
} from "./types";

// ASSET_LIBRARY Cleared - We rely on Real Sanity Data now.
const ASSET_LIBRARY: any[] = [];

// Mock "AI Generator" is now just a Skeleton Generator
// It provides the structure, but the CONTENT comes from the simple Sanity Query in the page.
export function generatePersonalizedFeed(user: OnboardingData): FeedSection[] {
    const style = user.architecturalStyle || 'Modern Minimal';
    const material = user.interestedMaterials[0] || 'Clay';
    const location = user.projectLocation || 'Urban Context';

    return [
        {
            id: 'section-1',
            title: 'Curated for your Project',
            subtitle: `Selected for your ${style} taste in ${location}`,
            type: 'grid',
            items: [] // Initially Empty - Populated by Sanity
        },
        {
            id: 'section-2',
            title: 'Material Expressions',
            subtitle: `Matching your interest in ${material}`,
            type: 'carousel',
            items: []
        },
        {
            id: 'section-3',
            title: 'Architect-Selected Favorites',
            subtitle: `Trending in ${location}`,
            type: 'grid',
            items: []
        }
    ];
}
