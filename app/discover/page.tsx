
"use client";

import { useUser } from "@/app/context/UserContext";
import { generatePersonalizedFeed } from "@/lib/discovery-data";
import { getLatestGenerations, getPersonalizedFeed } from "@/lib/sanity-utils";
import { useEffect, useState } from "react";
import { FeedSection } from "@/lib/types";
import { Settings2, Sparkles, Heart, Search, ArrowRight, UserCircle, Package, Maximize2, Download } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReactLenis } from 'lenis/react';
import { motion, AnimatePresence } from "framer-motion";

export default function DiscoverPage() {
    const { user, highTicketScore, saveItem, logActivity } = useUser();
    const [feed, setFeed] = useState<FeedSection[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [toast, setToast] = useState<{ message: string, visible: boolean }>({ message: '', visible: false });

    useEffect(() => {
        if (user) {
            const loadData = async () => {
                // 1. Fetch Mock Personalized Feed (Client-side logic) - IMMEDIATE RENDER
                const personalized = generatePersonalizedFeed(user);
                setFeed(personalized);
                setIsLoaded(true); // Show content immediately

                // 2. Fetch Real Sanity Generations (Server Action) -- Smart Match Strategy (Background)
                try {
                    // New Algorithm: "Instagram-like" personalization with SMART SCORING
                    const sanityData = await getPersonalizedFeed({
                        interestedMaterials: user.interestedMaterials,
                        architecturalStyle: user.architecturalStyle,
                        projectType: user.projectType,
                        tasteVector: user.tasteVector // SMART ALGO INPUT
                    });

                    if (sanityData && sanityData.length > 0) {
                        // Transform Sanity data to FeedItem format
                        const sanityItems = sanityData.map((doc: any, i: number) => ({
                            id: doc._id,
                            title: doc.title,
                            category: doc.material || 'Detailed View',
                            imageUrl: doc.imageUrl,
                            tags: [doc.style, 'Curated', doc.material].filter(Boolean),
                            isPremium: true,
                        }));

                        // Inject into the first section (Curated)
                        setFeed(currentFeed => {
                            const newFeed = [...currentFeed];
                            if (newFeed[0]) {
                                newFeed[0].items = sanityItems;
                            }
                            return newFeed;
                        });
                    }
                } catch (err) {
                    console.error("Failed to load Sanity feed", err);
                }

                logActivity('View', `Browsed Personalized Discovery Feed`);
            };

            loadData();
        }
    }, [user]);

    const handleInteraction = (type: 'save' | 'refine', detail: string, itemData?: any) => {
        const msg = type === 'save'
            ? `Saved to your collection.`
            : `Refining feed: ${detail}`;

        if (type === 'save' && itemData) {
            saveItem(itemData);
            logActivity('Save', `Saved ${itemData.title}`);
        } else {
            logActivity('Interaction', `Refined feed by ${detail}`);
        }

        setToast({ message: msg, visible: true });
        setTimeout(() => setToast(current => ({ ...current, visible: false })), 3000);
    };

    if (!user) return <EmptyProfileState />;
    if (!isLoaded) return <LoadingState />;

    const heroItem = feed.length > 0 && feed[0].items.length > 0 ? feed[0].items[0] : null;

    return (
        <ReactLenis root>
            <main className="min-h-screen bg-[#1A1714] text-white/90 selection:bg-urban-terracotta selection:text-white pb-40">
                <ToastNotification toast={toast} />
                <Navigation user={user} highTicketScore={highTicketScore} />

                {heroItem ? (
                    <>
                        {/* HERO SECTION */}
                        <section className="relative min-h-screen w-full flex flex-col justify-center lg:justify-end pb-24 px-6 lg:px-24 pt-32 lg:pt-0">
                            {/* Immersive Background Image */}
                            <div className="absolute inset-0 z-0">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={heroItem.id}
                                        initial={{ opacity: 0, scale: 1.1 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                                        className="relative w-full h-full"
                                    >
                                        <Image
                                            src={heroItem.imageUrl}
                                            alt="Hero"
                                            fill
                                            priority
                                            className="object-cover opacity-60"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1714] via-[#1A1714]/60 to-transparent" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1714] via-[#1A1714]/40 to-transparent" />
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            <div className="relative z-10 max-w-4xl space-y-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-xs font-medium uppercase tracking-widest text-urban-terracotta">
                                            <Sparkles className="w-3 h-3" />
                                            <span>AI Curated</span>
                                        </div>
                                        <span className="text-xs text-white/40 uppercase tracking-widest">
                                            Match Score: {Math.floor(90 + Math.random() * 9)}%
                                        </span>
                                    </div>

                                    <motion.h1
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-5xl md:text-8xl font-light font-display leading-[0.9] tracking-tight"
                                    >
                                        {heroItem.title}
                                    </motion.h1>
                                </div>

                                <p className="text-xl md:text-2xl text-white/80 font-light max-w-2xl leading-relaxed">
                                    {(() => {
                                        // SMARTER AI COPYWRITING
                                        const role = user.role || 'Partner';
                                        const aesthetic = user.architecturalStyle || 'Modern';
                                        const projType = user.projectType || user.portfolioProjectTypes?.[0] || 'projects';

                                        // Logic: If they have a TASTE VECTOR, we reference their unique style.
                                        const hasTaste = !!user.tasteVector;
                                        const inferred = user.interestedMaterials.length === 0;

                                        if (hasTaste) {
                                            return `Tuned to your unique taste profile. This selection amplifies your preference for ${user.tasteVector.modernity > 0.5 ? 'modern linearity' : 'rustic warmth'} while respecting the need for ${projType} performance.`;
                                        } else if (inferred) {
                                            return `Based on your profile as a ${role} specializing in ${aesthetic} ${projType}, we've curated this ${heroItem.category || 'selection'} to match your forecasted design intent.`;
                                        } else {
                                            return `Selected for your ${projType} in ${user.projectLocation || 'your region'}. This ${heroItem.category || 'material'} perfectly balances your desire for ${aesthetic} aesthetics with performance.`;
                                        }
                                    })()}
                                </p>

                                <div className="mt-10 flex gap-4">
                                    <button
                                        onClick={() => handleInteraction('save', heroItem.title, heroItem)}
                                        className="px-8 py-4 bg-white text-black rounded-full text-sm font-medium hover:bg-urban-terracotta hover:text-white transition-all flex items-center gap-2"
                                    >
                                        <Heart className="w-4 h-4" /> Save to Project
                                    </button>
                                    <Link href={`/product/${heroItem.id}`} className="px-8 py-4 border border-white/20 rounded-full text-sm font-medium hover:bg-white/10 transition-all flex items-center gap-2">
                                        View Specs <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>

                            {/* Command Hint */}
                            <div className="mt-8 flex items-center gap-2 text-white/30 text-xs font-medium tracking-wide">
                                <span className="px-1.5 py-0.5 border border-white/20 rounded-md bg-white/5">⌘K</span>
                                <span>to search</span>
                            </div>
                        </section>

                        {/* PRODUCT SNAPSHOT CARD (Step 2) */}
                        <div className="relative -mt-16 px-6 lg:px-24 z-20 pointer-events-auto">
                            <div className="bg-[#1A1714]/90 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-6 shadow-2xl max-w-4xl">
                                {/* Thumbnail */}
                                <div className="relative w-full md:w-[140px] aspect-[4/3] rounded-lg overflow-hidden shrink-0 bg-white/5">
                                    <Image
                                        src={heroItem.imageUrl}
                                        alt="Thumbnail"
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                {/* Metadata */}
                                <div className="flex-1 space-y-2">
                                    <h3 className="text-white text-lg font-medium">{heroItem.title}</h3>
                                    <div className="flex flex-wrap gap-3 text-xs text-white/50">
                                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> In Stock</span>
                                        <span>•</span>
                                        <span>{heroItem.category || 'Material'}</span>
                                        <span>•</span>
                                        <span>{user.architecturalStyle}</span>
                                    </div>
                                    <div className="text-urban-terracotta text-sm">₹{(heroItem as any).price || '480'} / sq.ft</div>
                                </div>

                                {/* Quick Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleInteraction('save', heroItem.title, heroItem)}
                                        className="p-3 rounded-full hover:bg-white/10 transition-colors border border-white/10 text-white"
                                        title="Save to Project"
                                    >
                                        <Heart className="w-4 h-4" />
                                    </button>
                                    <Link href={`/product/${heroItem.id}`} className="p-3 rounded-full hover:bg-white/10 transition-colors border border-white/10 text-white" title="Compare">
                                        <Maximize2 className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* COMPLEMENTARY PALETTE: "Complete the Look" (Step 3) */}
                        <section className="px-6 lg:px-24 max-w-[1600px] mx-auto pt-20">
                            <div className="flex items-end justify-between mb-12">
                                <div>
                                    <h3 className="text-3xl font-light font-display text-white">Complete the Look</h3>
                                    <p className="text-white/40 text-sm mt-2">Materials that pair well with this selection.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {/* We take items 1, 2, 3 as complementary (assuming feed has 4+ items) */}
                                {feed[0].items.slice(1, 4).map((item: any, i: number) => (
                                    <PremiumCard key={item.id} item={item} index={i} variant="standard" onInteract={handleInteraction} />
                                ))}
                            </div>
                        </section>

                        {/* MOODBOARD CTA */}
                        <div className="mt-32 mb-16 px-6 lg:px-24">
                            <MoodboardTeaser user={user} />
                        </div>
                    </>
                ) : (
                    <LoadingState />
                )}
            </main>
        </ReactLenis>
    );
}

// --- Subcomponents ---

function Navigation({ user, highTicketScore }: { user: any, highTicketScore: number }) {
    return (
        <header className="fixed top-0 left-0 right-0 z-40 px-6 py-6 pointer-events-none">
            <div className="max-w-[1400px] mx-auto flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-12">
                    <h1 className="font-serif italic text-2xl font-medium tracking-tight text-white mix-blend-difference">UrbanClay</h1>
                </div>

                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 shadow-sm flex items-center justify-center text-white/80 text-sm">
                    {user.name.charAt(0)}
                </div>
            </div>
        </header>
    );
}

function PremiumCard({ item, index, variant, onInteract }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group cursor-pointer"
        >
            <Link href={`/product/${item.id || item._id}`} className="block relative aspect-[4/3] overflow-hidden rounded-lg bg-white/5 mb-4">
                <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onInteract('save', item.title, item); }}
                        className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-urban-terracotta hover:text-white transition-colors shadow-xl"
                    >
                        <Heart className="w-5 h-5" />
                    </button>
                </div>
                {item.isPremium && (
                    <div className="absolute top-4 left-4">
                        <span className="px-2 py-1 bg-black/50 backdrop-blur border border-white/10 text-[10px] uppercase tracking-widest text-white rounded">Premium</span>
                    </div>
                )}
            </Link>

            <div className="space-y-1">
                <div className="flex justify-between items-start">
                    <h4 className="font-medium text-white/90 group-hover:text-urban-terracotta transition-colors text-lg truncate pr-4">
                        {item.title}
                    </h4>
                    <span className="text-sm font-light text-white/50">₹480</span>
                </div>
                <p className="text-white/40 text-xs uppercase tracking-wide truncate">{item.category || item.material}</p>
                <div className="flex gap-2 pt-2">
                    <span className="text-[10px] uppercase tracking-wider text-white/30 border border-white/10 px-2 py-0.5 rounded-full">
                        Exterior
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-white/30 border border-white/10 px-2 py-0.5 rounded-full">
                        In Stock
                    </span>
                </div>
            </div>
        </motion.div>
    );
}

