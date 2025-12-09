"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useUser } from '@/app/context/UserContext';
import { MoodboardItem } from '@/lib/types';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import {
    LayoutGrid,
    Share2,
    Download,
    Plus,
    Image as ImageIcon,
    Palette,
    Type,
    Maximize2,
    Trash2,
    Copy,
    ChevronLeft,
    Sparkles,
    Settings2,
    GripHorizontal,
    Move
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- MOCK LIBRARY DATA ---
const SUGGESTED_MATERIALS = [
    { id: 'm1', title: 'Exposed Brick (Red)', src: 'https://images.unsplash.com/photo-1620626012053-1c167f7eb08f?w=400', type: 'material' },
    { id: 'm2', title: 'Charcoal Tile', src: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400', type: 'material' },
    { id: 'm3', title: 'Limewash Beige', src: 'https://images.unsplash.com/photo-1596275150824-34327bd78169?w=400', type: 'material' },
    { id: 'm4', title: 'Terracotta Jali', src: 'https://images.unsplash.com/photo-1593301077227-802dc6787966?w=400', type: 'material' }
];

const COLOR_PALETTES = [
    { name: 'Warm Earth', colors: ['#A85A45', '#E6D8C7', '#2A2622'] },
    { name: 'Modern Grey', colors: ['#Ececec', '#888888', '#111111'] },
    { name: 'Forest Clay', colors: ['#8A7E6E', '#4A5D4F', '#A0522D'] }
];

export default function MoodboardPage() {
    const { user } = useUser();
    const [items, setItems] = useState<MoodboardItem[]>([
        {
            id: 'title-1',
            type: 'note',
            text: 'Living Room Concept',
            x: 100,
            y: 80,
            width: 300,
            height: 120, // Taller for better note display
            rotation: 0,
            zIndex: 1,
            locked: false
        }
    ]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [rightRailOpen, setRightRailOpen] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    // --- ACTIONS ---

    const addItem = (type: MoodboardItem['type'], data: any) => {
        const newItem: MoodboardItem = {
            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            x: 400 + (Math.random() * 100),
            y: 300 + (Math.random() * 100),
            width: type === 'note' ? 240 : 280,
            height: type === 'note' ? 160 : 280, // Default sizes
            rotation: 0,
            zIndex: items.reduce((max, item) => Math.max(max, item.zIndex), 0) + 1,
            locked: false,
            ...data
        };
        setItems(prev => [...prev, newItem]);
        setSelectedId(newItem.id);
    };

    const updateItem = (id: string, updates: Partial<MoodboardItem>) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    const deleteItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
        setSelectedId(null);
    };

    const duplicateItem = (id: string) => {
        const item = items.find(i => i.id === id);
        if (item) {
            addItem(item.type, {
                ...item,
                id: undefined,
                x: item.x + 30,
                y: item.y + 30,
                zIndex: items.length + 1
            });
        }
    };

    const bringToFront = (id: string) => {
        const maxZ = items.reduce((max, item) => Math.max(max, item.zIndex), 0);
        updateItem(id, { zIndex: maxZ + 1 });
    };

    // --- EVENT HANDLERS ---

    // Deselect logic
    const handleCanvasClick = (e: React.MouseEvent) => {
        if (e.target === containerRef.current) {
            setSelectedId(null);
        }
    };

    if (!user) return <div className="h-screen w-screen flex items-center justify-center bg-black text-white">Loading project...</div>;

    return (
        <div className="flex h-screen w-screen bg-[#0d0d0d] text-white overflow-hidden font-sans">

            {/* 1. LEFT SIDEBAR (Project Info) - Fixed visual hierarchy */}
            <aside className="w-[280px] border-r border-white/5 bg-[#121212] flex flex-col z-20 shrink-0">
                <div className="p-6 border-b border-white/5">
                    <Link href="/discover" className="flex items-center gap-2 mb-6 text-white/50 hover:text-white transition-colors text-sm">
                        <ChevronLeft className="w-4 h-4" /> Back to Discover
                    </Link>
                    <h1 className="font-serif italic text-2xl tracking-tight text-white mb-1">UrbanClay Studio</h1>
                    <span className="text-[10px] uppercase tracking-widest text-white/40">Moodboard Engine v1.1</span>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Project Metadata */}
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-widest text-white/40">Project</label>
                            <input
                                type="text"
                                defaultValue={user.businessName || "Undefined Project"}
                                className="w-full bg-transparent border-b border-white/10 py-1 text-sm font-medium focus:border-urban-terracotta focus:outline-none transition-colors"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] uppercase tracking-widest text-white/40 mb-1 block">Style</label>
                                <div className="bg-white/5 px-2 py-1.5 rounded text-xs text-white/80">{user.architecturalStyle || "Modern"}</div>
                            </div>
                            <div>
                                <label className="text-[10px] uppercase tracking-widest text-white/40 mb-1 block">Context</label>
                                <div className="bg-white/5 px-2 py-1.5 rounded text-xs text-white/80 truncate" title={user.projectType || "Residential"}>{user.projectType || "Residential"}</div>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-white/5 w-full" />

                    {/* Tools */}
                    <div className="space-y-3">
                        <label className="text-[10px] uppercase tracking-widest text-white/40">Tools</label>
                        <button onClick={() => addItem('note', { text: 'New Note' })} className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm text-left group">
                            <Type className="w-4 h-4 text-urban-terracotta group-hover:scale-110 transition-transform" /> Add Note
                        </button>
                        <button onClick={() => addItem('swatch', { color: '#AE5A42', name: 'Terracotta' })} className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm text-left group">
                            <Palette className="w-4 h-4 text-urban-terracotta group-hover:scale-110 transition-transform" /> Add Color Swatch
                        </button>
                        <button onClick={() => { }} className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm text-left opacity-60 cursor-not-allowed">
                            <ImageIcon className="w-4 h-4 text-urban-terracotta" /> Upload Image
                        </button>
                    </div>
                </div>

                <div className="p-6 border-t border-white/5 space-y-3 bg-[#151515]">
                    <button className="w-full py-3 bg-urban-terracotta text-white text-sm font-medium rounded hover:bg-urban-terracotta/90 transition-colors shadow-lg shadow-urban-terracotta/20">
                        Export Board
                    </button>
                </div>
            </aside>

            {/* 2. MAIN CANVAS */}
            <main
                ref={containerRef}
                className="flex-1 relative bg-[#090909] overflow-hidden"
                onClick={handleCanvasClick}
            >
                {/* Dot Grid Background */}
                <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #888888 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                    }}
                />

                {/* Navbar Overlay */}
                <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-30 pointer-events-none">
                    <div className="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-[#1A1A1A]/90 backdrop-blur-md rounded-full border border-white/10 text-white/60 text-sm shadow-xl">
                        <span className="text-white font-medium">Moodboard Canvas</span>
                        <span className="text-white/20">|</span>
                        <span className="text-xs">{items.length} items</span>
                    </div>

                    <div className="pointer-events-auto flex items-center gap-2">
                        <button
                            onClick={() => setRightRailOpen(!rightRailOpen)}
                            className={cn(
                                "p-3 rounded-full border border-white/10 transition-all shadow-xl",
                                rightRailOpen ? "bg-white text-black" : "bg-[#1A1A1A]/90 text-white hover:bg-white/10"
                            )}>
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Canvas Items */}
                {items.map((item) => (
                    <MoodboardItemComponent
                        key={item.id}
                        item={item}
                        isSelected={selectedId === item.id}
                        onSelect={() => {
                            setSelectedId(item.id);
                            bringToFront(item.id);
                        }}
                        onUpdate={(updates) => updateItem(item.id, updates)}
                        onDelete={() => deleteItem(item.id)}
                        onDuplicate={() => duplicateItem(item.id)}
                    />
                ))}

                {/* Empty State */}
                {items.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-white/20">
                        <div className="w-24 h-24 border-2 border-dashed border-white/10 rounded-xl mb-4 flex items-center justify-center">
                            <Plus className="w-8 h-8" />
                        </div>
                        <p className="uppercase tracking-widest text-sm">Canvas Empty</p>
                    </div>
                )}
            </main>

            {/* 3. RIGHT RAIL (Material Library) */}
            <AnimatePresence mode='wait'>
                {rightRailOpen && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 340, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="border-l border-white/5 bg-[#121212] flex flex-col z-20 overflow-hidden h-full shadow-2xl"
                    >
                        <div className="p-5 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#151515]">
                            <span className="text-xs uppercase tracking-widest font-bold text-white/90">Asset Library</span>
                            <Settings2 className="w-4 h-4 text-white/40 cursor-pointer hover:text-white" />
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-8 scrollbar-hide">

                            {/* AI Suggestions */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5 text-urban-terracotta" />
                                    <span className="text-[10px] uppercase tracking-widest text-urban-terracotta font-medium">For {user.architecturalStyle || "Your Project"}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {SUGGESTED_MATERIALS.slice(0, 2).map((mat) => (
                                        <LibraryItem key={`ai-${mat.id}`} item={mat} onAdd={() => addItem('material', { src: mat.src, name: mat.title })} />
                                    ))}
                                </div>
                            </div>

                            {/* Color Palettes */}
                            <div className="space-y-3">
                                <span className="text-[10px] uppercase tracking-widest text-white/40 font-medium">Palettes</span>
                                <div className="space-y-4">
                                    {COLOR_PALETTES.map((palette) => (
                                        <div key={palette.name} className="bg-white/5 p-3 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs text-white/70">{palette.name}</span>
                                                <Plus className="w-3 h-3 text-white/30 cursor-pointer hover:text-white" onClick={() => {
                                                    // Add all colors
                                                    palette.colors.forEach((c, i) => {
                                                        addItem('swatch', { color: c, name: palette.name, x: 400 + (i * 40), y: 300 });
                                                    })
                                                }} />
                                            </div>
                                            <div className="flex gap-2">
                                                {palette.colors.map(color => (
                                                    <button
                                                        key={color}
                                                        onClick={() => addItem('swatch', { color, name: palette.name })}
                                                        className="w-8 h-8 rounded-full ring-1 ring-white/10 hover:scale-110 transition-transform shadow-sm"
                                                        style={{ backgroundColor: color }}
                                                        title={color}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* General Library - Filtered to avoid duplicates if possible, or just labeled differently */}
                            <div className="space-y-3">
                                <span className="text-[10px] uppercase tracking-widest text-white/40 font-medium">Global Materials</span>
                                <div className="grid grid-cols-2 gap-3">
                                    {SUGGESTED_MATERIALS.slice(2).map((mat) => (
                                        <LibraryItem key={`lib-${mat.id}`} item={mat} onAdd={() => addItem('material', { src: mat.src, name: mat.title })} />
                                    ))}
                                    {/* Re-add some variety here if we had a real backend, for now simple slice to avoid exact same top 2 being repeated immediately below */}
                                </div>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>
        </div>
    );
}

// --- SUB-COMPONENTS ---

function LibraryItem({ item, onAdd }: { item: any, onAdd: () => void }) {
    return (
        <button
            onClick={onAdd}
            className="group relative aspect-square w-full bg-[#1A1A1A] rounded-lg overflow-hidden border border-white/5 hover:border-urban-terracotta/50 transition-colors text-left"
        >
            <Image
                src={item.src}
                alt={item.title}
                fill
                className="object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-300"
            />
            <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-6">
                <p className="text-[10px] font-medium text-white truncate">{item.title}</p>
            </div>
            <div className="absolute top-2 right-2 bg-black/50 backdrop-blur rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-1 group-hover:translate-y-0">
                <Plus className="w-3 h-3 text-white" />
            </div>
        </button>
    )
}

interface ItemProps {
    item: MoodboardItem;
    isSelected: boolean;
    onSelect: () => void;
    onUpdate: (updates: Partial<MoodboardItem>) => void;
    onDelete: () => void;
    onDuplicate: () => void;
}

function MoodboardItemComponent({ item, isSelected, onSelect, onUpdate, onDelete, onDuplicate }: ItemProps) {
    const nodeRef = useRef<HTMLDivElement>(null);
    const [isResizing, setIsResizing] = useState(false);

    // Initial drag position sync
    // We don't need sync effect if we control via props + onDragEnd update

    const handleResizeStart = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsResizing(true);

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = item.width;
        const startHeight = item.height;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const newWidth = Math.max(100, startWidth + (moveEvent.clientX - startX));
            const newHeight = Math.max(100, startHeight + (moveEvent.clientY - startY));
            onUpdate({ width: newWidth, height: newHeight });
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <motion.div
            drag
            dragMomentum={false}
            onDragStart={() => onSelect()}
            onDragEnd={(_, info: PanInfo) => {
                onUpdate({ x: item.x + info.offset.x, y: item.y + info.offset.y });
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute rounded-lg"
            style={{
                left: item.x,
                top: item.y,
                zIndex: item.zIndex,
                width: item.width,
                height: item.height,
                touchAction: 'none'
            }}
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
        >
            <div
                ref={nodeRef}
                className={cn(
                    "w-full h-full relative bg-[#1A1A1A] rounded-lg overflow-hidden transition-shadow duration-200 group",
                    isSelected ? "ring-2 ring-urban-terracotta shadow-[0_0_30px_rgba(0,0,0,0.5)]" : "ring-1 ring-white/10 hover:ring-white/30 shadow-xl"
                )}
            >
                {/* Drag Handle Overlay (visible on hover/select) */}
                <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-black/50 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                {/* CONTENT RENDERING */}
                {item.type === 'swatch' && (
                    <div className="w-full h-full flex flex-col">
                        <div className="flex-1" style={{ backgroundColor: item.color }} />
                        <div className="h-8 bg-[#151515] flex items-center px-3 border-t border-white/5">
                            <span className="text-[10px] uppercase font-bold text-white/50">{item.name}</span>
                            <span className="ml-auto text-[9px] font-mono text-white/30">{item.color}</span>
                        </div>
                    </div>
                )}

                {(item.type === 'image' || item.type === 'material') && item.src && (
                    <>
                        <Image
                            src={item.src}
                            alt="Material"
                            fill
                            className="object-cover pointer-events-none"
                            draggable={false}
                        />
                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-xs font-medium text-white/90 truncate">{item.name || 'Untitled'}</p>
                        </div>
                    </>
                )}

                {item.type === 'note' && (
                    <div className="w-full h-full bg-[#1E1E1E] flex flex-col">
                        <div className="h-6 bg-[#252525] w-full flex items-center px-2 cursor-grab active:cursor-grabbing border-b border-white/5">
                            <div className="w-2 h-2 rounded-full bg-urban-terracotta/50 mr-2" />
                            <span className="text-[9px] uppercase tracking-widest text-white/30">Note</span>
                        </div>
                        <textarea
                            className="flex-1 w-full bg-transparent p-4 text-sm text-white/90 resize-none focus:outline-none font-serif leading-relaxed"
                            defaultValue={item.text}
                            placeholder="Type a note..."
                            onBlur={(e) => onUpdate({ text: e.target.value })}
                            onKeyDown={(e) => e.stopPropagation()}
                        />
                    </div>
                )}

                {/* CONTROLS (Only when selected) */}
                {isSelected && (
                    <>
                        {/* Context Menu */}
                        <div className="absolute -top-10 right-0 flex items-center bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <button onClick={(e) => { e.stopPropagation(); onDuplicate() }} className="p-2 hover:bg-white/10 text-white/70 hover:text-white transition-colors" title="Duplicate">
                                <Copy className="w-3.5 h-3.5" />
                            </button>
                            <div className="w-px h-4 bg-white/10" />
                            <button onClick={(e) => { e.stopPropagation(); onDelete() }} className="p-2 hover:bg-red-500/20 text-white/70 hover:text-red-500 transition-colors" title="Delete">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Resize Handle */}
                        <div
                            className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize flex items-center justify-center text-white/50 hover:text-white z-50 bg-black/20 rounded-tl-lg"
                            onMouseDown={handleResizeStart}
                        >
                            <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor" className="transform rotate-90">
                                <path d="M6 6L0 6L6 0V6Z" />
                            </svg>
                        </div>
                    </>
                )}
            </div>
        </motion.div>
    );
}
