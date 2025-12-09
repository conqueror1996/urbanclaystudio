"use client";

import { useUser } from "@/app/context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    TrendingUp,
    DollarSign,
    Target,
    MapPin,
    Calendar,
    ArrowUpRight,
    Search,
    Filter,
    MoreHorizontal,
    Phone,
    Mail,
    PieChart,
    Activity,
    Layers
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

// Mock Data representing the "Backend View" of multiple users
const MOCK_LEADS = [
    {
        id: "lead-001",
        name: "Ar. Vikram Mehta",
        firm: "Studio VM",
        role: "Architect",
        location: "Mumbai, MH",
        status: "Hot",
        score: 92,
        projectValue: "₹45L - ₹60L",
        projectType: "Commercial Facade",
        lastActive: "2 mins ago",
        savedMaterials: 14,
        preferredStyle: "Modern Minimal",
        avatar: "V"
    },
    {
        id: "lead-002",
        name: "Sarah Jenkins",
        firm: "Jenkins Developers",
        role: "Builder",
        location: "Bangalore, KA",
        status: "Warm",
        score: 78,
        projectValue: "₹1.2Cr",
        projectType: "Residential Complex",
        lastActive: "4 hours ago",
        savedMaterials: 8,
        preferredStyle: "Industrial",
        avatar: "S"
    },
    {
        id: "lead-003",
        name: "Rajesh Kumar",
        firm: "Freelance",
        role: "Contractor",
        location: "Delhi, NCR",
        status: "Cold",
        score: 45,
        projectValue: "₹20L",
        projectType: "Renovation",
        lastActive: "2 days ago",
        savedMaterials: 2,
        preferredStyle: "Rustic",
        avatar: "R"
    },
    {
        id: "lead-004",
        name: "Elena Rossi",
        firm: "Design Collective",
        role: "Interior Designer",
        location: "Goa",
        status: "New",
        score: 65,
        projectValue: "₹15L - ₹25L",
        projectType: "Hospitality",
        lastActive: "1 day ago",
        savedMaterials: 5,
        preferredStyle: "Heritage",
        avatar: "E"
    }
];

// ... imports
import { CMSUploader } from "./CMSUploader";
import { InventoryExplorer } from "./InventoryExplorer";