function MoodboardTeaser({ user }: any) {
    return (
        <section className="px-6 lg:px-24 max-w-[1600px] mx-auto py-32">
            <div className="relative rounded-3xl overflow-hidden bg-white/5 border border-white/5 text-white p-8 md:p-16 flex flex-col lg:flex-row-reverse items-center justify-between gap-16">
                <div className="flex-1 space-y-8 text-center lg:text-left">
                    <div>
                        <span className="inline-block px-3 py-1 bg-urban-terracotta/20 text-urban-terracotta border border-urban-terracotta/20 rounded-full text-xs uppercase tracking-widest mb-6">
                            Smart Moodboard
                        </span>
                        <h3 className="text-4xl md:text-6xl font-serif italic text-white leading-tight mb-4">
                            Auto-generated moodboard for {user.projectLocation ? user.projectLocation : 'your project'}
                        </h3>
                        <p className="text-white/60 text-lg max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
                            Based on your browsing, we've assembled a cohesive material board including the selected hero item and complementary textures.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <Link href="/moodboard" className="px-8 py-4 bg-white text-black rounded-lg text-sm font-medium hover:bg-urban-terracotta hover:text-white transition-colors duration-300 shadow-xl min-w-[180px] flex items-center justify-center">
                            Open Moodboard
                        </Link>
                        <Link href="/moodboard" className="px-8 py-4 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors min-w-[180px] flex items-center justify-center">
                            Customize Palette
                        </Link>
                        <button className="p-4 border border-white/10 rounded-lg hover:bg-white/5 transition-colors" title="Export PDF">
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 w-full max-w-lg">
                    <div className="aspect-square relative bg-white/5 rounded-2xl border border-white/10 p-6 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700">
                        <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full">
                            <div className="bg-urban-terracotta rounded-lg opacity-80 row-span-2 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                <span className="absolute bottom-2 left-2 text-[10px] uppercase font-medium text-white/80">Hero</span>
                            </div>
                            <div className="bg-[#2A2622] rounded-lg opacity-60 relative overflow-hidden">
                                <span className="absolute bottom-2 left-2 text-[10px] uppercase font-medium text-white/50">Details</span>
                            </div>
                            <div className="bg-urban-stone/40 rounded-lg opacity-40 relative overflow-hidden">
                                <span className="absolute bottom-2 left-2 text-[10px] uppercase font-medium text-white/50">Texture</span>
                            </div>
                        </div>

                        <div className="absolute -top-4 -right-4 bg-urban-terracotta text-white text-xs px-4 py-2 rounded-full shadow-lg border border-white/20 flex items-center gap-2">
                            <Sparkles className="w-3 h-3" /> Ready
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function LoadingState() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
            <Sparkles className="w-8 h-8 text-urban-terracotta animate-pulse mb-6" />
            <p className="text-sm uppercase tracking-widest text-urban-stone animate-pulse">Curating your experience...</p>
        </div>
    );
}

function EmptyProfileState() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
                <Link href="/onboarding" className="underline text-urban-terracotta">Start Onboarding</Link>
            </div>
        </div>
    );
}

function ToastNotification({ toast }: any) {
    return (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white/10 backdrop-blur-xl border border-white/10 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${toast.visible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95 pointer-events-none'}`}>
            <Sparkles className="w-4 h-4 text-urban-terracotta" />
            <p className="text-sm font-medium">{toast.message}</p>
        </div>
    )
}
