
"use client";

import { Home, Heart, Package, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function MagicNav() {
    const pathname = usePathname();
    
    // Don't show on Onboarding
    if (pathname.includes('/onboarding') || pathname === '/') return null;

    const navItems = [
        { icon: Home, label: 'Explore', path: '/discover' },
        { icon: Heart, label: 'Collection', path: '/workspace' },
        { icon: Package, label: 'My Box', path: '/sample-request' },
    ];

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center gap-2 p-2 bg-[#1A1714] dark:bg-white rounded-full shadow-2xl border border-white/10"
            >
                {navItems.map((item) => {
                    const isActive = pathname === item.path;
                    const Icon = item.icon;
                    return (
                        <Link 
                            key={item.path} 
                            href={item.path}
                            className={`relative px-6 py-3 rounded-full flex items-center gap-2 transition-all duration-300 ${
                                isActive 
                                    ? 'bg-white text-black dark:bg-[#1A1714] dark:text-white' 
                                    : 'text-white/60 dark:text-black/60 hover:text-white dark:hover:text-black hover:bg-white/10 dark:hover:bg-black/10'
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
        </div>
    );
}