export default function SalesDashboard() {
    const { user, highTicketScore, activityLog } = useUser();
    const [activeTab, setActiveTab] = useState<'leads' | 'inventory'>('leads');
    const [inventoryMode, setInventoryMode] = useState<'browse' | 'upload'>('browse');

    // Merge current live user into the mock list for the demo
    const liveUserLead = user ? {
        id: "live-user",
        name: user.name,
        firm: user.businessName || "Independent",
        role: user.role,
        location: user.projectLocation || "Remote",
        status: !user.workingOnProject ? "Prospect" : (highTicketScore > 70 ? "Hot" : "Warm"),
        score: highTicketScore || 50,
        projectValue: user.workingOnProject ? "₹35L - ₹50L" : "N/A",
        projectType: user.projectType || (user.portfolioProjectTypes?.[0] ? `Portfolio: ${user.portfolioProjectTypes[0]}` : "General"),
        lastActive: "Now",
        savedMaterials: 12,
        preferredStyle: user.architecturalStyle || "Modern",
        avatar: user.name.charAt(0)
    } : null;

    const leads = liveUserLead ? [liveUserLead, ...MOCK_LEADS] : MOCK_LEADS;

    return (
        <main className="min-h-screen bg-[#FDFDFD] dark:bg-[#0F0F0F] text-[#1A1714] dark:text-[#E6E1DC] font-sans">

            {/* Header / Nav */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0F0F0F]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 h-16 flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    {/* Logo ... */}
                    <div className="w-8 h-8 rounded-lg bg-urban-terracotta flex items-center justify-center text-white font-serif italic text-lg shadow-lg">U</div>
                    <h1 className="font-medium text-sm tracking-wide">UrbanClay <span className="text-urban-stone font-normal">Intelligence</span></h1>
                </div>

                <div className="flex items-center gap-6">
                    <nav className="hidden md:flex items-center gap-6 text-xs uppercase tracking-widest font-medium text-urban-stone">
                        <button
                            onClick={() => setActiveTab('leads')}
                            className={`transition-colors ${activeTab === 'leads' ? 'text-urban-terracotta' : 'hover:text-white'}`}
                        >
                            Leads
                        </button>
                        <span className="opacity-20">|</span>
                        <button
                            onClick={() => setActiveTab('inventory')}
                            className={`transition-colors ${activeTab === 'inventory' ? 'text-urban-terracotta' : 'hover:text-white'}`}
                        >
                            Inventory & Uploads
                        </button>
                    </nav>
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10" />
                </div>
            </header>

            <div className="pt-24 px-6 md:px-12 max-w-[1600px] mx-auto pb-20">

                {activeTab === 'leads' ? (
                    <>
                        {/* KPI Cards (Existing) */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                            {/* ... Keep existing KPI cards ... */}
                            <KPICard title="Total Pipeline" value="₹4.2 Cr" change="+12%" icon={DollarSign} trend="up" />
                            <KPICard title="Active Leads" value="124" change="+8" icon={Users} trend="up" />
                            <KPICard title="Conversion Rate" value="18.2%" change="-1.5%" icon={Target} trend="down" />
                            <KPICard title="Trending Region" value="Mumbai" change="Hot" icon={MapPin} />
                        </div>

                        {/* Main Content Area (Leads Table & Insights) */}
                        {/* Leads Table (Left 2/3) */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-light">Lead Intelligence</h2>
                                <div className="flex gap-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-urban-stone" />
                                        <input
                                            type="text"
                                            placeholder="Search architects..."
                                            className="pl-9 pr-4 py-2 bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-lg text-sm outline-none focus:border-urban-terracotta transition-colors w-64"
                                        />
                                    </div>
                                    <button className="p-2 border border-black/5 dark:border-white/5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                        <Filter className="w-4 h-4 text-urban-stone" />
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-[#1A1714] rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden shadow-sm">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-urban-stone/5 border-b border-black/5 dark:border-white/5 text-urban-stone uppercase tracking-wider text-xs font-medium">
                                        <tr>
                                            <th className="px-6 py-4">Architect / Firm</th>
                                            <th className="px-6 py-4">Score</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Est. Value</th>
                                            <th className="px-6 py-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-black/5 dark:divide-white/5">
                                        {leads.map((lead: any) => (
                                            <tr key={lead.id} className="hover:bg-urban-stone/5 transition-colors group cursor-pointer">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-urban-terracotta/10 text-urban-terracotta flex items-center justify-center font-medium">
                                                            {lead.avatar}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-[#1A1714] dark:text-white">{lead.name}</p>
                                                            <p className="text-xs text-urban-stone">{lead.firm} • {lead.location}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-1.5 bg-urban-stone/20 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${lead.score > 80 ? 'bg-green-500' : lead.score > 60 ? 'bg-yellow-500' : 'bg-red-400'}`}
                                                                style={{ width: `${lead.score}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-medium">{lead.score}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${lead.status === 'Hot' ? 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                                                        lead.status === 'Warm' ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400' :
                                                            'bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400'
                                                        }`}>
                                                        {lead.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-urban-stone">
                                                    {lead.projectValue}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-urban-stone hover:text-urban-terracotta opacity-0 group-hover:opacity-100 transition-all">
                                                        <ArrowUpRight className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* AI Insights Panel (Right 1/3) */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-light">Real-Time Activity</h2>

                            {/* Insight Card 1 (Keep) */}
                            <div className="p-6 bg-gradient-to-br from-[#1A1714] to-[#2A2622] rounded-2xl text-white shadow-xl relative overflow-hidden">
                                {/* ... keeping existing content ... */}
                                <div className="absolute top-0 right-0 p-6 opacity-10">
                                    <PieChart className="w-24 h-24" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-4 text-urban-stone text-xs uppercase tracking-widest">
                                        <TrendingUp className="w-4 h-4 text-green-400" />
                                        High Demand Signal
                                    </div>
                                    <h3 className="text-2xl font-light mb-2">Facade Panels</h3>
                                    <p className="text-white/70 text-sm mb-6 leading-relaxed">
                                        Spike in interest for <span className="text-white font-medium">Smoked Grey Grooved</span> panels.
                                    </p>
                                </div>
                            </div>

                            {/* NEW: LIVE ACTIVITY FEED */}
                            <div className="bg-white dark:bg-[#1A1714] rounded-2xl border border-black/5 dark:border-white/5 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-urban-stone/5">
                                    <h3 className="text-sm font-medium flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-urban-terracotta" />
                                        Live Lead Actions
                                    </h3>
                                    <span className="text-[10px] uppercase tracking-wider text-green-600 font-medium px-2 py-1 bg-green-100 rounded-full animate-pulse">
                                        Live
                                    </span>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto p-2 space-y-1">
                                    {activityLog.length === 0 ? (
                                        <div className="p-8 text-center text-urban-stone text-sm">
                                            No recent activity detected.
                                        </div>
                                    ) : (
                                        activityLog.map((log) => (
                                            <div key={log.id} className="group flex items-start gap-3 p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                                                    {user?.name?.charAt(0) || 'U'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <p className="text-xs font-medium text-foreground truncate">
                                                            {user?.name || 'Unknown User'}
                                                        </p>
                                                        <span className="text-[10px] text-urban-stone whitespace-nowrap">
                                                            {Math.floor((Date.now() - log.timestamp) / 1000 / 60)}m ago
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-foreground/80 leading-snug mt-0.5">
                                                        {log.detail}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${log.action === 'Save' ? 'bg-urban-terracotta/10 border-urban-terracotta/20 text-urban-terracotta' :
                                                            log.action === 'View' ? 'bg-blue-500/10 border-blue-500/20 text-blue-600' :
                                                                'bg-gray-100 border-gray-200 text-gray-600'
                                                            }`}>
                                                            {log.action}
                                                        </span>
                                                        {log.action === 'Save' && <span className="text-[10px] text-green-600 font-medium">+5 Intent Score</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="space-y-8">
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-3xl font-light text-[#1A1714] dark:text-white mb-2">Digital Asset Inventory</h2>
                                <p className="text-urban-stone">Manage and retrieve project photos using AI semantic search.</p>
                            </div>
                            <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl">
                                <button
                                    onClick={() => setInventoryMode('browse')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${inventoryMode === 'browse' ? 'bg-white dark:bg-[#1A1714] shadow-sm text-urban-terracotta' : 'text-urban-stone hover:text-urban-terracotta'}`}
                                >
                                    Browse & Search
                                </button>
                                <button
                                    onClick={() => setInventoryMode('upload')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${inventoryMode === 'upload' ? 'bg-white dark:bg-[#1A1714] shadow-sm text-urban-terracotta' : 'text-urban-stone hover:text-urban-terracotta'}`}
                                >
                                    Upload New
                                </button>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {inventoryMode === 'browse' ? (
                                <motion.div
                                    key="browse"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <InventoryExplorer />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="upload"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <CMSUploader />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

            </div>
        </main>
    );
}

// Extracted Subcomponents to keep file clean (Simulated extraction for this replace block)
// I will keep the original implementation but wrapped in the condition in the real file update.


function KPICard({ title, value, change, icon: Icon, trend }: any) {
    return (
        <div className="p-6 bg-white dark:bg-[#1A1714] rounded-2xl border border-black/5 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-urban-stone/10 rounded-lg text-urban-stone">
                    <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400' :
                    trend === 'down' ? 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                        'bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400'
                    }`}>
                    {change}
                </span>
            </div>
            <h3 className="text-sm text-urban-stone font-medium uppercase tracking-wide mb-1 opacity-70">{title}</h3>
            <p className="text-2xl font-semibold">{value}</p>
        </div>
    )
}
