
"use client";

import { useUser } from "@/app/context/UserContext";
import { ReactLenis } from '@studio-freight/react-lenis';
import { motion, AnimatePresence } from "framer-motion";
import {
    Box,
    Truck,
    MapPin,
    CheckCircle2,
    Package,
    ArrowRight,
    Map,
    Building2,
    Calendar,
    ChevronRight,
    X,
    ClipboardCheck
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Steps in the Sample Request Flow
const STEPS = ['Review Selection', 'Shipping Details', 'Confirmation'];

export default function SampleRequestPage() {
    const { user, savedItems } = useUser();
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Shipping Form State
    const [shipping, setShipping] = useState({
        addressType: 'Office' as 'Office' | 'Site',
        street: '',
        city: user?.projectLocation?.split(',')[0] || '',
        state: user?.projectLocation?.split(',')[1]?.trim() || '',
        zip: '',
        contactName: user?.name || '',
        contactPhone: ''
    });

    const isPhoneValid = (() => {
        const digits = shipping.contactPhone.replace(/\D/g, '');
        return (digits.length === 10 && /^[6-9]/.test(digits)) ||
            (digits.length === 12 && digits.startsWith('91'));
    })();
    const isShippingValid = shipping.street && shipping.city && isPhoneValid;

    const handleConfirm = () => {
        setIsLoading(true);
        // Simulate API Call
        setTimeout(() => {
            setIsLoading(false);
            setStep(2);
        }, 2000);
    };

    if (!user) return null;

    return (
        <ReactLenis root>
            <main className="min-h-screen bg-[#FDFDFD] dark:bg-[#1A1714] text-[#1A1714] dark:text-[#E6E1DC]">

                {/* Minimal Header */}
                <header className="px-6 py-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between sticky top-0 bg-[#FDFDFD]/90 dark:bg-[#1A1714]/90 backdrop-blur-xl z-20">
                    <div className="flex items-center gap-4">
                        <Link href="/workspace" className="text-sm font-medium hover:text-urban-terracotta transition-colors flex items-center gap-1">
                            Close
                            <X className="w-4 h-4" />
                        </Link>
                        <div className="h-4 w-px bg-urban-stone/20" />
                        <h1 className="font-serif italic text-lg">Sample Studio</h1>
                    </div>
                </header>

                <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-16">

                    {/* Left Panel: Flow Content */}
                    <div className="flex-1">

                        {/* Progress Indicator */}
                        <div className="flex items-center gap-4 mb-12">
                            {STEPS.map((s, i) => (
                                <div key={s} className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${step >= i
                                        ? 'bg-urban-terracotta text-white'
                                        : 'bg-urban-stone/10 text-urban-stone'
                                        }`}>
                                        {step > i ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                                    </div>
                                    <span className={`text-sm ${step === i ? 'font-medium' : 'text-urban-stone'}`}>{s}</span>
                                    {i < STEPS.length - 1 && <div className="w-8 h-px bg-urban-stone/20 mx-2" />}
                                </div>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">

                            {/* Step 1: Review Selection */}
                            {step === 0 && (
                                <motion.div
                                    key="review"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div>
                                        <h2 className="text-3xl font-light font-display mb-2">Curate your Box</h2>
                                        <p className="text-urban-stone">Select the specific finishes you need to physically evaluate.</p>
                                    </div>

                                    <div className="space-y-4">
                                        {savedItems.length === 0 ? (
                                            <div className="p-8 border border-dashed border-urban-stone/20 rounded-2xl text-center">
                                                <p className="text-urban-stone mb-4">No items saved yet.</p>
                                                <Link href="/discover" className="text-urban-terracotta underline">Browse Feed</Link>
                                            </div>
                                        ) : (
                                            savedItems.map((item) => (
                                                <div key={item.id} className="flex items-center p-4 bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl gap-4 group hover:border-urban-terracotta/50 transition-colors cursor-pointer">
                                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-urban-stone/10">
                                                        <Image src={item.imageUrl} fill className="object-cover" alt={item.title} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-medium">{item.title}</h4>
                                                        <p className="text-xs text-urban-stone">{item.category} • {item.tags[0]}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-medium text-urban-terracotta px-2 py-1 bg-urban-terracotta/10 rounded">Sample Available</span>
                                                        <div className="w-6 h-6 rounded-full border border-urban-stone/30 flex items-center justify-center text-transparent group-hover:text-urban-stone/30">
                                                            <CheckCircle2 className="w-4 h-4 fill-urban-terracotta text-white" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* AI Upsell */}
                                    <div className="p-6 bg-gradient-to-r from-[#1A1714] to-[#2A2622] rounded-2xl text-white relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <Package className="w-32 h-32" />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-2 mb-2 text-urban-stone text-xs uppercase tracking-widest">
                                                <ClipboardCheck className="w-4 h-4 text-urban-terracotta" />
                                                Recommended Add-on
                                            </div>
                                            <h3 className="text-lg font-medium mb-1">Grout & Mortar Chip Set</h3>
                                            <p className="text-sm text-white/70 mb-4 max-w-sm">
                                                Based on your "Smoked Grey" selection, we recommend viewing our Dark Anthracite grout pairing.
                                            </p>
                                            <button className="text-xs font-medium border border-white/20 px-4 py-2 rounded-lg hover:bg-white hover:text-black transition-colors">
                                                Add to Box (+ Free)
                                            </button>
                                        </div>
                                    </div>

                                </motion.div>
                            )}

                            {/* Step 2: Shipping */}
                            {step === 1 && (
                                <motion.div
                                    key="shipping"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div>
                                        <h2 className="text-3xl font-light font-display mb-2">Where should we create?</h2> // Typo "crate" intended as "create" or "crate"? Assuming "crate" or "send". Let's use "deliver".
                                        {/* Let's stick to "Where should we send this?" */}
                                        <h2 className="text-3xl font-light font-display mb-2">Delivery Details</h2>
                                        <p className="text-urban-stone">We ship premium sample boxes via express courier.</p>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setShipping({ ...shipping, addressType: 'Office' })}
                                            className={`flex-1 py-3 border rounded-xl flex items-center justify-center gap-2 transition-all ${shipping.addressType === 'Office' ? 'border-urban-terracotta bg-urban-terracotta/5 text-urban-terracotta ring-1 ring-urban-terracotta' : 'border-urban-stone/20'}`}
                                        >
                                            <Building2 className="w-4 h-4" />
                                            Office
                                        </button>
                                        <button
                                            onClick={() => setShipping({ ...shipping, addressType: 'Site' })}
                                            className={`flex-1 py-3 border rounded-xl flex items-center justify-center gap-2 transition-all ${shipping.addressType === 'Site' ? 'border-urban-terracotta bg-urban-terracotta/5 text-urban-terracotta ring-1 ring-urban-terracotta' : 'border-urban-stone/20'}`}
                                        >
                                            <Map className="w-4 h-4" />
                                            Project Site
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2 space-y-2">
                                            <label className="text-xs uppercase tracking-widest text-urban-stone">Street Address</label>
                                            <input
                                                type="text"
                                                value={shipping.street}
                                                onChange={(e) => setShipping({ ...shipping, street: e.target.value })}
                                                className="w-full p-3 bg-transparent border border-black/10 dark:border-white/10 rounded-lg outline-none focus:border-urban-terracotta transition-colors"
                                                placeholder="123 Design Avenue, 4th Floor"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-widest text-urban-stone">City</label>
                                            <input
                                                type="text"
                                                value={shipping.city}
                                                onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                                                className="w-full p-3 bg-transparent border border-black/10 dark:border-white/10 rounded-lg outline-none focus:border-urban-terracotta transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-widest text-urban-stone">Phone</label>
                                            <input
                                                type="tel"
                                                value={shipping.contactPhone}
                                                onChange={(e) => setShipping({ ...shipping, contactPhone: e.target.value })}
                                                className="w-full p-3 bg-transparent border border-black/10 dark:border-white/10 rounded-lg outline-none focus:border-urban-terracotta transition-colors"
                                                placeholder="+91 98765 43210"
                                            />
                                        </div>
                                    </div>

                                </motion.div>
                            )}

                            {/* Step 3: Success */}
                            {step === 2 && (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-12"
                                >
                                    <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-6 text-green-600 dark:text-green-400">
                                        <Box className="w-10 h-10" />
                                    </div>
                                    <h2 className="text-4xl font-display font-light mb-3">Sample Request Confirmed</h2>
                                    <p className="text-urban-stone max-w-md mx-auto mb-8">
                                        Your curated box is being prepared. We've sent a confirmation email to <span className="text-[#1A1714] dark:text-white font-medium">{user.email}</span>.
                                    </p>

                                    <div className="max-w-md mx-auto bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl p-4 flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-3">
                                            <Truck className="w-5 h-5 text-urban-terracotta" />
                                            <div className="text-left">
                                                <p className="text-xs text-urban-stone uppercase tracking-widest">Estimated Delivery</p>
                                                <p className="font-medium">Tue, 12 Dec</p>
                                            </div>
                                        </div>
                                        <div className="text-sm font-medium text-urban-stone bg-black/5 dark:bg-white/10 px-3 py-1 rounded">TRK-8821</div>
                                    </div>

                                    <Link href="/workspace" className="inline-flex items-center gap-2 text-urban-terracotta hover:underline">
                                        Return to Workspace
                                    </Link>
                                </motion.div>
                            )}

                        </AnimatePresence>

                    </div>


                    {/* Right Panel: Box Summary (Sticky) */}
                    {step < 2 && (
                        <div className="w-full lg:w-96">
                            <div className="sticky top-32 p-6 bg-white dark:bg-[#2A2622]/50 border border-black/5 dark:border-white/5 rounded-2xl shadow-sm">
                                <h3 className="font-display text-xl mb-6 flex items-center justify-between">
                                    Summary
                                    <span className="text-sm bg-black/5 dark:bg-white/10 px-2 py-1 rounded font-sans text-urban-stone">{savedItems.length} items</span>
                                </h3>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-urban-stone">Sample Value</span>
                                        <span>₹2,400</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-urban-stone">Professional Discount</span>
                                        <span className="text-green-500">-₹2,400</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-urban-stone">Express Shipping</span>
                                        <span>₹0</span>
                                    </div>
                                    <div className="h-px bg-black/10 dark:bg-white/10 my-2" />
                                    <div className="flex justify-between font-medium text-lg">
                                        <span>Total</span>
                                        <span>₹0.00</span>
                                    </div>
                                </div>

                                <div className="p-3 bg-urban-terracotta/10 rounded-lg flex gap-3 items-start mb-6">
                                    <CheckCircle2 className="w-4 h-4 text-urban-terracotta mt-0.5" />
                                    <p className="text-xs text-urban-terracotta-soft leading-relaxed">
                                        Complimentary sample box for verified {user.role}s working on {user.projectType} projects.
                                    </p>
                                </div>

                                {step === 0 && (
                                    <button
                                        onClick={() => setStep(1)}
                                        disabled={savedItems.length === 0}
                                        className="w-full py-4 bg-[#1A1714] dark:bg-white text-white dark:text-[#1A1714] rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transition-transform"
                                    >
                                        Proceed to Shipping
                                    </button>
                                )}

                                {step === 1 && (
                                    <button
                                        onClick={handleConfirm}
                                        disabled={!isShippingValid || isLoading}
                                        className="w-full py-4 bg-urban-terracotta text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-urban-terracotta-soft transition-colors flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? 'Processing...' : 'Confirm Request'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </ReactLenis>
    );
}
