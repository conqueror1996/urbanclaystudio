"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, ChevronRight, Loader2, Sparkles, RefreshCcw } from "lucide-react";
import { generateArchitectureImage, uploadToSanity, getLatestGenerations, getInspirationImages } from "@/lib/sanity-utils";
import { cn } from "@/lib/utils";
import {
    OnboardingData,
    MATERIAL_OPTIONS,
    COLOR_OPTIONS,
    STYLE_OPTIONS,
    Role,
    ProjectStage,
    LeadTime,
    ProjectType
} from "@/lib/types";
import { useRouter } from "next/navigation";
import SwipeView from "./SwipeView";
import { useUser } from "@/app/context/UserContext";

const ROLES: Role[] = ['Architect', 'Builder', 'Contractor', 'Property Owner', 'Interior Designer'];
const STAGES: ProjectStage[] = ['Concept', 'Design Development', 'Budgeting', 'Execution'];
const LEAD_TIMES: LeadTime[] = ['Immediately', '1 Month', '3 Months', 'Just Exploring'];
const PROJECT_TYPES: ProjectType[] = ['Residential', 'Commercial', 'Industrial'];

const INITIAL_DATA: OnboardingData = {
    name: "",
    role: "",
    businessName: "",
    email: "",
    phoneNumber: "",
    portfolioProjectTypes: [],
    workingOnProject: true,
    projectLocation: "",
    projectStage: "",
    leadTime: "",
    interestedMaterials: [],
    colorPreference: "",
    architecturalStyle: "",
    projectType: ""
};

