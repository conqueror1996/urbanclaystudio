"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, ChevronRight, Loader2, Sparkles, RefreshCcw } from "lucide-react";
import { generateArchitectureImage, uploadToSanity, getLatestGenerations } from "@/lib/sanity-utils";
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
    projectLocation: "",
    projectStage: "",
    leadTime: "",
    phoneNumber: "",
    interestedMaterials: [],
    colorPreference: "",
    architecturalStyle: "",
    projectType: ""
};

export default function OnboardingWizard() {
    const [step, setStep] = useState(0);
    const [data, setData] = useState<OnboardingData>(INITIAL_DATA);
    const [isGenerating, setIsGenerating] = useState(false);
    const [swipeItems, setSwipeItems] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        if (step === 5 && swipeItems.length === 0) {
            getLatestGenerations(5).then(realItems => {
                if (realItems && realItems.length > 0) {
                    const formattedItems = realItems.map((item: any) => ({
                        id: item._id,
                        title: item.title,
                        category: item.material || 'Architectural Element',
                        tags: [item.style, item.projectType],
                        imageUrl: item.imageUrl
                    }));
                    setSwipeItems(formattedItems);
                }
            }).catch(console.error);
        }
    }, [step, swipeItems.length]);

    const updateData = (fields: Partial<OnboardingData>) => {
        setData(prev => ({ ...prev, ...fields }));
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => Math.max(0, prev - 1));

    const { setUser } = useUser();

    // ... rest 

    const handleSwipeComplete = async (tasteVector: any) => {
        const finalData = { ...data, tasteVector };
        updateData({ tasteVector });
        setUser(finalData); // Save to global context
        setIsGenerating(true);

        try {
            // Trigger 1-Click Generation customized to this user
            const seedMetadata: any = {
                title: `${finalData.projectType} for ${finalData.projectLocation}`,
                description: `A custom generated ${finalData.architecturalStyle} project featuring ${finalData.interestedMaterials[0]}`,
                style: finalData.architecturalStyle,
                material: finalData.interestedMaterials[0] || 'Clay',
                colorProfile: finalData.colorPreference,
                projectType: finalData.projectType,
                climate: 'Contextual',
                lightingStyle: 'Golden Hour',
                compositionStyle: 'Cinematic Wide',
                textureLevel: 'High',
                embeddingHint: `${finalData.architecturalStyle}, ${finalData.interestedMaterials[0]}, ${finalData.projectType}, cinematic lighting`
            };

            console.log("🚀 Triggering Onboarding Generation...", seedMetadata);

            // Call the Server Action
            const imageUrl = await generateArchitectureImage(seedMetadata);
            await uploadToSanity(imageUrl, seedMetadata);

            console.log("✅ Onboarding Generation Complete");

        } catch (err) {
            console.error("Onboarding Generation Failed:", err);
            // Non-blocking error, user can still proceed to feed
        }

        router.push('/discover');
    };

    // Determine if current step is valid to proceed
    const isStepValid = () => {
        switch (step) {
            case 0:
                // Name and Phone validation
                const isNameValid = data.name.length >= 2;
                const phoneDigits = data.phoneNumber.replace(/\D/g, '');
                // Allow 10 digits (6-9 start) or 12 digits (91 start)
                const isPhoneValid = (phoneDigits.length === 10 && /^[6-9]/.test(phoneDigits)) ||
                    (phoneDigits.length === 12 && phoneDigits.startsWith('91'));
                return isNameValid && isPhoneValid;
            case 1: return !!data.role; // Role
            case 2:
                // Location validation (min 2 chars)
                const isLocationValid = data.projectLocation.length >= 2;
                return isLocationValid && !!data.projectStage && !!data.leadTime;
            case 3: return data.interestedMaterials.length > 0; // Materials
            case 4: return !!data.colorPreference && !!data.architecturalStyle && !!data.projectType; // Style
            case 5: return false; // Handled by SwipeView callback
            default: return true;
        }
    };

    const renderStep = () => {
        switch (step) {
            case 0:
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-light">Welcome to UrbanClay Studio.<br />Let’s personalize your experience.</h2>
                        <div className="space-y-4 pt-8">
                            <div className="space-y-2">
                                <label className="text-sm uppercase tracking-widest text-urban-stone">What should we call you?</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => updateData({ name: e.target.value })}
                                    className="w-full bg-transparent border-b border-urban-stone/30 py-4 text-2xl outline-none focus:border-urban-terracotta transition-colors placeholder:text-urban-stone/20"
                                    placeholder="Your Name"
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm uppercase tracking-widest text-urban-stone">Phone Number</label>
                                <input
                                    type="tel"
                                    value={data.phoneNumber}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9+\-\s]/g, '');
                                        updateData({ phoneNumber: val });
                                    }}
                                    className="w-full bg-transparent border-b border-urban-stone/30 py-4 text-2xl outline-none focus:border-urban-terracotta transition-colors placeholder:text-urban-stone/20"
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-light">Which of the following best describes your role?</h2>
                        <div className="grid gap-3 pt-4">
                            {ROLES.map((role) => (
                                <button
                                    key={role}
                                    onClick={() => updateData({ role })}
                                    className={cn(
                                        "text-left p-4 rounded-lg border transition-all duration-200",
                                        data.role === role
                                            ? "border-urban-terracotta bg-urban-terracotta/5 text-urban-terracotta"
                                            : "border-urban-stone/20 hover:border-urban-stone/50 hover:bg-urban-stone/5"
                                    )}
                                >
                                    <span className="text-lg font-light">{role}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-8">
                        <h2 className="text-3xl font-light">Tell us about your project.</h2>

                        <div className="space-y-2">
                            <label className="text-sm uppercase tracking-widest text-urban-stone">Where is your project located?</label>
                            <input
                                type="text"
                                value={data.projectLocation}
                                onChange={(e) => updateData({ projectLocation: e.target.value })}
                                className="w-full bg-transparent border-b border-urban-stone/30 py-2 text-xl outline-none focus:border-urban-terracotta transition-colors"
                                placeholder="City, Country"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm uppercase tracking-widest text-urban-stone">What stage is your project at?</label>
                            <div className="flex flex-wrap gap-2">
                                {STAGES.map(stage => (
                                    <button
                                        key={stage}
                                        onClick={() => updateData({ projectStage: stage })}
                                        className={cn(
                                            "px-4 py-2 rounded-full border text-sm transition-all",
                                            data.projectStage === stage
                                                ? "bg-urban-terracotta text-white border-urban-terracotta"
                                                : "border-urban-stone/30 hover:border-urban-stone text-urban-stone"
                                        )}
                                    >
                                        {stage}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm uppercase tracking-widest text-urban-stone">When do you plan to begin or procure materials?</label>
                            <div className="flex flex-wrap gap-2">
                                {LEAD_TIMES.map(time => (
                                    <button
                                        key={time}
                                        onClick={() => updateData({ leadTime: time })}
                                        className={cn(
                                            "px-4 py-2 rounded-full border text-sm transition-all",
                                            data.leadTime === time
                                                ? "bg-urban-terracotta text-white border-urban-terracotta"
                                                : "border-urban-stone/30 hover:border-urban-stone text-urban-stone"
                                        )}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <p className="text-xs uppercase tracking-widest text-urban-terracotta">Section 2</p>
                            <h2 className="text-3xl font-light">Which clay-based materials are you exploring?</h2>
                            <p className="text-urban-stone font-light">Select all that match your project</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                            {MATERIAL_OPTIONS.map((material) => {
                                const isSelected = data.interestedMaterials.includes(material);
                                return (
                                    <button
                                        key={material}
                                        onClick={() => {
                                            updateData({
                                                interestedMaterials: isSelected
                                                    ? data.interestedMaterials.filter(m => m !== material)
                                                    : [...data.interestedMaterials, material]
                                            });
                                        }}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-lg border transition-all",
                                            isSelected
                                                ? "border-urban-terracotta bg-urban-terracotta/5 text-urban-terracotta"
                                                : "border-urban-stone/20 hover:border-urban-stone/50 hover:bg-urban-stone/5"
                                        )}
                                    >
                                        <span className="text-lg font-light">{material}</span>
                                        {isSelected && <Check className="w-5 h-5" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-8">
                        <div className="space-y-1">
                            <p className="text-xs uppercase tracking-widest text-urban-terracotta">Section 3</p>
                            <h2 className="text-3xl font-light">Refine your aesthetic</h2>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm uppercase tracking-widest text-urban-stone">Color Direction</label>
                            <div className="grid grid-cols-2 gap-2">
                                {COLOR_OPTIONS.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => updateData({ colorPreference: color })}
                                        className={cn(
                                            "px-3 py-3 rounded-md border text-sm text-left transition-all",
                                            data.colorPreference === color
                                                ? "border-urban-terracotta bg-urban-terracotta/5 text-urban-terracotta"
                                                : "border-urban-stone/20 hover:border-urban-stone"
                                        )}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm uppercase tracking-widest text-urban-stone">Architectural Mood</label>
                            <div className="flex flex-wrap gap-2">
                                {STYLE_OPTIONS.map(style => (
                                    <button
                                        key={style}
                                        onClick={() => updateData({ architecturalStyle: style })}
                                        className={cn(
                                            "px-4 py-2 rounded-full border text-sm transition-all",
                                            data.architecturalStyle === style
                                                ? "bg-urban-terracotta text-white border-urban-terracotta"
                                                : "border-urban-stone/30 hover:border-urban-stone text-urban-stone"
                                        )}
                                    >
                                        {style}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm uppercase tracking-widest text-urban-stone">Project Type</label>
                            <div className="flex gap-4">
                                {PROJECT_TYPES.map(type => (
                                    <button
                                        key={type}
                                        onClick={() => updateData({ projectType: type })}
                                        className={cn(
                                            "flex-1 py-4 border rounded-lg text-center transition-all",
                                            data.projectType === type
                                                ? "border-urban-terracotta bg-urban-terracotta/5 text-urban-terracotta"
                                                : "border-urban-stone/20 hover:border-urban-stone"
                                        )}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );



            // ... (rest of renderStep)

            case 5:
                return (
                    <div className="space-y-6 text-center">
                        {isGenerating ? (
                            <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                <Loader2 className="w-12 h-12 animate-spin text-urban-terracotta" />
                                <p className="text-lg font-light animate-pulse">
                                    Curating your customized material board...
                                </p>
                                <p className="text-xs text-urban-stone uppercase tracking-widest">Analyzing taste vector</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-1 mb-8">
                                    <p className="text-xs uppercase tracking-widest text-urban-terracotta">Section 4</p>
                                    <h2 className="text-3xl font-light">Taste Refinement</h2>
                                    <p className="text-urban-stone font-light px-8">Swipe Right if it matches your vision. Swipe Left if it doesn't.</p>
                                </div>
                                <SwipeView onComplete={handleSwipeComplete} items={swipeItems} />
                            </>
                        )
                        }
                    </div >
                );
            case 6:
                return (
                    <div className="space-y-8">
                        <div className="text-center space-y-2">
                            <Sparkles className="w-8 h-8 text-urban-terracotta mx-auto mb-4" />
                            <h2 className="text-3xl font-light">Your Curated Collection</h2>
                            <p className="text-urban-stone">Based on your preferences for {data.architecturalStyle} {data.projectType}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Simulated Curated Grid */}
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="aspect-square bg-urban-stone/10 rounded-lg overflow-hidden relative group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-urban-terracotta/20 to-urban-charcoal/10" />
                                    <div className="absolute bottom-2 left-2 right-2 p-2 bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                        {data.interestedMaterials[i % data.interestedMaterials.length] || "Material"}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 text-center">
                            <button
                                onClick={() => handleSwipeComplete(data.tasteVector)}
                                className="inline-flex items-center gap-2 text-urban-terracotta hover:underline text-sm uppercase tracking-widest"
                            >
                                <RefreshCcw className="w-4 h-4" />
                                Regenerate Options
                            </button>
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
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="w-full"
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="pt-8 flex justify-between items-center bg-transparent relative z-10">
                {step > 0 && step < 6 && !isGenerating && (
                    <button
                        onClick={prevStep}
                        className="text-urban-stone hover:text-urban-charcoal dark:hover:text-urban-white text-sm uppercase tracking-widest transition-colors"
                    >
                        Back
                    </button>
                )}

                <div className="ml-auto">
                    {/* Step 5 (Swipe) handles its own Next, Step 6 is end */}
                    {isStepValid() && step !== 5 && step !== 6 && (
                        <button
                            onClick={nextStep}
                            className="group flex items-center gap-2 bg-urban-charcoal text-white dark:bg-urban-white dark:text-urban-charcoal px-6 py-3 rounded-full transition-all hover:scale-105 active:scale-95"
                        >
                            <span>Next</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    )}

                    {!isStepValid() && step !== 5 && step !== 6 && (
                        <button
                            disabled
                            className="flex items-center gap-2 bg-urban-stone/20 text-urban-stone px-6 py-3 rounded-full cursor-not-allowed"
                        >
                            <span>Next</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Progress Indicator */}
            {step < 6 && (
                <div className="absolute top-0 left-0 w-full h-1 bg-urban-stone/10">
                    <motion.div
                        className="h-full bg-urban-terracotta"
                        initial={{ width: "0%" }}
                        animate={{ width: `${((step + 1) / 6) * 100}%` }}
                    />
                </div>
            )}
        </div>
    );
}
