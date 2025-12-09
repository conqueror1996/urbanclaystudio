export type Role = 'Architect' | 'Builder' | 'Contractor' | 'Property Owner' | 'Interior Designer';
export type ProjectStage = 'Concept' | 'Design Development' | 'Budgeting' | 'Execution';
export type LeadTime = 'Immediately' | '1 Month' | '3 Months' | 'Just Exploring';
export type ProjectType = 'Residential' | 'Commercial' | 'Industrial';

export interface OnboardingData {
    // Section 1: Identity
    name: string;
    role: Role | '';
    businessName: string;
    email: string;
    phoneNumber: string;

    // Section 2: Professional Profile
    portfolioProjectTypes: string[];
    workingOnProject: boolean;

    // Section 3: Current Project (if workingOnProject is true)
    projectLocation: string;
    projectStage: ProjectStage | ''; // Optional or inferred
    projectType: ProjectType | ''; // Current specific project
    architecturalStyle: string;

    // Legacy / Other
    leadTime: LeadTime | '';
    interestedMaterials: string[]; // Might be inferred or asked later
    colorPreference: string;

    // Section 4: Taste Vector
    tasteVector?: any;
}

export const MATERIAL_OPTIONS = [
    'Brick Tile',
    'Exposed Brick',
    'Clay Ceiling Tile',
    'Clay Flooring Tile',
    'Brick Pavers',
    'Terracotta Jali',
    'Clay Facade Panels'
];

export const COLOR_OPTIONS = [
    'Warm Terracotta',
    'Deep Rustic Red',
    'Earthy Browns',
    'Charcoal / Smoky',
    'Natural Clay Beige',
    'Custom'
];

export const STYLE_OPTIONS = [
    'Contemporary',
    'Modern Minimal',
    'Rustic',
    'Heritage / Vernacular',
    'Industrial Earthy'
];

export interface TasteVector {
    modernity: number;
    rustic: number;
    warmth: number;
    luxury: number; // High-ticket signal
}

export interface AIImageMetadata {
    title: string;
    description: string;
    style: string;
    material: string;
    colorProfile: string;
    projectType: string;
    climate: string;
    lightingStyle: string;
    compositionStyle: string;
    textureLevel: string;
    embeddingHint: string;
}

export interface FeedItem {
    id: string;
    title: string;
    category: string;
    imageUrl: string;
    tags: string[];
    isPremium: boolean;
    aiMetadata?: AIImageMetadata; // Optional for backward compatibility, but required for "Smart" items
}

export interface FeedSection {
    id: string;
    title: string;
    subtitle?: string;
    type: 'grid' | 'carousel';
    items: FeedItem[];
}

export interface SavedItem extends FeedItem {
    savedAt: number;
    notes?: string;
}

export interface MoodboardItem {
    id: string;
    type: 'material' | 'image' | 'swatch' | 'note';
    src?: string; // For images/materials
    color?: string; // For swatches
    text?: string; // For notes/labels
    name?: string;
    variant?: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    zIndex: number;
    locked: boolean;
    metadata?: any;
}

export interface MoodboardBoard {
    id: string;
    name: string;
    items: MoodboardItem[];
    createdAt: number;
    updatedAt: number;
}
