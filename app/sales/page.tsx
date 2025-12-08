"use client";

import { useUser } from "@/app/context/UserContext";
import { ReactLenis } from '@studio-freight/react-lenis';
import { motion } from "framer-motion";
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

export default function SalesDashboard() {
    const { user, highTicketScore } = useUser(); // In reality, this would be admin auth
    const [filter, setFilter] = useState('All');

    // Merge current live user into the mock list for the demo
    const liveUserLead = user ? {
        id: "live-user",
        name: user.name,
        firm: user.businessName || "Independent",
        role: user.role,
        location: user.projectLocation,
        status: highTicketScore > 70 ? "Hot" : "Warm",
        score: highTicketScore || 85, // Use calculated score
        projectValue: "₹35L - ₹50L", // Estimated
        projectType: user.projectType,
        lastActive: "Now",
        savedMaterials: 12, // Mock count
        preferredStyle: user.architecturalStyle,
        avatar: user.name.charAt(0)
    } : null;

    const leads = liveUserLead ? [liveUserLead, ...MOCK_LEADS] : MOCK_LEADS;

    return (
        <ReactLenis root>
            <main className="min-h-screen bg-[#FDFDFD] dark:bg-[#0F0F0F] text-[#1A1714] dark:text-[#E6E1DC] font-sans">

                {/* Header / Nav */}
                <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0F0F0F]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 h-16 flex items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-urban-terracotta flex items-center justify-center text-white font-serif italic text-lg shadow-lg">
                            U
                        </div>
                        <h1 className="font-medium text-sm tracking-wide">UrbanClay <span className="text-urban-stone font-normal">Intelligence</span></h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <nav className="hidden md:flex items-center gap-6 text-xs uppercase tracking-widest font-medium text-urban-stone">
                            <span className="text-urban-terracotta">Leads</span>
                            <span className="hover:text-[#1A1714] dark:hover:text-white cursor-pointer transition-colors">Analytics</span>
                            <span className="hover:text-[#1A1714] dark:hover:text-white cursor-pointer transition-colors">Inventory</span>
                        </nav>
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10" />
                    </div>
                </header>

                <div className="pt-24 px-6 md:px-12 max-w-[1600px] mx-auto pb-20">

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                        <KPICard
                            title="Total Pipeline"
                            value="₹4.2 Cr"
                            change="+12%"
                            icon={DollarSign}
                            trend="up"
                        />
                        <KPICard
                            title="Active Leads"
                            value="124"
                            change="+8"
                            icon={Users}
                            trend="up"
                        />
                        <KPICard
                            title="Conversion Rate"
                            value="18.2%"
                            change="-1.5%"
                            icon={Target}
                            trend="down"
                        />
                        <KPICard
                            title="Trending Region"
                            value="Mumbai"
                            change="Hot"
                            icon={MapPin}
                        />
                    </div>

                    {/* Main Content Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

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
                                        {leads.map((lead) => (
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
                            <h2 className="text-xl font-light">AI Market Insights</h2>

                            {/* Insight Card 1 */}
                            <div className="p-6 bg-gradient-to-br from-[#1A1714] to-[#2A2622] rounded-2xl text-white shadow-xl relative overflow-hidden">
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
                                        Sudden spike in interest for <span className="text-white font-medium">Smoked Grey Grooved</span> panels in Mumbai Commercial sector.
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="w-8 h-8 rounded-full bg-white/10 border-2 border-[#1A1714] backdrop-blur-sm" />
                                            ))}
                                        </div>
                                        <span className="text-xs text-white/50">+12 Architects inquiring</span>
                                    </div>
                                </div>
                            </div>

                            {/* Insight Card 2 - Actionable */}
                            <div className="p-6 bg-white dark:bg-[#1A1714] rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
                                <div className="flex items-center gap-2 mb-4 text-urban-terracotta text-xs uppercase tracking-widest font-medium">
                                    <Activity className="w-4 h-4" />
                                    Conversion Opportunity
                                </div>
                                <h3 className="text-lg font-medium mb-2">Ar. Vikram Mehta</h3>
                                <p className="text-sm text-urban-stone mb-4">
                                    Just saved "Linear Terracotta" and viewed pricing 3 times. High intent detected.
                                </p>
                                <div className="flex gap-2">
                                    <button className="flex-1 py-2 bg-urban-terracotta text-white rounded-lg text-sm hover:bg-urban-terracotta-soft transition-colors flex items-center justify-center gap-2">
                                        <Phone className="w-3 h-3" /> Call
                                    </button>
                                    <button className="flex-1 py-2 border border-black/10 dark:border-white/10 rounded-lg text-sm hover:bg-black/5 transition-colors flex items-center justify-center gap-2">
                                        <Mail className="w-3 h-3" /> Email
                                    </button>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </main>
        </ReactLenis>
    );
}

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
