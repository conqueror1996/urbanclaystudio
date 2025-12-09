"use client";

import { useState } from "react";
import { Search, Loader2, Sparkles, Filter, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { parseSearchQuery } from "@/app/actions/smart-search";
import { searchCatalog } from "@/lib/sanity-utils";
import { getImagesToReindex, reindexImage } from "@/app/actions/reindex-catalog";

export function InventoryExplorer() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [activeFilters, setActiveFilters] = useState<any>(null);

    // Re-indexing State
    const [isReindexing, setIsReindexing] = useState(false);
    const [reindexProgress, setReindexProgress] = useState({ current: 0, total: 0 });

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        setHasSearched(true);

        try {
            // 1. AI Parsing
            const filters = await parseSearchQuery(query);
            setActiveFilters(filters);

            // 2. Database Search
            const data = await searchCatalog(filters);
            setResults(data);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleReindex = async () => {
        if (!confirm("This will scan all 200+ images in your catalog and use AI to generate missing tags. This process may take a few minutes. Continue?")) return;

        setIsReindexing(true);
        setReindexProgress({ current: 0, total: 0 });

        try {
            // 1. Get List
            const images = await getImagesToReindex({ forceAll: true });
            setReindexProgress({ current: 0, total: images.length });

            // 2. Process Sequentially (to avoid rate limits)
            for (let i = 0; i < images.length; i++) {
                const img = images[i];
                await reindexImage(img._id, img.url);
                setReindexProgress(prev => ({ ...prev, current: i + 1 }));
            }

            alert("Catalog Re-indexing Complete!");
        } catch (error) {
            console.error("Reindexing failed:", error);
            alert("Reindexing stopped due to an error. Check console.");
        } finally {
            setIsReindexing(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header / Actions */}
            <div className="flex justify-end px-4">
                {isReindexing ? (
                    <div className="flex items-center gap-3 bg-urban-stone/10 px-4 py-2 rounded-full text-xs font-mono text-urban-stone">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>AI Indexing: {reindexProgress.current} / {reindexProgress.total}</span>
                        <div className="w-20 h-1 bg-black/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-urban-terracotta transition-all duration-300"
                                style={{ width: `${(reindexProgress.current / Math.max(reindexProgress.total, 1)) * 100}%` }}
                            />
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={handleReindex}
                        className="flex items-center gap-2 text-xs text-urban-stone hover:text-urban-terracotta transition-colors"
                    >
                        <RefreshCw className="w-3 h-3" />
                        Re-Scan Catalog Metadata
                    </button>
                )}
            </div>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
                <form onSubmit={handleSearch} className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-urban-terracotta/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative bg-white dark:bg-[#1A1714] border border-black/10 dark:border-white/10 rounded-2xl shadow-lg flex items-center p-2">
                        <div className="pl-4 pr-3 text-urban-terracotta">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Find 'Cozy rustic homes with brick'..."
                            className="flex-1 bg-transparent border-none outline-none text-lg px-2 py-3 placeholder-urban-stone/50"
                        />
                        <button
                            type="submit"
                            disabled={isSearching}
                            className="bg-urban-terracotta text-white px-6 py-3 rounded-xl font-medium hover:bg-urban-terracotta-soft transition-colors flex items-center gap-2"
                        >
                            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                            Search
                        </button>
                    </div>
                </form>

                {/* Active Filters Display */}
                {activeFilters && (
                    <div className="flex flex-wrap gap-2 mt-4 justify-center">
                        {activeFilters.materials?.map((m: string) => (
                            <span key={m} className="px-3 py-1 bg-urban-terracotta/10 text-urban-terracotta rounded-full text-xs font-medium border border-urban-terracotta/20">
                                Material: {m}
                            </span>
                        ))}
                        {activeFilters.styles?.map((s: string) => (
                            <span key={s} className="px-3 py-1 bg-purple-500/10 text-purple-600 rounded-full text-xs font-medium border border-purple-500/20">
                                Style: {s}
                            </span>
                        ))}
                        {activeFilters.freeText && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                Text: "{activeFilters.freeText}"
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Results Grid */}
            <div className="min-h-[400px]">
                {isSearching ? (
                    <div className="h-64 flex flex-col items-center justify-center text-urban-stone animate-pulse">
                        <Sparkles className="w-8 h-8 mb-4 text-urban-terracotta opacity-50" />
                        <p>AI is understanding your request...</p>
                    </div>
                ) : results.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {results.map((item) => (
                            <motion.div
                                key={item._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-black/5"
                            >
                                <img
                                    src={item.imageUrl}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                                    <h3 className="text-white font-medium text-sm mb-1">{item.title}</h3>
                                    <p className="text-white/70 text-xs">{item.material} • {item.style}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : hasSearched ? (
                    <div className="text-center py-20 text-urban-stone">
                        <Filter className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium">No matches found</p>
                        <p className="text-sm">Try using simpler keywords or browse categories.</p>
                    </div>
                ) : (
                    <div className="text-center py-20 text-urban-stone/50">
                        <p>Enter a description to search specific architectural styles using AI.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