export default function OnboardingWizard() {
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(0);
    const [data, setData] = useState<OnboardingData>(INITIAL_DATA);
    const [isGenerating, setIsGenerating] = useState(false);
    const [swipeItems, setSwipeItems] = useState<any[]>([]);
    const [isLoadingSwipe, setIsLoadingSwipe] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // The swipe step is now step 3
        if (step === 3 && swipeItems.length === 0 && !isLoadingSwipe) {
            setIsLoadingSwipe(true);

            // Use the NEW Match Logic
            // In the new flow, interestedMaterials is not explicitly collected before swipe,
            // so it will likely be empty. ArchitecturalStyle is collected in step 2.
            const searchMaterials = data.interestedMaterials.length > 0 ? data.interestedMaterials : [];
            const searchStyle = data.architecturalStyle || 'Modern Minimal';

            getInspirationImages(searchMaterials, searchStyle)
                .then(realItems => {
                    const fallbackItems = [
                        { id: 'f1', title: 'Rough Exposed Brick', category: 'Exposed Brick', color: '#8B4513', tags: ['Rustic', 'Textured'] },
                        { id: 'f2', title: 'Smooth Terracotta Panel', category: 'Clay Facade', color: '#C25B37', tags: ['Modern', 'Smooth'] },
                        { id: 'f3', title: 'Dark Grey Tile', category: 'Clay Tile', color: '#4A4A4A', tags: ['Contemporary', 'Minimal'] },
                        { id: 'f4', title: 'Handmade Clay Paver', category: 'Brick Pavers', color: '#A0522D', tags: ['Heritage', 'Organic'] },
                        { id: 'f5', title: 'Perforated Jali Layout', category: 'Terracotta Jali', color: '#E3D7C8', tags: ['Patterned', 'Open'] },
                    ];

                    if (realItems && realItems.length > 0) {
                        const formattedItems = realItems.map((item: any) => ({
                            id: item._id,
                            title: item.title,
                            category: item.material || 'Architectural Element',
                            tags: [item.style, item.projectType].filter(Boolean), // Filter out nulls
                            imageUrl: item.imageUrl
                        }));
                        setSwipeItems(formattedItems);
                    } else {
                        console.log("⚠️ No specific matches found in Catalog. Using Fallback.");
                        setSwipeItems(fallbackItems);
                    }
                })
                .catch(err => {
                    console.error("Failed to retrieve inspiration", err);
                    setSwipeItems([
                        { id: 'e1', title: 'Rough Exposed Brick', category: 'Exposed Brick', color: '#8B4513', tags: ['Rustic', 'Textured'] },
                        { id: 'e2', title: 'Smooth Terracotta Panel', category: 'Clay Facade', color: '#C25B37', tags: ['Modern', 'Smooth'] },
                        { id: 'e3', title: 'Dark Grey Tile', category: 'Clay Tile', color: '#4A4A4A', tags: ['Contemporary', 'Minimal'] }
                    ]);
                })
                .finally(() => {
                    setIsLoadingSwipe(false);
                });
        }
    }, [step, swipeItems.length, data.interestedMaterials, data.architecturalStyle]);

    const updateData = (fields: Partial<OnboardingData>) => {
        setData(prev => ({ ...prev, ...fields }));
    };

    const nextStep = () => {
        setDirection(1);
        // New skip logic for 'workingOnProject'
        if (step === 1 && !data.workingOnProject) {
            setStep(3); // Skip to Swipe View (Step 3)
        } else {
            setStep(prev => prev + 1);
        }
    };
    const prevStep = () => {
        setDirection(-1);
        // New skip logic for 'workingOnProject'
        if (step === 3 && !data.workingOnProject) {
            setStep(1); // Back to Screen 2
        } else {
            setStep(prev => Math.max(0, prev - 1));
        }
    };

    const { setUser } = useUser();

    // ... rest 

    const handleSwipeComplete = async (tasteVector: any) => {
        const finalData = { ...data, tasteVector };
        updateData({ tasteVector });
        setUser(finalData); // Save to global context
        setIsGenerating(true);

        const seedMetadata: any = {
            projectType: finalData.projectType,
            climate: 'Contextual',
            lightingStyle: 'Golden Hour',
            compositionStyle: 'Cinematic Wide',
            textureLevel: 'High',
            embeddingHint: `${finalData.architecturalStyle}, ${finalData.interestedMaterials[0]}, ${finalData.projectType}, cinematic lighting`
        };

        try {
            // FIRE-AND-FORGET: Trigger generation but don't block the user
            // This runs in the background while the user is redirected to /discover
            generateArchitectureImage(seedMetadata).then(imageUrl => {
                uploadToSanity(imageUrl, seedMetadata).catch(console.error);
            }).catch(console.error);

            console.log("🚀 Triggered background curation");

        } catch (err) {
            console.error("Onboarding Trigger Failed:", err);
        }

        router.push('/discover');
    };

    // Determine if current step is valid to proceed
    const isStepValid = () => {
        switch (step) {
            case 0:
                // Screen 1: Name, Phone, Email, Profession
                const isNameValid = data.name.length >= 2;
                const isEmailValid = data.email.includes('@');
                const isRoleValid = !!data.role;
                const phoneDigits = data.phoneNumber.replace(/\D/g, '');
                const isPhoneValid = (phoneDigits.length === 10 && /^[6-9]/.test(phoneDigits)) ||
                    (phoneDigits.length === 12 && phoneDigits.startsWith('91'));

                return isNameValid && isEmailValid && isRoleValid && isPhoneValid;

            case 1:
                // Screen 2: Company Name, Portfolio Projects, Working On Project
                const isCompanyValid = data.businessName.length >= 2;
                const isPortfolioValid = data.portfolioProjectTypes.length > 0;
                return isCompanyValid && isPortfolioValid;

            case 2:
                // Screen 3: Project Specifics (Only if workingOnProject is Yes)
                if (!data.workingOnProject) return true;
                const isLocationValid = data.projectLocation.length >= 2;
                const isStyleValid = !!data.architecturalStyle;
                const isPTypeValid = !!data.projectType;

                return isLocationValid && isStyleValid && isPTypeValid;

            case 3: return false; // Handled by SwipeView callback
            default: return true;
        }
    };

    const renderStep = () => {
        switch (step) {
            case 0:
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-light text-white">Welcome to UrbanClay Studio.<br />Let’s get to know you.</h2>
                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <label className="text-sm uppercase tracking-widest text-white/50">Full Name</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => updateData({ name: e.target.value })}
                                    className="w-full bg-transparent border-b border-white/20 py-2 text-xl outline-none focus:border-urban-terracotta transition-colors placeholder:text-white/10 text-white"
                                    placeholder="Enter your name"
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm uppercase tracking-widest text-white/50">Profession</label>
                                <select
                                    value={data.role}
                                    onChange={(e) => updateData({ role: e.target.value as Role })}
                                    className="w-full bg-transparent border-b border-white/20 py-2 text-xl outline-none focus:border-urban-terracotta transition-colors text-white [&>option]:text-black"
                                >
                                    <option value="" disabled>Select your profession</option>
                                    {ROLES.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm uppercase tracking-widest text-white/50">Email Address</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => updateData({ email: e.target.value })}
                                    className="w-full bg-transparent border-b border-white/20 py-2 text-xl outline-none focus:border-urban-terracotta transition-colors placeholder:text-white/10 text-white"
                                    placeholder="name@company.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm uppercase tracking-widest text-white/50">Phone Number</label>
                                <input
                                    type="tel"
                                    value={data.phoneNumber}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9+\-\s]/g, '');
                                        updateData({ phoneNumber: val });
                                    }}
                                    className="w-full bg-transparent border-b border-white/20 py-2 text-xl outline-none focus:border-urban-terracotta transition-colors placeholder:text-white/10 text-white"
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div className="space-y-8">
                        <h2 className="text-3xl font-light text-white">Tell us about your work.</h2>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm uppercase tracking-widest text-white/50">Company Name</label>
                                <input
                                    type="text"
                                    value={data.businessName}
                                    onChange={(e) => updateData({ businessName: e.target.value })}
                                    className="w-full bg-transparent border-b border-white/20 py-2 text-xl outline-none focus:border-urban-terracotta transition-colors placeholder:text-white/10 text-white"
                                    placeholder="Studio / Company Name"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm uppercase tracking-widest text-white/50">What type of projects do you work on?</label>
                                <div className="flex flex-wrap gap-2">
                                    {PROJECT_TYPES.map(type => {
                                        const isSelected = data.portfolioProjectTypes.includes(type);
                                        return (
                                            <button
                                                key={type}
                                                onClick={() => {
                                                    const current = data.portfolioProjectTypes;
                                                    const updated = isSelected
                                                        ? current.filter(t => t !== type)
                                                        : [...current, type];
                                                    updateData({ portfolioProjectTypes: updated });
                                                }}
                                                className={cn(
                                                    "px-4 py-2 rounded-full border text-sm transition-all",
                                                    isSelected
                                                        ? "bg-urban-terracotta text-white border-urban-terracotta"
                                                        : "border-white/10 text-white/60 hover:border-white/30 hover:text-white"
                                                )}
                                            >
                                                {type}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <label className="text-sm uppercase tracking-widest text-white/50">Are you working on a project right now?</label>
                                <div className="flex gap-4">
                                    {[true, false].map((val) => (
                                        <button
                                            key={String(val)}
                                            onClick={() => updateData({ workingOnProject: val })}
                                            className={cn(
                                                "flex-1 py-3 border rounded-lg text-center transition-all",
                                                data.workingOnProject === val
                                                    ? "border-urban-terracotta bg-urban-terracotta/10 text-urban-terracotta ring-1 ring-urban-terracotta"
                                                    : "border-white/10 text-white/60 hover:border-white/30"
                                            )}
                                        >
                                            {val ? "Yes" : "No"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-8">
                        <div className="space-y-1">
                            <p className="text-xs uppercase tracking-widest text-urban-terracotta">Project Specifics</p>
                            <h2 className="text-3xl font-light text-white">Let's tailor the recommendations.</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm uppercase tracking-widest text-white/50">Project Type</label>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {PROJECT_TYPES.map(type => (
                                        <button
                                            key={type}
                                            onClick={() => updateData({ projectType: type })}
                                            className={cn(
                                                "px-6 py-3 rounded-lg border whitespace-nowrap transition-all",
                                                data.projectType === type
                                                    ? "border-urban-terracotta bg-urban-terracotta/10 text-urban-terracotta"
                                                    : "border-white/10 text-white/60 hover:border-white/30"
                                            )}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm uppercase tracking-widest text-white/50">Location</label>
                                <input
                                    type="text"
                                    value={data.projectLocation}
                                    onChange={(e) => updateData({ projectLocation: e.target.value })}
                                    className="w-full bg-transparent border-b border-white/20 py-2 text-xl outline-none focus:border-urban-terracotta transition-colors placeholder:text-white/10 text-white"
                                    placeholder="City, Country"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm uppercase tracking-widest text-white/50">Style Preference</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Modern', 'Rustic', 'Minimal', 'Vernacular'].map(style => (
                                        <button
                                            key={style}
                                            onClick={() => updateData({ architecturalStyle: style })}
                                            className={cn(
                                                "px-4 py-3 rounded-lg border text-sm text-left transition-all",
                                                data.architecturalStyle === style
                                                    ? "border-urban-terracotta bg-urban-terracotta/10 text-urban-terracotta"
                                                    : "border-white/10 text-white/60 hover:border-white/30"
                                            )}
                                        >
                                            {style}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6 text-center">
                        {isGenerating ? (
                            <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                <Loader2 className="w-12 h-12 animate-spin text-urban-terracotta" />
                                <p className="text-lg font-light animate-pulse text-white">
                                    Curating your customized material board...
                                </p>
                                <p className="text-xs text-white/40 uppercase tracking-widest">Analyzing taste vector</p>
                            </div>
                        ) : isLoadingSwipe ? (
                            <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                <Loader2 className="w-12 h-12 animate-spin text-white/20" />
                                <p className="text-lg font-light animate-pulse text-white">
                                    Finding inspiration for you...
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-1 mb-8">
                                    <p className="text-xs uppercase tracking-widest text-urban-terracotta">Final Step</p>
                                    <h2 className="text-3xl font-light text-white">Taste Refinement</h2>
                                    <p className="text-white/50 font-light px-8">Swipe Right if it matches your vision</p>
                                </div>
                                <SwipeView onComplete={handleSwipeComplete} items={swipeItems} />
                            </>
                        )}
                    </div >
                );
            case 4:
                return (
                    <div className="space-y-8">
                        <div className="text-center space-y-2">
                            <Sparkles className="w-8 h-8 text-urban-terracotta mx-auto mb-4" />
                            <h2 className="text-3xl font-light text-white">Your Curated Collection</h2>
                        </div>
                        <div className="pt-4 text-center">
                            <p>Redirecting to Discover...</p>
                        </div>
                    </div>
                )
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen flex flex-col max-w-2xl mx-auto px-6 py-12 justify-center">
            <div className="flex-1 flex flex-col justify-center">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={step}
                        custom={direction}
                        initial={{ x: direction > 0 ? 40 : -40, opacity: 0, filter: "blur(10px)" }}
                        animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
                        exit={{ x: direction > 0 ? -40 : 40, opacity: 0, filter: "blur(10px)" }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full"
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="pt-8 flex justify-between items-center bg-transparent relative z-10">
                {step > 0 && step < 4 && !isGenerating && ( // Adjusted step condition for 'Back' button
                    <button
                        onClick={prevStep}
                        className="text-white/40 hover:text-white text-sm uppercase tracking-widest transition-colors"
                    >
                        Back
                    </button>
                )}

                <div className="ml-auto">
                    {/* Step 3 (Swipe) handles its own Next logic or hides button */}
                    {isStepValid() && step !== 3 && step !== 4 && ( // Adjusted step condition for 'Next' button
                        <button
                            onClick={nextStep}
                            className="group flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full transition-all hover:bg-urban-terracotta hover:text-white hover:scale-105 active:scale-95 shadow-lg"
                        >
                            <span>Next</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    )}

                    {!isStepValid() && step !== 3 && step !== 4 && ( // Adjusted step condition for disabled 'Next' button
                        <button
                            disabled
                            className="flex items-center gap-2 bg-white/10 text-white/20 px-6 py-3 rounded-full cursor-not-allowed border border-white/5"
                        >
                            <span>Next</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Progress Indicator */}
            {step < 4 && ( // Adjusted total steps for progress indicator
                <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                    <motion.div
                        className="h-full bg-urban-terracotta shadow-[0_0_10px_rgba(166,93,61,0.5)]"
                        initial={{ width: "0%" }}
                        animate={{ width: `${((step + 1) / 4) * 100}%` }}
                    />
                </div>
            )}
        </div>
    );
}
