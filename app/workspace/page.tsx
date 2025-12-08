
"use client";

import { useUser } from "@/app/context/UserContext";
import { ReactLenis } from 'lenis/react';
import { motion } from "framer-motion";
import {
    LayoutGrid,
    Layers,
    DollarSign,
    Share2,
    Download,
    MoreHorizontal,
    Trash2,
    Plus,
    Building2,
    Calendar,
    MapPin,
    Box
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function WorkspacePage() {
    const { user, savedItems, removeItem, highTicketScore } = useUser();
    const [activeTab, setActiveTab] = useState<'moodboard' | 'specifications'>('moodboard');
    const moodboardRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    const handleShare = async () => {
        const shareData = {
            title: `UrbanClay Moodboard - ${user?.projectLocation}`,
            text: `Check out the material palette for the ${user?.architecturalStyle} project in ${user?.projectLocation}.`,
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    const handleExportPDF = async () => {
        if (!moodboardRef.current) return;
        setIsExporting(true);

        try {
            const canvas = await html2canvas(moodboardRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            // Add Watermark
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.save();
                ctx.globalAlpha = 0.1;
                ctx.font = 'bold 150px serif';
                ctx.fillStyle = '#000000';
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate(-45 * Math.PI / 180);
                ctx.textAlign = 'center';
                ctx.fillText('UrbanClay Studio', 0, 0);
                ctx.restore();
            }

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`urbanclay-moodboard-${user?.name.replace(/\s+/g, '-').toLowerCase()}.pdf`);
        } catch (err) {
            console.error('PDF generation failed:', err);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setIsExporting(false);
        }
    };

    if (!user) return null; // Should redirect in real app

    return (
        <ReactLenis root>
            <main className="min-h-screen bg-[#FDFDFD] dark:bg-[#1A1714] text-[#1A1714] dark:text-[#E6E1DC] flex flex-col md:flex-row">

                {/* Sidebar Navigation - Hidden on mobile/desktop for Simplicity Mode, using MagicNav instead */}
                <aside className="hidden lg:flex w-64 bg-white dark:bg-[#2A2622]/50 border-r border-[#1A1714]/5 dark:border-white/5 h-screen sticky top-0 flex-col justify-between z-20">
                    <div className="p-6">
                        <Link href="/discover" className="block mb-10">
                            <h1 className="font-serif italic text-2xl font-medium tracking-tight">UrbanClay</h1>
                        </Link>

                        <div className="space-y-1 mb-8">
                            <p className="text-xs uppercase tracking-widest text-urban-stone mb-2 px-3">Project</p>
                            <div className="p-3 bg-urban-terracotta/10 rounded-lg border border-urban-terracotta/20">
                                <h2 className="font-medium text-sm">{user.projectLocation} Residence</h2>
                                <p className="text-xs text-urban-stone mt-1">{user.projectStage}</p>
                            </div>
                        </div>

                        <nav className="space-y-1">
                            <SidebarButton
                                active={activeTab === 'moodboard'}
                                onClick={() => setActiveTab('moodboard')}
                                icon={LayoutGrid}
                                label="Moodboard"
                            />
                            <SidebarButton
                                active={activeTab === 'specifications'}
                                onClick={() => setActiveTab('specifications')}
                                icon={Layers}
                                label="Material Specs"
                            />
                            <SidebarButton
                                icon={DollarSign}
                                label="Cost Estimate"
                                badge="PRO"
                            />
                        </nav>
                    </div>

                    <div className="p-6 border-t border-[#1A1714]/5 dark:border-white/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-urban-terracotta flex items-center justify-center text-white text-xs font-serif italic">
                                {user.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user.name}</p>
                                <p className="text-xs text-urban-stone truncate">{user.email || 'Architect'}</p>
                            </div>
                        </div>
                        {highTicketScore > 50 && (
                            <button className="w-full py-2 bg-[#1A1714] dark:bg-white text-white dark:text-[#1A1714] text-xs uppercase tracking-widest rounded-lg">
                                Concierge
                            </button>
                        )}
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <header className="px-8 py-6 flex items-center justify-between border-b border-[#1A1714]/5 dark:border-white/5 sticky top-0 bg-[#FDFDFD]/80 dark:bg-[#1A1714]/80 backdrop-blur-xl z-10 transition-colors">
                        <div>
                            <h1 className="text-2xl font-light font-display">
                                {activeTab === 'moodboard' ? 'Project Moodboard' : 'Material Specifications'}
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 px-4 py-2 border border-[#1A1714]/10 dark:border-white/10 rounded-full text-sm hover:bg-[#1A1714]/5 transition-colors"
                            >
                                <Share2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Share</span>
                            </button>
                            <Link href="/sample-request" className="flex items-center gap-2 px-4 py-2 bg-[#1A1714] dark:bg-white text-white dark:text-[#1A1714] rounded-full text-sm hover:opacity-90 transition-opacity font-medium">
                                <Box className="w-4 h-4" />
                                <span className="hidden sm:inline">Order Samples</span>
                            </Link>
                            <button
                                onClick={handleExportPDF}
                                disabled={isExporting}
                                className="flex items-center gap-2 px-4 py-2 bg-urban-terracotta text-white rounded-full text-sm hover:bg-urban-terracotta-soft transition-colors shadow-lg shadow-urban-terracotta/20 disabled:opacity-50"
                            >
                                <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
                                <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export PDF'}</span>
                            </button>
                        </div>
                    </header>

                    {/* Content Views */}
                    <div ref={moodboardRef} className="p-8 max-w-[1600px] mx-auto min-h-screen bg-[#FDFDFD] dark:bg-[#1A1714]">

                        {/* Project Stats (Visible on all tabs) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <StatCard
                                icon={Building2}
                                label="Project Type"
                                value={`${user.architecturalStyle} ${user.projectType}`}
                            />
                            <StatCard
                                icon={MapPin}
                                label="Site Context"
                                value={user.projectLocation}
                            />
                            <StatCard
                                icon={Calendar}
                                label="Timeline"
                                value={user.leadTime}
                            />
                        </div>

                        {activeTab === 'moodboard' && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[300px]">
                                    {/* Upload/Add New Card */}
                                    <button className="border-2 border-dashed border-[#1A1714]/10 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 text-urban-stone hover:text-urban-terracotta hover:border-urban-terracotta/50 transition-colors group">
                                        <div className="w-12 h-12 rounded-full bg-[#1A1714]/5 dark:bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Plus className="w-6 h-6" />
                                        </div>
                                        <span className="text-sm font-medium">Add External Image</span>
                                    </button>

                                    {/* Saved Items */}
                                    {savedItems.map((item) => (
                                        <div key={item.id} className="group relative rounded-2xl overflow-hidden bg-urban-stone/10">
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                                <div className="flex justify-between items-center text-white">
                                                    <div>
                                                        <p className="text-xs opacity-70">{item.category}</p>
                                                        <p className="font-medium text-sm">{item.title}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/70 hover:text-red-400"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'specifications' && (
                            <div className="bg-white dark:bg-[#2A2622]/50 rounded-2xl border border-[#1A1714]/5 dark:border-white/5 overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-[#1A1714]/5 dark:bg-white/5 text-urban-stone uppercase tracking-wider text-xs font-medium">
                                        <tr>
                                            <th className="px-6 py-4">Material Product</th>
                                            <th className="px-6 py-4">Category</th>
                                            <th className="px-6 py-4">Finish</th>
                                            <th className="px-6 py-4 text-right">Est. Unit Code</th>
                                            <th className="px-6 py-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#1A1714]/5 dark:divide-white/5">
                                        {savedItems.map((item) => (
                                            <tr key={item.id} className="hover:bg-[#1A1714]/5 dark:hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded bg-urban-stone/20 relative overflow-hidden">
                                                        <Image src={item.imageUrl} fill className="object-cover" alt="" />
                                                    </div>
                                                    <span className="font-medium">{item.title}</span>
                                                </td>
                                                <td className="px-6 py-4 text-urban-stone">{item.category}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-urban-terracotta/10 text-urban-terracotta">
                                                        {item.tags[0]}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono text-urban-stone">UC-2024-{item.id.substring(0, 4)}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-urban-stone hover:text-[#1A1714] dark:hover:text-white">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {savedItems.length === 0 && (
                                    <div className="p-12 text-center text-urban-stone">
                                        No specifications generated yet. Save items from the Discover feed.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </ReactLenis>
    );
}

function SidebarButton({ active, icon: Icon, label, badge, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${active
                ? 'bg-[#1A1714] text-white dark:bg-white dark:text-[#1A1714]'
                : 'text-urban-stone hover:bg-[#1A1714]/5 dark:hover:bg-white/5 hover:text-[#1A1714] dark:hover:text-white'
                }`}
        >
            <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
            </div>
            {badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-urban-terracotta text-white font-medium">
                    {badge}
                </span>
            )}
        </button>
    )
}

function StatCard({ icon: Icon, label, value }: any) {
    return (
        <div className="bg-white dark:bg-[#2A2622]/50 p-6 rounded-xl border border-[#1A1714]/5 dark:border-white/5 flex items-start gap-4">
            <div className="p-3 bg-urban-terracotta/10 text-urban-terracotta rounded-lg">
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-xs uppercase tracking-widest text-urban-stone mb-1">{label}</p>
                <p className="text-lg font-medium">{value}</p>
            </div>
        </div>
    )
}
