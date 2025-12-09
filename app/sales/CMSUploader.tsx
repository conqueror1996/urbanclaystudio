"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, Loader2, Check, ExternalLink, Plus, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadDirectToSanity } from "@/lib/sanity-utils";
import { analyzeImage } from "@/app/actions/analyze-image";

// Types
type TagState = {
    material: string;
    style: string;
    projectType: string;
};

type UploadItem = {
    id: string;
    file: File;
    preview: string;
    status: 'pending' | 'analyzing' | 'analyzed' | 'uploading' | 'success' | 'error';
    isAnalyzing: boolean; // Tracking AI status specifically for UI feedback
    tags: TagState;
};

const DEFAULT_TAGS: TagState = {
    material: "Brick Tile",
    style: "Modern Minimal",
    projectType: "Residential"
};

export function CMSUploader() {
    const [queue, setQueue] = useState<UploadItem[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);

    // Derived state for the active item
    const activeItem = queue.find(item => item.id === activeId) || null;

    // Overall status
    const isGlobalUploading = queue.some(item => item.status === 'uploading');
    const allSuccess = queue.length > 0 && queue.every(item => item.status === 'success');

    // Handle File Selection (Multiple)
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);

            const newItems: UploadItem[] = newFiles.map(file => ({
                id: Math.random().toString(36).substr(2, 9),
                file,
                preview: URL.createObjectURL(file),
                status: 'pending',
                isAnalyzing: true,
                tags: { ...DEFAULT_TAGS } // Start with defaults
            }));

            // Add to queue
            setQueue(prev => [...prev, ...newItems]);

            // If no active item, set the first new one as active
            if (!activeId && newItems.length > 0) {
                setActiveId(newItems[0].id);
            }

            // Trigger AI Analysis for each NEW item
            newItems.forEach(item => analyzeItem(item));
        }
    };

    const analyzeItem = async (item: UploadItem) => {
        try {
            const formData = new FormData();
            formData.append("file", item.file);

            // We keep the status as 'pending' but show 'isAnalyzing' true
            const result = await analyzeImage(formData);

            if (result) {
                setQueue(prev => prev.map(qItem => {
                    if (qItem.id !== item.id) return qItem;

                    return {
                        ...qItem,
                        isAnalyzing: false,
                        status: 'analyzed', // Mark as ready for review
                        tags: {
                            ...qItem.tags,
                            style: ['Modern Minimal', 'Rustic', 'Heritage', 'Industrial', 'Contemporary'].includes(result.style)
                                ? result.style
                                : qItem.tags.style,
                            material: result.material || qItem.tags.material
                        }
                    };
                }));
            } else {
                setQueue(prev => prev.map(q => q.id === item.id ? { ...q, isAnalyzing: false } : q));
            }
        } catch (error) {
            console.error(`Analysis failed for ${item.id}`, error);
            setQueue(prev => prev.map(q => q.id === item.id ? { ...q, isAnalyzing: false, status: 'error' } : q));
        }
    };

    // Update tags for the ACTIVE item
    const updateActiveTags = (key: keyof TagState, value: string) => {
        if (!activeId) return;
        setQueue(prev => prev.map(item =>
            item.id === activeId
                ? { ...item, tags: { ...item.tags, [key]: value } }
                : item
        ));
    };

    const removeFile = (e: React.MouseEvent, idToRemove: string) => {
        e.stopPropagation();
        const newQueue = queue.filter(item => item.id !== idToRemove);
        setQueue(newQueue);

        // If we removed the active item, pick a new one
        if (idToRemove === activeId) {
            setActiveId(newQueue.length > 0 ? newQueue[0].id : null);
        }
    };

    const handleUploadAll = async () => {
        if (queue.length === 0) return;

        // Filter for items that need uploading
        const pendingItems = queue.filter(item => item.status !== 'success');

        for (const item of pendingItems) {
            // Update status to uploading
            setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'uploading' } : q));

            try {
                const formData = new FormData();
                formData.append('file', item.file);
                formData.append('material', item.tags.material);
                formData.append('style', item.tags.style);
                formData.append('projectType', item.tags.projectType);

                await uploadDirectToSanity(formData);

                setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'success' } : q));
            } catch (error) {
                console.error(`Upload failed for ${item.id}`, error);
                setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'error' } : q));
            }
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start h-[calc(100vh-200px)] min-h-[600px]">

            {/* Left Panel: Preview & Queue (8 Cols) */}
            <div className="lg:col-span-8 flex flex-col h-full gap-6">

                {/* Main Preview Area */}
                <div className="flex-1 relative bg-[#1A1714]/5 dark:bg-black/20 rounded-3xl border border-black/5 dark:border-white/5 overflow-hidden group">
                    {activeItem ? (
                        <div className="relative w-full h-full flex flex-col">
                            {/* The Image */}
                            <div className="relative w-full h-full">
                                <img
                                    src={activeItem.preview}
                                    alt="Preview"
                                    className="w-full h-full object-contain p-4"
                                />

                                {/* Analysis Overlay */}
                                {activeItem.isAnalyzing && (
                                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10 shadow-xl">
                                        <Loader2 className="w-3 h-3 animate-spin text-urban-terracotta" />
                                        <span>AI analyzing materials...</span>
                                    </div>
                                )}
                            </div>

                            {/* Info Bar at Bottom of Image */}
                            <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-[#1A1714]/90 backdrop-blur-md p-4 rounded-2xl border border-black/5 dark:border-white/10 flex items-center justify-between shadow-lg">
                                <div>
                                    <h4 className="text-sm font-medium">{activeItem.file.name}</h4>
                                    <p className="text-xs text-urban-stone">
                                        {(activeItem.file.size / 1024 / 1024).toFixed(2)} MB • {activeItem.tags.style}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => removeFile(e, activeItem.id)}
                                    className="p-2 hover:bg-red-50 text-urban-stone hover:text-red-500 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Empty State
                        <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                            <div className="w-20 h-20 rounded-full bg-urban-terracotta/10 flex items-center justify-center mb-6">
                                <Upload className="w-8 h-8 text-urban-terracotta" />
                            </div>
                            <h3 className="text-xl font-medium mb-2">Upload Project Gallery</h3>
                            <p className="text-urban-stone text-sm">Drag & drop multiple photos here</p>
                        </label>
                    )}
                </div>

                {/* Queue / Thumbnails */}
                {queue.length > 0 && (
                    <div className="h-32 flex items-center gap-4 overflow-x-auto pb-2 px-1">
                        {/* New Upload Button in strip */}
                        <label className="flex-shrink-0 w-24 h-24 rounded-2xl border-2 border-dashed border-black/10 dark:border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-urban-terracotta hover:text-urban-terracotta transition-colors text-urban-stone">
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelect} />
                            <Plus className="w-6 h-6 mb-1" />
                            <span className="text-[10px] font-medium uppercase tracking-wider">Add More</span>
                        </label>

                        {/* List */}
                        {queue.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveId(item.id)}
                                className={`relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${activeId === item.id
                                        ? 'border-urban-terracotta ring-2 ring-urban-terracotta/20 scale-105'
                                        : 'border-transparent opacity-70 hover:opacity-100'
                                    }`}
                            >
                                <img src={item.preview} alt="" className="w-full h-full object-cover" />

                                {/* Status Pip */}
                                <div className="absolute top-1 right-1">
                                    {item.status === 'success' && <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"><Check className="w-2 h-2 text-white" /></div>}
                                    {item.status === 'uploading' && <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center"><Loader2 className="w-2 h-2 text-white animate-spin" /></div>}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Right Panel: Controls (4 Cols) */}
            <div className="lg:col-span-4 bg-white dark:bg-[#1A1714] border border-black/5 dark:border-white/5 rounded-3xl p-6 h-full flex flex-col shadow-sm">

                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-medium text-lg">Asset Details</h3>
                    <div className="text-xs text-urban-stone font-mono">
                        {queue.length > 0 ? `${queue.indexOf(activeItem!) + 1} / ${queue.length}` : '0 / 0'}
                    </div>
                </div>

                {activeItem ? (
                    <div className="space-y-8 flex-1 overflow-y-auto pr-2">
                        {/* Status Message */}
                        <div className={`p-4 rounded-xl text-sm ${activeItem.isAnalyzing ? 'bg-urban-stone/10 text-urban-stone animate-pulse' :
                                activeItem.status === 'success' ? 'bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400' :
                                    'bg-urban-terracotta/10 text-urban-terracotta'
                            }`}>
                            {activeItem.isAnalyzing ? "AI is gathering insights..." :
                                activeItem.status === 'success' ? "Asset successfully indexed." :
                                    "Ready for configuration."}
                        </div>

                        {/* Inputs */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-urban-stone font-medium">Material</label>
                                <select
                                    value={activeItem.tags.material}
                                    onChange={(e) => updateActiveTags('material', e.target.value)}
                                    className="w-full bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-urban-terracotta transition-colors"
                                >
                                    <option value="Brick Tile">Brick Tile (Cladding)</option>
                                    <option value="Exposed Brick">Exposed Brick (Masonry)</option>
                                    <option value="Terracotta Jali">Terracotta Jali (Screens)</option>
                                    <option value="Clay Flooring">Clay Flooring (Pavers)</option>
                                    <option value="Roofing Tile">Roofing Tile</option>
                                    <option value="Clay Ceiling Tile">Clay Ceiling Tile</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-urban-stone font-medium">Style</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Modern Minimal', 'Rustic', 'Heritage', 'Industrial', 'Contemporary'].map(style => (
                                        <button
                                            key={style}
                                            onClick={() => updateActiveTags('style', style)}
                                            className={`px-3 py-2 rounded-lg text-xs transition-all border ${activeItem.tags.style === style
                                                    ? 'bg-urban-terracotta border-urban-terracotta text-white shadow-md'
                                                    : 'bg-transparent border-black/5 dark:border-white/5 text-urban-stone hover:border-urban-stone'
                                                }`}
                                        >
                                            {style}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-urban-stone opacity-50">
                        <ImageIcon className="w-12 h-12 mb-4" />
                        <p>Select an image to edit details</p>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="pt-6 border-t border-black/5 dark:border-white/5 mt-auto">
                    <button
                        onClick={handleUploadAll}
                        disabled={queue.length === 0 || isGlobalUploading || allSuccess}
                        className={`w-full py-4 rounded-xl font-medium text-sm tracking-wide transition-all flex items-center justify-center gap-2 ${allSuccess ? 'bg-green-500 text-white' :
                                queue.length === 0 ? 'bg-urban-stone/10 text-urban-stone cursor-not-allowed' :
                                    isGlobalUploading ? 'bg-urban-terracotta text-white/50 cursor-wait' :
                                        'bg-urban-terracotta text-white hover:bg-urban-terracotta/90 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                            }`}
                    >
                        {isGlobalUploading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing Batch...
                            </>
                        ) : allSuccess ? (
                            <>
                                <Check className="w-4 h-4" />
                                All Assets Uploaded
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4" />
                                {queue.length > 1 ? `Upload ${queue.length} Assets` : 'Upload Asset'}
                            </>
                        )}
                    </button>
                    {allSuccess && (
                        <button
                            onClick={() => { setQueue([]); setActiveId(null); }}
                            className="w-full mt-3 py-2 text-xs text-urban-stone hover:text-urban-terracotta transition-colors"
                        >
                            Start New Batch
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
