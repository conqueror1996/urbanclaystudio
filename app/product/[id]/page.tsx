
"use client";

import { useUser } from "@/app/context/UserContext";
import { ReactLenis } from 'lenis/react';
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft,
    Share2,
    Heart,
    Download,
    Info,
    ShieldCheck,
    ThermometerSun,
    Wind,
    Maximize2,
    Check,
    ArrowRight
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, use } from "react";
import { useRouter } from "next/navigation";

// Mock Data for a single product (In real app, fetch by ID)
const PRODUCT = {
    id: "prod-001",
    title: "Linear Terracotta Cladding",
    collection: "Urban Facade Series",
    description: "A precision-engineered ventilated facade system that combines the warmth of natural clay with modern architectural linearity. Designed for high-performance thermal insulation and zero maintenance.",
    basePrice: 480, // in INR per sqft
    rating: 4.8,
    reviews: 124,
    features: ["Thermal Comfort", "Acoustic Insulation", "Fire Resistant", "Zero Maintenance"],
    suitability: ["Commercial Facades", "High-Rise Residential", "Educational Campuses"],
    variants: [
        { id: 'v1', name: 'Natural Red', color: '#C25B37', image: 'https://images.unsplash.com/photo-1620626012053-1c167f7eb08f?q=80&w=1000&auto=format&fit=crop' },
        { id: 'v2', name: 'Smoked Grey', color: '#4A4A4A', image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1000&auto=format&fit=crop' },
        { id: 'v3', name: 'Sand Beige', color: '#E3D7C8', image: 'https://images.unsplash.com/photo-1596275150824-34327bd78169?q=80&w=1000&auto=format&fit=crop' },
    ],
    finishes: ['Smooth', 'Textured', 'Grooved']
};

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { saveItem, user } = useUser();
    const router = useRouter();

    const [selectedVariant, setSelectedVariant] = useState(PRODUCT.variants[0]);
    const [selectedFinish, setSelectedFinish] = useState(PRODUCT.finishes[0]);
    const [isSaved, setIsSaved] = useState(false);

    // Calculate dynamic price
    const currentPrice = PRODUCT.basePrice + (selectedFinish === 'Grooved' ? 45 : 0);

    const handleSave = () => {
        setIsSaved(true);
        saveItem({
            id: `${PRODUCT.id}-${selectedVariant.id}`,
            title: `${PRODUCT.title} - ${selectedVariant.name}`,
            category: "Clay Facade",
            imageUrl: selectedVariant.image,
            tags: [selectedFinish],
            isPremium: true
        });
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <ReactLenis root>
            <main className="min-h-screen bg-[#FDFDFD] dark:bg-[#1A1714] text-[#1A1714] dark:text-[#E6E1DC]">

                {/* Navigation */}
                <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 flex items-center justify-between mix-blend-difference text-white pointer-events-none">
                    <button
                        onClick={() => router.back()}
                        className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all text-sm font-medium"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                    </button>
                    <div className="pointer-events-auto flex items-center gap-3">
                        <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all">
                            <Share2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleSave}
                            className={`w-10 h-10 rounded-full backdrop-blur-md border border-white/20 flex items-center justify-center transition-all ${isSaved ? 'bg-urban-terracotta text-white border-urban-terracotta' : 'bg-white/10 hover:bg-white/20'}`}
                        >
                            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                        </button>
                    </div>
                </nav>

                <div className="flex flex-col lg:flex-row min-h-screen">

                    {/* Visual Configurator (Left) */}
                    <div className="relative w-full lg:w-[65%] h-[60vh] lg:h-screen bg-urban-stone/10 lg:sticky lg:top-0 overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedVariant.id}
                                initial={{ opacity: 0, scale: 1.05 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.7 }}
                                className="absolute inset-0"
                            >
                                <Image
                                    src={selectedVariant.image}
                                    alt={selectedVariant.name}
                                    fill
                                    priority
                                    className="object-cover"
                                />
                            </motion.div>
                        </AnimatePresence>

                        {/* Overlay Context */}
                        <div className="absolute bottom-8 left-8 text-white z-10 max-w-md">
                            <motion.span
                                key={selectedVariant.name}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-block px-3 py-1 bg-white/20 backdrop-blur text-xs uppercase tracking-widest mb-3 rounded-full"
                            >
                                {selectedVariant.name}
                            </motion.span>
                            <h2 className="text-4xl font-light font-display">
                                Virtual Preview
                            </h2>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                    </div>

                    {/* Product Details & Configurator (Right) */}
                    <div className="flex-1 px-8 py-12 lg:pt-32 lg:pb-16 max-w-2xl mx-auto flex flex-col justify-center">

                        <div className="mb-8">
                            <h1 className="text-3xl md:text-5xl font-light font-display mb-2">{PRODUCT.title}</h1>
                            <p className="text-urban-stone text-sm uppercase tracking-widest">{PRODUCT.collection}</p>
                        </div>

                        <div className="flex items-baseline gap-4 mb-8 border-b border-[#1A1714]/10 dark:border-white/10 pb-8">
                            <span className="text-3xl font-light">₹{currentPrice}</span>
                            <span className="text-sm text-urban-stone">/ sq.ft approx</span>
                        </div>

                        <p className="text-lg font-light leading-relaxed text-urban-stone mb-12">
                            {PRODUCT.description}
                        </p>

                        {/* Configurator Controls */}
                        <div className="space-y-8 mb-12">
                            {/* Color Selection */}
                            <div className="space-y-4">
                                <span className="text-xs uppercase tracking-widest font-medium text-urban-stone">Select Tone</span>
                                <div className="flex gap-4">
                                    {PRODUCT.variants.map((variant) => (
                                        <button
                                            key={variant.id}
                                            onClick={() => setSelectedVariant(variant)}
                                            className={`relative w-16 h-16 rounded-full border-2 transition-all ${selectedVariant.id === variant.id ? 'border-urban-terracotta scale-110' : 'border-transparent hover:scale-105'}`}
                                        >
                                            <span
                                                className="absolute inset-1 rounded-full shadow-inner"
                                                style={{ backgroundColor: variant.color }}
                                            />
                                            {selectedVariant.id === variant.id && (
                                                <span className="absolute -bottom-2 md:-bottom-6 left-1/2 -translate-x-1/2 text-[10px] w-full text-center whitespace-nowrap font-medium opacity-0 md:opacity-100">{variant.name}</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Finish Selection */}
                            <div className="space-y-4 pt-4">
                                <span className="text-xs uppercase tracking-widest font-medium text-urban-stone">Surface Finish</span>
                                <div className="flex flex-wrap gap-3">
                                    {PRODUCT.finishes.map((finish) => (
                                        <button
                                            key={finish}
                                            onClick={() => setSelectedFinish(finish)}
                                            className={`px-6 py-3 rounded-lg border transition-all text-sm ${selectedFinish === finish
                                                ? 'border-urban-terracotta bg-urban-terracotta text-white'
                                                : 'border-[#1A1714]/10 dark:border-white/10 hover:border-urban-terracotta/50'
                                                }`}
                                        >
                                            {finish}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Tech Specs Summary */}
                        <div className="grid grid-cols-2 gap-4 mb-12">
                            <div className="p-4 bg-urban-stone/5 rounded-xl flex items-start gap-3">
                                <ThermometerSun className="w-5 h-5 text-urban-terracotta" />
                                <div>
                                    <h4 className="text-sm font-medium">Thermal Rated</h4>
                                    <p className="text-xs text-urban-stone mt-1">Reduces indoor heat by 4°C</p>
                                </div>
                            </div>
                            <div className="p-4 bg-urban-stone/5 rounded-xl flex items-start gap-3">
                                <ShieldCheck className="w-5 h-5 text-urban-terracotta" />
                                <div>
                                    <h4 className="text-sm font-medium">50-Year Warranty</h4>
                                    <p className="text-xs text-urban-stone mt-1">Color fade resistant</p>
                                </div>
                            </div>
                        </div>

                        {/* CTAs */}
                        <div className="space-y-4 sticky bottom-6 bg-[#FDFDFD] dark:bg-[#1A1714] p-4 -m-4 border-t border-[#1A1714]/5 dark:border-white/5 shadow-2xl lg:shadow-none lg:static lg:p-0 lg:m-0 lg:border-none lg:bg-transparent">
                            <button className="w-full py-4 bg-[#1A1714] dark:bg-white text-white dark:text-[#1A1714] text-sm uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 font-medium">
                                Request Sample Kit <ArrowRight className="w-4 h-4" />
                            </button>
                            <button className="w-full py-4 border border-[#1A1714]/10 dark:border-white/10 text-sm uppercase tracking-widest rounded-xl hover:bg-[#1A1714]/5 transition-colors flex items-center justify-center gap-2">
                                <Download className="w-4 h-4" />
                                Download Technical Spec
                            </button>
                        </div>

                    </div>
                </div>
            </main>
        </ReactLenis>
    );
}
