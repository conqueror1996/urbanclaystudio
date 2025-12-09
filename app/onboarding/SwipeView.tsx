"use client";

import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from "framer-motion";
import { Check, X, Loader2, Heart } from "lucide-react";

interface MaterialCard {
    id: string;
    title: string;
    category: string;
    color?: string; // hex for demo background
    tags: string[];
    imageUrl?: string;
}

// Mock data based on prompts
const MOCK_CARDS: MaterialCard[] = [
    { id: '1', title: 'Rough Exposed Brick', category: 'Exposed Brick', color: '#8B4513', tags: ['Rustic', 'Textured'] },
    { id: '2', title: 'Smooth Terracotta Panel', category: 'Clay Facade', color: '#C25B37', tags: ['Modern', 'Smooth'] },
    { id: '3', title: 'Dark Grey Tile', category: 'Clay Tile', color: '#4A4A4A', tags: ['Contemporary', 'Minimal'] },
    { id: '4', title: 'Handmade Clay Paver', category: 'Brick Pavers', color: '#A0522D', tags: ['Heritage', 'Organic'] },
    { id: '5', title: 'Perforated Jali Layout', category: 'Terracotta Jali', color: '#E3D7C8', tags: ['Patterned', 'Open'] },
];

// Haptic feedback utility
const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
    }
};

export default function SwipeView({ onComplete, items }: { onComplete: (vector: any) => void, items?: MaterialCard[] }) {
    // Initialize with items only - NO MOCKS
    const [cards, setCards] = useState<MaterialCard[]>(items || []);
    const [swipedCount, setSwipedCount] = useState(0);
    const [totalCards, setTotalCards] = useState(items ? items.length : 0);

    // Sync state if items prop changes (e.g. after async fetch)
    useEffect(() => {
        // If items are provided (even if empty array), sync them.
        if (items) {
            setCards(items);
            setTotalCards(items.length);
            setSwipedCount(0);
        }
    }, [items]);

    // Simple taste vector simulation
    const [tasteProfile, setTasteProfile] = useState({
        modernity: 50,
        rustic: 50,
        warmth: 50,
    });

    const removeCard = (id: string, direction: 'left' | 'right') => {
        triggerHaptic();
        // In a real app, we update the taste vector here based on card tags
        setCards(prev => prev.filter(c => c.id !== id));
        setSwipedCount(prev => prev + 1);

        if (cards.length <= 1) {
            setTimeout(() => onComplete(tasteProfile), 500);
        }
    };

    return (
        <div className="relative w-full h-[600px] flex flex-col items-center justify-center overflow-hidden touch-none select-none">
            {/* Progress Indicator - Minimal & Smooth */}
            <div className="absolute top-4 z-0 w-full flex justify-center items-center gap-2">
                <div className="w-[80%] h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(swipedCount / totalCards) * 100}%` }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="h-full bg-gradient-to-r from-urban-terracotta to-purple-500"
                    />
                </div>
                <span className="text-xs font-serif italic text-white/40">{swipedCount}/{totalCards}</span>
            </div>

            <AnimatePresence>
                {cards.map((card, index) => {
                    const isFront = index === cards.length - 1;
                    return isFront ? (
                        <Card
                            key={card.id}
                            card={card}
                            onSwipe={(dir) => removeCard(card.id, dir)}
                        />
                    ) : (
                        <CardStackItem key={card.id} index={index} total={cards.length} />
                    );
                })}
            </AnimatePresence>

            {/* Fallback / Complete State */}
            {cards.length === 0 && (
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center p-8 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl"
                >
                    <Loader2 className="w-8 h-8 text-urban-terracotta animate-spin mx-auto mb-4" />
                    <h3 className="text-xl font-display text-white mb-2">Refining Taste Profile</h3>
                    <p className="text-sm text-white/40">Curating your bespoke collection...</p>
                </motion.div>
            )}

            {/* Hint Controls (Mobile Friendly) */}
            <div className="absolute bottom-8 flex gap-8 items-center text-white/30 text-xs tracking-widest uppercase font-medium z-0">
                <span className="flex items-center gap-2"><X className="w-4 h-4" /> Discard</span>
                <span className="flex items-center gap-2">Keep <Check className="w-4 h-4" /></span>
            </div>
        </div>
    );
}

