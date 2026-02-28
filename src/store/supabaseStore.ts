import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

interface SupabaseStore {
    session: Session | null;
    isInitializing: boolean;
    initializeSession: () => Promise<void>;
    updateProfile: (data: { level: number; xp: number; net_worth: number; avatar: string; username: string }) => Promise<void>;
}

export const useSupabaseStore = create<SupabaseStore>((set, get) => ({
    session: null,
    isInitializing: true,

    initializeSession: async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) throw error;

            if (session) {
                set({ session, isInitializing: false });
            } else {
                // Create an anonymous session automatically
                const { data: { session: newSession }, error: signInError } = await supabase.auth.signInAnonymously();
                if (signInError) throw signInError;
                set({ session: newSession, isInitializing: false });
            }
        } catch (error) {
            console.error('Failed to initialize Supabase session:', error);
            set({ isInitializing: false });
        }
    },

    updateProfile: async ({ level, xp, net_worth, avatar, username }) => {
        const { session } = get();
        if (!session?.user) return;

        try {
            const { error } = await supabase.from('profiles').upsert({
                id: session.user.id,
                username,
                avatar,
                level,
                xp,
                net_worth,
            });

            if (error) {
                console.error('Error updating profile in Supabase:', error.message);
            }
        } catch (error) {
            console.error('Exception updating profile:', error);
        }
    },
}));
