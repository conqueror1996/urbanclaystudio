
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
import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";

// Mock Data for a single product (In real app, fetch by ID)
// Mock Data now only a fallback structure if needed
const MOCK_VARIANTS = [
    { id: 'v1', name: 'Natural Red', color: '#C25B37', image: '' },
    { id: 'v2', name: 'Smoked Grey', color: '#4A4A4A', image: '' },
    { id: 'v3', name: 'Sand Beige', color: '#E3D7C8', image: '' },
];

import { getProductById } from "@/lib/sanity-utils";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { saveItem, user, logActivity } = useUser();
    const router = useRouter();

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedFinish, setSelectedFinish] = useState('Smooth');
    const [isSaved, setIsSaved] = useState(false);

    // Fetch Real Data
    useEffect(() => {
        async function loadProduct() {
            setLoading(true);
            try {
                const data = await getProductById(id);
                if (data) {
                    setProduct({
                        ...data,
                        basePrice: 480,
                        collection: "Urban Facade Series",
                        features: ["Thermal Comfort", "Acoustic Insulation", "Fire Resistant"],
                        variants: MOCK_VARIANTS.map(v => ({ ...v, image: data.imageUrl }))
                    });
                    logActivity('View', `Viewed Product: ${data.title}`);
                } else {
                    // FALLBACK FOR MOCK IDs (Demo Safety)
                    console.warn("Product not found in Sanity, using mock fallback.");
                    setProduct({
                        _id: id,
                        title: "Terracotta Screens (Mock)",
                        material: "Terracotta Jali",
                        style: "Modern Minimal",
                        description: "A high-performance breathable facade screen that reduces thermal gain while providing privacy. Using generic fallback data for demonstration.",
                        imageUrl: "https://images.unsplash.com/photo-1593301077227-802dc6787966?q=80&w=1000&auto=format&fit=crop",
                        basePrice: 520,
                        collection: "Heritage Series",
                        features: ["Thermal Comfort", "Privacy Control", "Natural Ventilation"],
                        variants: MOCK_VARIANTS.map(v => ({ ...v, image: "https://images.unsplash.com/photo-1593301077227-802dc6787966?q=80&w=1000&auto=format&fit=crop" }))
                    });
                }
            } catch (e) {
                console.error("Load failed", e);
            } finally {
                setLoading(false);
            }
        }
        loadProduct();
    }, [id]);

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading Specification...</div>;
    if (!product) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Product Not Found</div>;

    const currentPrice = (product.basePrice || 480) + (selectedFinish === 'Grooved' ? 45 : 0);
    // Use the real image as the main visual
    const mainImage = product.imageUrl;

    const handleSave = () => {
        setIsSaved(true);
        const itemToSave = {
            id: product._id,
            title: product.title,
            category: product.material,
            imageUrl: product.imageUrl,
            tags: [product.style, selectedFinish],
            isPremium: true
        };
        saveItem(itemToSave);
        logActivity('Save', `Saved Product: ${itemToSave.title}`);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <ReactLenis root>
            <main className="min-h-screen bg-background text-foreground selection:bg-urban-terracotta selection:text-white">

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
                    <div className="relative w-full lg:w-[65%] h-[60vh] lg:h-screen bg-urban-stone/5 lg:sticky lg:top-0 overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={product._id} // Just use ID as key
                                initial={{ opacity: 0, scale: 1.05 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.7 }}
                                className="absolute inset-0"
                            >
                                <Image
                                    src={mainImage}
                                    alt={product.title}
                                    fill
                                    priority
                                    className="object-cover"
                                />
                            </motion.div>
                        </AnimatePresence>

                        {/* Overlay Context */}
                        <div className="absolute bottom-8 left-8 text-white z-10 max-w-md">
                            <motion.span
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-block px-3 py-1 bg-black/40 backdrop-blur-lg border border-white/10 text-xs uppercase tracking-widest mb-3 rounded-full"
                            >
                                {product.material}
                            </motion.span>
                            <h2 className="text-4xl font-light font-display tracking-tight">
                                Virtual Preview
                            </h2>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                    </div>

                    {/* Product Details & Configurator (Right) */}
                    <div className="flex-1 px-8 py-12 lg:pt-32 lg:pb-16 max-w-2xl mx-auto flex flex-col justify-center">

                        <div className="mb-8">
                            <h1 className="text-3xl md:text-5xl font-light font-display mb-2 tracking-tight leading-tight">{product.title}</h1>
                            <p className="text-urban-stone text-sm uppercase tracking-widest">{product.collection}</p>
                        </div>

                        <div className="flex items-baseline gap-4 mb-8 border-b border-white/10 pb-8">
                            <span className="text-3xl font-light font-display tracking-tight">₹{currentPrice}</span>
                            <span className="text-sm text-urban-stone">/ sq.ft approx</span>
                        </div>

                        <p className="text-lg font-light leading-relaxed text-urban-stone mb-12">
                            {product.description}
                        </p>

                        {/* Configurator Controls */}
                        <div className="space-y-8 mb-12">
                            {/* Color Selection */}
                            <div className="space-y-4">
                                <span className="text-xs uppercase tracking-widest font-medium text-urban-stone">Select Tone</span>
                                <div className="flex gap-4">
                                    {(product.variants || []).map((variant: any) => (
                                        <button
                                            key={variant.id}
                                            disabled
                                            className={`relative w-16 h-16 rounded-full border-2 transition-all ${'v1' === variant.id ? 'border-urban-terracotta scale-110' : 'border-transparent opacity-50 ring-1 ring-white/10'}`}
                                        >
                                            <span
                                                className="absolute inset-1 rounded-full shadow-inner"
                                                style={{ backgroundColor: variant.color }}
                                            />
                                            {'v1' === variant.id && (
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
                                    {(product.features || []).map((finish: string) => ( // Using features as finishes for now
                                        <button
                                            key={finish}
                                            onClick={() => setSelectedFinish(finish)}
                                            className={`px-6 py-3 rounded-lg border transition-all text-sm ${selectedFinish === finish
                                                ? 'border-urban-terracotta bg-urban-terracotta text-white'
                                                : 'border-white/10 hover:border-urban-terracotta/50 bg-white/5'
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
                            <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-start gap-3">
                                <ThermometerSun className="w-5 h-5 text-urban-terracotta" />
                                <div>
                                    <h4 className="text-sm font-medium">Thermal Rated</h4>
                                    <p className="text-xs text-urban-stone mt-1">Reduces indoor heat by 4°C</p>
                                </div>
                            </div>
                            <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-start gap-3">
                                <ShieldCheck className="w-5 h-5 text-urban-terracotta" />
                                <div>
                                    <h4 className="text-sm font-medium">50-Year Warranty</h4>
                                    <p className="text-xs text-urban-stone mt-1">Color fade resistant</p>
                                </div>
                            </div>
                        </div>


                        {/* CTAs */}
                        <div className="space-y-4 sticky bottom-6 bg-background/80 backdrop-blur-xl p-4 -m-4 border-t border-white/10 shadow-2xl lg:shadow-none lg:static lg:p-0 lg:m-0 lg:border-none lg:bg-transparent z-20">
                            <Link href="/sample-request" className="w-full py-4 bg-white text-black text-sm uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 font-medium">
                                Request Sample Kit <ArrowRight className="w-4 h-4" />
                            </Link>
                            <button className="w-full py-4 border border-white/10 text-sm uppercase tracking-widest rounded-xl hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                                <Download className="w-4 h-4" />
                                Download Technical Spec
                            </button>
                        </div>

                        {/* MORE LIKE THIS SECTION */}
                        <div className="mt-20 pt-12 border-t border-white/10">
                            <h3 className="text-xl font-light font-display mb-6">More Like This</h3>
                            <SimilarProductsGrid currentProduct={product} />
                        </div>

                    </div>
                </div>
            </main>
        </ReactLenis>
    );
}

// Subcomponent for "More Like This"
import { getSimilarItems } from "@/lib/sanity-utils";
import { useEffect as useEffectSimilar } from "react";

function SimilarProductsGrid({ currentProduct }: { currentProduct: any }) {
    const [similarItems, setSimilarItems] = useState<any[]>([]);

    useEffectSimilar(() => {
        const fetchSimilar = async () => {
            // In a real app, currentProduct should come from Sanity and have these fields.
            // For now, we mock the input attributes based on the mock PRODUCT.
            const attributes = {
                material: "Terracotta Jali", // Mock mapping from "Clay Facade"
                style: "Modern Minimal",
                projectType: "Commercial"
            };

            const items = await getSimilarItems(currentProduct.id, attributes);
            setSimilarItems(items);
        };
        fetchSimilar();
    }, [currentProduct]);

    if (similarItems.length === 0) return null;

    return (
        <div className="grid grid-cols-2 gap-4">
            {similarItems.map((item) => (
                <Link key={item._id} href={`/product/${item._id}`} className="group block">
                    <div className="aspect-square relative rounded-xl overflow-hidden mb-3 bg-white/5">
                        <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    </div>
                    <h4 className="text-sm font-medium truncate">{item.title}</h4>
                    <p className="text-xs text-urban-stone">{item.material}</p>
                </Link>
            ))}
        </div>
    );
}
