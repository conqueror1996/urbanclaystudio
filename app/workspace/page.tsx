
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
            <main className="min-h-screen bg-background text-foreground flex flex-col md:flex-row selection:bg-urban-terracotta selection:text-white">

                {/* Sidebar Navigation - Hidden on mobile/desktop for Simplicity Mode, using MagicNav instead */}
                <aside className="hidden lg:flex w-64 bg-black/40 backdrop-blur-xl border-r border-white/5 h-screen sticky top-0 flex-col justify-between z-20">
                    <div className="p-6">
                        <Link href="/discover" className="block mb-10">
                            <h1 className="font-display italic text-2xl font-medium tracking-tight text-white">UrbanClay</h1>
                        </Link>

                        <div className="space-y-1 mb-8">
                            <p className="text-xs uppercase tracking-widest text-white/40 mb-2 px-3">Project</p>
                            <div className="p-3 bg-white/5 rounded-lg border border-white/10 hover:border-urban-terracotta/50 transition-colors">
                                <h2 className="font-medium text-sm text-gray-200">{user.projectLocation} Residence</h2>
                                <p className="text-xs text-white/40 mt-1">{user.projectStage}</p>
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

                    <div className="p-6 border-t border-white/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-linear-to-tr from-urban-terracotta to-purple-500 flex items-center justify-center text-white text-xs font-serif italic shadow-lg">
                                {user.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate text-gray-200">{user.name}</p>
                                <p className="text-xs text-white/40 truncate">{user.email || 'Architect'}</p>
                            </div>
                        </div>
                        {highTicketScore > 50 && (
                            <button className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-xs uppercase tracking-widest rounded-lg border border-white/10 transition-colors">
                                Concierge
                            </button>
                        )}
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 min-w-0 relative">
                    {/* Header */}
                    <header className="px-8 py-6 flex items-center justify-between border-b border-white/5 sticky top-0 bg-background/80 backdrop-blur-xl z-10 transition-colors">
                        <div>
                            <h1 className="text-2xl font-light font-display tracking-wide text-gray-100">
                                {activeTab === 'moodboard' ? 'Project Moodboard' : 'Material Specifications'}
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-full text-sm hover:bg-white/5 transition-colors text-gray-300"
                            >
                                <Share2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Share</span>
                            </button>
                            <Link href="/sample-request" className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full text-sm hover:bg-gray-200 transition-colors font-medium">
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
                    <div ref={moodboardRef} className="p-8 max-w-[1600px] mx-auto min-h-screen bg-background">

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
                                    <button className="border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 text-white/30 hover:text-urban-terracotta hover:border-urban-terracotta/50 transition-colors group bg-white/5 hover:bg-white/[0.07]">
                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform text-white/50 group-hover:text-urban-terracotta">
                                            <Plus className="w-6 h-6" />
                                        </div>
                                        <span className="text-sm font-medium">Add External Image</span>
                                    </button>

                                    <Link href="/moodboard" className="border-2 border-solid border-urban-terracotta/20 rounded-2xl flex flex-col items-center justify-center gap-4 text-urban-terracotta hover:bg-urban-terracotta hover:text-white transition-all group bg-urban-terracotta/5">
                                        <div className="w-12 h-12 rounded-full bg-urban-terracotta/10 flex items-center justify-center group-hover:bg-white/20 transition-transform">
                                            <LayoutGrid className="w-6 h-6" />
                                        </div>
                                        <span className="text-sm font-medium">Launch Canvas</span>
                                    </Link>

                                    {/* Saved Items */}
                                    {savedItems.map((item) => (
                                        <div key={item.id} className="group relative rounded-2xl overflow-hidden bg-white/5 ring-1 ring-white/5 shadow-2xl">
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                                            />
                                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5">
                                                <div className="flex justify-between items-center text-white">
                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">{item.category}</p>
                                                        <p className="font-display font-medium text-lg leading-tight">{item.title}</p>
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
                            <div className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden backdrop-blur-sm">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-white/5 text-urban-stone uppercase tracking-wider text-xs font-medium">
                                        <tr>
                                            <th className="px-6 py-4 font-normal text-white/40">Material Product</th>
                                            <th className="px-6 py-4 font-normal text-white/40">Category</th>
                                            <th className="px-6 py-4 font-normal text-white/40">Finish</th>
                                            <th className="px-6 py-4 text-right font-normal text-white/40">Est. Unit Code</th>
                                            <th className="px-6 py-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {savedItems.map((item) => (
                                            <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4 flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-white/10 relative overflow-hidden ring-1 ring-white/10 group-hover:ring-urban-terracotta/50 transition-all">
                                                        <Image src={item.imageUrl} fill className="object-cover" alt="" />
                                                    </div>
                                                    <span className="font-medium text-gray-200">{item.title}</span>
                                                </td>
                                                <td className="px-6 py-4 text-urban-stone">{item.category}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-urban-terracotta/10 text-urban-terracotta border border-urban-terracotta/20">
                                                        {item.tags[0]}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono text-urban-stone text-xs">UC-2024-{item.id.substring(0, 4)}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-urban-stone hover:text-white transition-colors">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {savedItems.length === 0 && (
                                    <div className="p-16 text-center text-urban-stone font-light text-sm">
                                        No specifications generated yet. <br /> Save items from the Discover feed to populate this list.
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
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all group ${active
                ? 'bg-white text-black shadow-lg shadow-white/5'
                : 'text-urban-stone hover:bg-white/5 hover:text-white'
                }`}
        >
            <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${active ? 'text-black' : 'group-hover:text-white text-urban-stone'}`} />
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
        <div className="bg-white/5 p-6 rounded-xl border border-white/5 flex items-start gap-4 hover:bg-white/[0.07] transition-colors group">
            <div className="p-3 bg-white/5 text-urban-terracotta rounded-lg group-hover:bg-urban-terracotta group-hover:text-white transition-colors">
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">{label}</p>
                <p className="text-lg font-medium text-gray-200">{value}</p>
            </div>
        </div>
    )
}