// Background Stack Cards
const CardStackItem = ({ index, total }: { index: number, total: number }) => {
    // Reverse index logic to stack correctly visually
    const stackIndex = total - 1 - index;

    return (
        <motion.div
            className="absolute bg-black/80 backdrop-blur-md rounded-[24px] shadow-2xl border border-white/5"
            style={{
                width: 340,
                height: 480,
                y: 10 * stackIndex,
                scale: 1 - (stackIndex * 0.05),
                zIndex: index,
                opacity: 1 - (stackIndex * 0.3)
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1 - (stackIndex * 0.05), opacity: 1 - (stackIndex * 0.3), y: 15 * stackIndex }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
        />
    )
}

function Card({ card, onSwipe }: { card: MaterialCard, onSwipe: (dir: 'left' | 'right') => void }) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-15, 15]); // Smoother rotation
    const opacity = useTransform(x, [-220, -150, 0, 150, 220], [0, 1, 1, 1, 0]);

    // Scale down slightly when dragging far
    const scale = useTransform(x, [-200, 0, 200], [0.95, 1, 0.95]);

    // Color overlays
    const rightOpacity = useTransform(x, [0, 100], [0, 1]);
    const leftOpacity = useTransform(x, [0, -100], [0, 1]);

    // Icon Scale
    const iconScale = useTransform(x, [-150, 0, 150], [1.2, 0.5, 1.2]);

    const handleDragEnd = (_: any, info: PanInfo) => {
        const threshold = 100;
        const velocity = info.velocity.x;

        if (info.offset.x > threshold || velocity > 500) {
            onSwipe('right');
        } else if (info.offset.x < -threshold || velocity < -500) {
            onSwipe('left');
        }
    };

    return (
        <motion.div
            style={{ x, rotate, opacity, scale, zIndex: 100 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6} // Rubber band effect
            onDragEnd={handleDragEnd}
            whileTap={{ cursor: "grabbing", scale: 1.02 }}
            className="absolute top-12 w-[340px] h-[480px] bg-black rounded-[24px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] cursor-grab border border-white/10 overflow-hidden flex flex-col group touch-action-none ring-1 ring-white/5"
        >
            {/* Image Area */}
            <div
                className="flex-1 w-full relative bg-cover bg-center transition-transform duration-500"
                style={{
                    backgroundColor: card.color || '#0F0F0F',
                    backgroundImage: card.imageUrl ? `url(${card.imageUrl})` : undefined
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                {/* Overlay Feedback - Yes / No */}
                <motion.div style={{ opacity: leftOpacity }} className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10 transition-colors">
                    <motion.div style={{ scale: iconScale }} className="border-2 border-white/20 bg-black/50 text-white/90 rounded-full p-6 shadow-2xl backdrop-blur-md">
                        <X className="w-10 h-10 stroke-[2]" />
                    </motion.div>
                </motion.div>

                <motion.div style={{ opacity: rightOpacity }} className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10 transition-colors">
                    <motion.div style={{ scale: iconScale }} className="border-2 border-urban-terracotta/50 bg-urban-terracotta/20 text-urban-terracotta rounded-full p-6 shadow-2xl backdrop-blur-md">
                        <Heart className="w-10 h-10 stroke-[2] fill-current" />
                    </motion.div>
                </motion.div>

                {/* Content */}
                <div className="absolute bottom-8 left-8 right-8 text-white z-20 pointer-events-none">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-[10px] uppercase tracking-widest font-medium text-white/80">
                            {card.tags[0] || 'Material'}
                        </span>
                    </div>
                    <h3 className="text-3xl font-display font-light leading-none mb-2 tracking-wide text-gray-100">{card.title}</h3>
                    <p className="text-sm text-gray-400 font-light line-clamp-2 tracking-wide">{card.category}</p>
                </div>
            </div>
        </motion.div>
    );
}
