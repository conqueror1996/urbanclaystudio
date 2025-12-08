
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { OnboardingData } from '@/lib/types';

interface UserContextType {
    user: OnboardingData | null;
    setUser: (user: OnboardingData) => void;
    highTicketScore: number;
    refineTaste: (dimension: string, value: number) => void;
    savedItems: any[];
    saveItem: (item: any) => void;
    removeItem: (id: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<OnboardingData | null>(null);
    const [highTicketScore, setHighTicketScore] = useState(0);

    const [savedItems, setSavedItems] = useState<any[]>([]);

    // Initial load from local storage if available (client-side only)
    useEffect(() => {
        const savedUser = localStorage.getItem('urbanclay_user');
        const savedCollection = localStorage.getItem('urbanclay_saved_items');

        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        if (savedCollection) {
            setSavedItems(JSON.parse(savedCollection));
        } else {
            // Mock some initial saved items for the demo if empty
            setSavedItems([
                {
                    id: 'mock-1',
                    title: 'Rustic Red Facade',
                    category: 'Exposed Brick',
                    imageUrl: 'https://images.unsplash.com/photo-1620626012053-1c167f7eb08f?q=80&w=1000&auto=format&fit=crop',
                    tags: ['Rustic', 'Deep Rustic Red'],
                    isPremium: false,
                    savedAt: Date.now()
                }
            ]);
        }
    }, []);

    // Save to local storage whenever user updates
    useEffect(() => {
        if (user) {
            localStorage.setItem('urbanclay_user', JSON.stringify(user));

            // Calculate High Ticket Score based on role & project
            let score = 0;
            if (user.role === 'Architect' || user.role === 'Builder') score += 30;
            if (user.projectType === 'Commercial') score += 20;
            if (user.leadTime === 'Immediately') score += 20;
            if (user.projectStage === 'Execution') score += 20;
            setHighTicketScore(score);
        }
    }, [user]);

    // Save collection to local storage
    useEffect(() => {
        localStorage.setItem('urbanclay_saved_items', JSON.stringify(savedItems));
    }, [savedItems]);

    const refineTaste = (dimension: string, value: number) => {
        // In a real app, this would update the Taste Vector
        console.log(`Refining ${dimension} by ${value}`);
    };

    const saveItem = (item: any) => {
        setSavedItems(prev => {
            if (prev.find(i => i.id === item.id)) return prev;
            return [...prev, { ...item, savedAt: Date.now() }];
        });
    };

    const removeItem = (id: string) => {
        setSavedItems(prev => prev.filter(i => i.id !== id));
    };

    return (
        <UserContext.Provider value={{ user, setUser, highTicketScore, refineTaste, savedItems, saveItem, removeItem }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
