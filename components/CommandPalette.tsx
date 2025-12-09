"use client";

import { useState, useEffect } from "react";
import { Search, ArrowRight, Zap, Command, X, MapPin, Phone, Settings2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
// We'll assume a server action exists, or just do client-side redirection for now
// import { parseSearchQuery } from "@/app/actions/smart-search"; 

export default function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);

    // Mock suggestions
    const QUICK_LINKS = [
        { icon: MapPin, label: "Browse by Location", action: () => router.push('/discover') },
        { icon: Zap, label: "New Arrivals", action: () => router.push('/discover') },
        { icon: Command, label: "Partner Dashboard", action: () => router.push('/sales') },
        { icon: Settings2, label: "Sanity Studio (CMS)", action: () => router.push('/studio') },
    ];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                if (isOpen) onClose();
                // Parent should handle opening, but we handle closing toggle/shortcut here if needed
                // Actually parent usually handles opening. We just handle Esc.
            }
            if (e.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        // Simulating a "Smart Jump"
        // In reality, this would call `parseSearchQuery` -> construct URL -> push
        console.log("Searching for:", query);
        onClose();
        // For now, redirect to Discover with query param (needs implementation in Discover page to read it)
        // Or just go to discover and let them see the feed.
        // Let's assume we just want to navigate for now.
        router.push('/discover');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-[101] px-4"
                    >
                        <div className="bg-[#1A1714] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[60vh]">

                            {/* Search Input */}
                            <form onSubmit={handleSearch} className="relative p-4 border-b border-white/5 flex items-center gap-3">
                                <Search className="w-5 h-5 text-urban-stone" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Ask for anything (e.g., 'Red brick tiles for office')..."
                                    className="flex-1 bg-transparent border-none outline-none text-lg text-white placeholder-white/20 h-10"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                                <div className="hidden md:flex items-center gap-1 px-2 py-1 bg-white/5 rounded text-[10px] text-urban-stone border border-white/5">
                                    <span className="text-xs">ESC</span>
                                </div>
                            </form>

                            {/* Content */}
                            <div className="p-2 overflow-y-auto">
                                {!query && (
                                    <div className="space-y-1">
                                        <p className="px-3 py-2 text-xs font-medium text-urban-stone uppercase tracking-widest">Quick Actions</p>
                                        {QUICK_LINKS.map((link, i) => (
                                            <button
                                                key={i}
                                                onClick={() => { link.action(); onClose(); }}
                                                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 text-left transition-colors group"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-urban-stone group-hover:text-white transition-colors">
                                                    <link.icon className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm text-white/80 group-hover:text-white">{link.label}</span>
                                                <ArrowRight className="w-4 h-4 ml-auto text-urban-stone opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {query && (
                                    <div className="p-4 text-center">
                                        <button
                                            onClick={handleSearch}
                                            className="w-full py-3 bg-urban-terracotta text-white rounded-lg text-sm font-medium hover:bg-urban-terracotta-soft transition-colors"
                                        >
                                            Search for "{query}"
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-3 bg-black/20 border-t border-white/5 flex items-center justify-between text-[10px] text-urban-stone">
                                <div className="flex gap-4">
                                    <span>Search powered by Gemini 2.0</span>
                                </div>
                                <div className="flex gap-2">
                                    <span>↑↓ to navigate</span>
                                    <span>↵ to select</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
