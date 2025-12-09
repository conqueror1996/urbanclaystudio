
"use client";

import { Home, Heart, Package, User, Sparkles, Command as CommandIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import CommandPalette from "./CommandPalette";

export default function MagicNav() {
    const pathname = usePathname();
    const [isCommandOpen, setIsCommandOpen] = useState(false);

    // Global Shortcut Listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsCommandOpen(prev => !prev);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Don't show on Onboarding
    if (pathname.includes('/onboarding') || pathname === '/') return null;

    const navItems = [
        { icon: Home, label: 'Explore', path: '/discover' },
        { icon: Heart, label: 'Collection', path: '/workspace' },
        // Central Command Button triggers Modal, not a link
        { icon: Sparkles, label: 'Ask AI', isAction: true, action: () => setIsCommandOpen(true) },
        { icon: Package, label: 'Samples', path: '/sample-request' },
    ];

    return (
        <>
            <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />

            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex items-center gap-2 p-2 bg-black/80 backdrop-blur-xl rounded-full shadow-2xl border border-white/10 ring-1 ring-white/5"
                >
                    {navItems.map((item, i) => {
                        const isActive = item.path ? pathname === item.path : false;
                        const Icon = item.icon;

                        if (item.isAction) {
                            return (
                                <button
                                    key={i}
                                    onClick={item.action}
                                    className="relative px-4 py-3 rounded-full flex items-center gap-2 transition-all duration-300 text-urban-terracotta hover:bg-urban-terracotta hover:text-white"
                                >
                                    <Icon className="w-5 h-5 fill-current" />
                                    {/* Tooltip hint for keyboard shortcut */}
                                    <span className="hidden md:flex absolute -top-12 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[10px] rounded border border-white/20 opacity-0 group-hover:opacity-100 whitespace-nowrap">
                                        Cmd + K
                                    </span>
                                </button>
                            )
                        }

                        return (
                            <Link
                                key={item.path}
                                href={item.path!} // we know path exists if not action
                                className={`relative px-6 py-3 rounded-full flex items-center gap-2 transition-all duration-300 ${isActive
                                    ? 'bg-white text-black shadow-lg shadow-white/5'
                                    : 'text-white/60 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'fill-current' : ''}`} />
                                {isActive && (
                                    <motion.span
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: 'auto', opacity: 1 }}
                                        className="text-sm font-medium whitespace-nowrap overflow-hidden"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </Link>
                        )
                    })}
                </motion.div>

                {/* Mobile Hint */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-white/20 whitespace-nowrap hidden md:block">
                    Press ⌘K to search
                </div>
            </div>
        </>
    );
}
