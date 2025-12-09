import OnboardingWizard from "@/app/onboarding/OnboardingWizard";

export default function OnboardingPageMain() {
    return (
        <main className="min-h-screen bg-background text-foreground relative overflow-hidden selection:bg-urban-terracotta selection:text-white">
            <OnboardingWizard />
        </main>
    );
}
