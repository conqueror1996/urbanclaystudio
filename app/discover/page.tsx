
"use client";

import { useUser } from "@/app/context/UserContext";
import { generatePersonalizedFeed } from "@/lib/discovery-data";
import { getLatestGenerations } from "@/lib/sanity-utils";
import { useEffect, useState } from "react";
import { FeedSection } from "@/lib/types";
import { Settings2, Sparkles, Heart, Search, ArrowRight, UserCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReactLenis } from 'lenis/react';
import { motion, AnimatePresence } from "framer-motion";

export default function DiscoverPage() {
    const { user, highTicketScore, saveItem } = useUser();
    const [feed, setFeed] = useState<FeedSection[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [toast, setToast] = useState<{ message: string, visible: boolean }>({ message: '', visible: false });

    useEffect(() => {
        if (user) {
            const loadData = async () => {
                // 1. Fetch Mock Personalized Feed (Client-side logic)
                const personalized = generatePersonalizedFeed(user);

                // 2. Fetch Real Sanity Generations (Server Action)
                try {
                    const sanityData = await getLatestGenerations(4);

                    if (sanityData && sanityData.length > 0) {
                        // Transform Sanity data to FeedItem format
                        const sanityItems = sanityData.map((doc: any, i: number) => ({
                            id: doc._id,
                            title: doc.title,
                            category: doc.material || 'Generated',
                            imageUrl: doc.imageUrl,
                            tags: [doc.style, 'Premium Curated', doc.material],
                            isPremium: true,
                            aiMetadata: {
                                ...doc,
                                embeddingHint: doc.embeddingHint // Ensure usage of prompt is visible if needed
                            }
                        }));

                        // Inject into the first section (Curated)
                        personalized[0].items = [...sanityItems, ...personalized[0].items];
                    }
                } catch (err) {
                    console.error("Failed to load Sanity feed", err);
                }

                setFeed(personalized);
                setIsLoaded(true);
            };

            // Add slight delay for "Processing" feel
            setTimeout(loadData, 1200);
        }
    }, [user]);

    const handleInteraction = (type: 'save' | 'refine', detail: string, itemData?: any) => {
        const msg = type === 'save'
            ? `Saved to your collection.`
            : `Refining feed: ${detail}`;

        if (type === 'save' && itemData) {
            saveItem(itemData);
        }

        setToast({ message: msg, visible: true });
        setTimeout(() => setToast(current => ({ ...current, visible: false })), 3000);
    };

    if (!user) return <EmptyProfileState />;
    if (!isLoaded) return <LoadingState />;

    return (
        <ReactLenis root>
            <main className="min-h-screen bg-[#FDFDFD] dark:bg-[#1A1714] pb-40 relative text-[#1A1714] dark:text-[#E6E1DC]">
                <ToastNotification toast={toast} />
                <Navigation user={user} highTicketScore={highTicketScore} />

                {/* Hero Header - Editorial Style */}
                <section className="px-6 pt-32 pb-16 max-w-[1400px] mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="max-w-4xl"
                    >
                        <h1 className="text-5xl md:text-7xl font-sans font-light leading-[1.1] tracking-tight mb-8">
                            Your curated feed for <br />
                            <span className="font-serif italic text-urban-terracotta">{user.architecturalStyle} {user.projectType}s</span>
                        </h1>
                        <p className="text-lg md:text-xl text-urban-stone font-light max-w-2xl leading-relaxed">
                            Based on your design taste, material preferences, and climate profile.
                            AI-optimized for <span className="text-urban-terracotta">{user.projectLocation}</span>.
                        </p>
                    </motion.div>

                    {/* Filter Pills - Glassmorphic */}
                    <div className="mt-12 flex gap-3 overflow-x-auto pb-4 scrollbar-hide py-2">
                        {['More Rustic', 'Lighter Tones', 'Exposed Brick', 'Modern Jali', 'High Texture'].map((filter, i) => (
                            <button
                                key={i}
                                onClick={() => handleInteraction('refine', filter)}
                                className="whitespace-nowrap px-5 py-3 rounded-full border border-black/5 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-md text-sm hover:border-urban-terracotta hover:text-urban-terracotta transition-all duration-300"
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Feed Sections */}
                <div className="space-y-32">
                    {/* Section A: Curated (Main) */}
                    {feed.length > 0 && (
                        <FeedSectionBlock
                            title="Curated for your Project"
                            subtitle="AI-selected for your Modern Minimal taste"
                            items={feed[0].items}
                            type="hero"
                            onInteract={handleInteraction}
                        />
                    )}

                    {/* Section B: Materials (Carousel) */}
                    {feed.length > 1 && (
                        <FeedSectionBlock
                            title="Material Expressions"
                            subtitle="Matching your preference for high warmth levels"
                            items={feed[1].items}
                            type="carousel"
                            onInteract={handleInteraction}
                        />
                    )}

                    {/* Section D: Moodboard Teaser */}
                    <MoodboardTeaser user={user} />

                    {/* Section C: Trending (Standard Grid) */}
                    {feed.length > 2 && (
                        <FeedSectionBlock
                            title="Architect-Selected Favorites"
                            subtitle={`Popular for ${user.projectType} builds in your region`}
                            items={feed[2].items}
                            type="grid"
                            onInteract={handleInteraction}
                        />
                    )}
                </div>
            </main>
        </ReactLenis>
    );
}

// --- Subcomponents ---

function Navigation({ user, highTicketScore }: { user: any, highTicketScore: number }) {
    // Hidden in favor of MagicNav for simplicity, kept structure for logo
    return (
        <header className="fixed top-0 left-0 right-0 z-40 px-6 py-6 pointer-events-none">
            <div className="max-w-[1400px] mx-auto flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-12">
                    <h1 className="font-serif italic text-2xl font-medium tracking-tight text-[#1A1714] dark:text-white">UrbanClay</h1>
                </div>

                {/* Simplified Profile only */}
                <Link href="/sales" className="w-10 h-10 rounded-full bg-white dark:bg-[#2A2622] border border-black/5 dark:border-white/5 shadow-sm flex items-center justify-center text-urban-stone text-sm hover:scale-105 transition-transform">
                    {user.name.charAt(0)}
                </Link>
            </div>
        </header>
    );
}

function FeedSectionBlock({ title, subtitle, items, type, onInteract }: any) {
    return (
        <section className="px-6 max-w-[1400px] mx-auto">
            <div className="flex items-end justify-between mb-10 border-b border-black/5 dark:border-white/5 pb-6">
                <div>
                    <p className="text-urban-terracotta text-xs uppercase tracking-widest mb-2 font-medium">For You</p>
                    <h3 className="text-3xl font-light font-display">{title}</h3>
                    <p className="text-urban-stone text-sm mt-2 font-light">{subtitle}</p>
                </div>
                <button className="group flex items-center gap-2 text-sm text-urban-stone hover:text-urban-terracotta transition-colors">
                    View Collection <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {type === 'hero' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {items.slice(0, 2).map((item: any, i: number) => (
                        <PremiumCard key={item.id} item={item} index={i} variant="hero" onInteract={onInteract} />
                    ))}
                    {/* Sub-grid for remaining */}
                    <div className="col-span-1 md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
                        {items.slice(2).map((item: any, i: number) => (
                            <PremiumCard key={item.id} item={item} index={i + 2} variant="standard" onInteract={onInteract} />
                        ))}
                    </div>
                </div>
            )}

            {type === 'carousel' && (
                <div className="flex gap-6 overflow-x-auto pb-12 pt-4 px-2 -mx-2 snap-x scrollbar-hide">
                    {items.map((item: any, i: number) => (
                        <div key={item.id} className="min-w-[320px] snap-center">
                            <PremiumCard item={item} index={i} variant="standard" onInteract={onInteract} />
                        </div>
                    ))}
                </div>
            )}

            {type === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-6">
                    {items.map((item: any, i: number) => (
                        <PremiumCard key={item.id} item={item} index={i} variant="standard" onInteract={onInteract} />
                    ))}
                </div>
            )}
        </section>
    )
}

function PremiumCard({ item, index, variant, onInteract }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className={`group relative flex flex-col gap-4 cursor-pointer`}
        >
            <Link href="/product/prod-001" className={`block relative overflow-hidden rounded-[24px] bg-urban-stone/10 ${variant === 'hero' ? 'aspect-[4/3]' : 'aspect-[3/4]'}`}>
                <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
                />

                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                {/* Floating Tags */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    {item.isPremium && (
                        <span className="px-3 py-1 bg-white/90 dark:bg-black/80 backdrop-blur text-[10px] uppercase tracking-widest font-medium rounded-full">
                            Premium
                        </span>
                    )}
                    {item.aiMetadata && (
                        <span className="px-3 py-1 bg-urban-terracotta/90 backdrop-blur text-white text-[10px] uppercase tracking-widest font-medium rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {item.aiMetadata.lightingStyle}
                        </span>
                    )}
                </div>

                {/* Hover Actions */}
                <div className="absolute top-4 right-4 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onInteract('save', item.title, item); }}
                        className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-urban-terracotta transition-colors shadow-lg"
                    >
                        <Heart className="w-5 h-5" />
                    </button>
                </div>
            </Link>

            <div className="space-y-1">
                <div className="flex justify-between items-start">
                    <h4 className={`font-medium text-[#1A1714] dark:text-[#E6E1DC] group-hover:text-urban-terracotta transition-colors ${variant === 'hero' ? 'text-2xl' : 'text-lg'}`}>
                        {item.title}
                    </h4>
                </div>
                <p className="text-urban-stone text-sm">{item.category}</p>
                <div className="flex gap-2 pt-2">
                    {item.tags.slice(0, 2).map((tag: string) => (
                        <span key={tag} className="text-[10px] uppercase tracking-wider text-urban-stone/70 border border-urban-stone/20 px-2 py-1 rounded-full">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

function MoodboardTeaser({ user }: any) {
    return (
        <section className="px-6 max-w-[1400px] mx-auto">
            <div className="relative rounded-3xl overflow-hidden bg-[#1A1714] dark:bg-white/5 text-white p-8 md:p-16">
                {/* Soft Clay Glow */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-urban-terracotta/20 blur-[120px] rounded-full pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 space-y-6">
                        <div className="inline-block px-3 py-1 border border-white/20 rounded-full text-xs uppercase tracking-widest text-urban-stone">
                            Auto-Generated for {user.name}
                        </div>
                        <h3 className="text-4xl md:text-5xl font-serif italic text-white leading-tight">
                            The {user.architecturalStyle} Palette
                        </h3>
                        <p className="text-white/60 text-lg max-w-md font-light">
                            We've assembled a cohesive material board based on your location in {user.projectLocation}.
                        </p>
                        <button className="mt-4 px-8 py-4 bg-white text-black rounded-lg text-sm font-medium hover:bg-urban-terracotta hover:text-white transition-colors duration-300 shadow-xl">
                            Open Moodboard
                        </button>
                    </div>

                    <div className="flex-1 w-full max-w-lg aspect-square relative perspective-1000">
                        {/* Abstract Composition */}
                        <div className="absolute inset-0 bg-white/5 rounded-2xl border border-white/10 p-4 rotate-3 hover:rotate-0 transition-transform duration-700 ease-out grid grid-cols-2 gap-4">
                            <div className="bg-urban-terracotta rounded-lg opacity-80" />
                            <div className="bg-[#2A2622] rounded-lg" />
                            <div className="col-span-2 bg-[url('https://images.unsplash.com/photo-1590326402421-39d25164d50c?q=80')] bg-cover opacity-60 rounded-lg grayscale mix-blend-overlay" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function LoadingState() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFDFD] dark:bg-[#1A1714]">
            <Sparkles className="w-8 h-8 text-urban-terracotta animate-pulse mb-6" />
            <p className="text-sm uppercase tracking-widest text-urban-stone animate-pulse">Curating your experience...</p>
        </div>
    );
}

function EmptyProfileState() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
            <div className="text-center">
                <Link href="/onboarding" className="underline text-urban-terracotta">Start Onboarding</Link>
            </div>
        </div>
    );
}

function ToastNotification({ toast }: any) {
    return (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#1A1714] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${toast.visible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95 pointer-events-none'}`}>
            <Sparkles className="w-4 h-4 text-urban-terracotta" />
            <p className="text-sm font-medium">{toast.message}</p>
        </div>
    )
}
