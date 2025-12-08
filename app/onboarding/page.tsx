import OnboardingWizard from "@/app/onboarding/OnboardingWizard";

export default function OnboardingPageMain() {
    return (
        <main className="min-h-screen bg-urban-white dark:bg-urban-charcoal text-urban-charcoal dark:text-urban-white relative overflow-hidden">
            <OnboardingWizard />
        </main>
    );
}
