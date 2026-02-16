"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, getProfile, signOut as signOutHelper } from '@/lib/supabase';
import type { Profile } from '@/types';
import { DEV_MODE, getCurrentDemoUser } from '@/lib/demo-user';

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // DEV MODE: Skip auth and use demo user
        if (DEV_MODE) {
            const demoUser = getCurrentDemoUser();
            setProfile(demoUser as Profile);
            setLoading(false);
            return;
        }

        // PRODUCTION MODE: Real authentication
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                await fetchProfile(session.user.id);
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    async function fetchProfile(userId: string) {
        try {
            const data = await getProfile(userId);
            setProfile(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    }

    async function handleSignOut() {
        if (DEV_MODE) {
            console.log('Dev mode: Sign out disabled');
            return;
        }

        try {
            await signOutHelper();
            setUser(null);
            setProfile(null);
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    }

    const value = {
        user,
        profile,
        loading,
        signOut: handleSignOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
