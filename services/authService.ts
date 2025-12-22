
// FIX: Removed .ts extension from import path.
import { User, Credentials } from '../types';
import { supabase } from './supabase';

export const authService = {
    signup: async ({ email, password }: Credentials, referredByCode?: string | null): Promise<User> => {
        // FIX: Cast supabase.auth to any to resolve signUp type error
        const { data, error } = await (supabase.auth as any).signUp({
            email: email,
            password: password,
            options: {
                data: referredByCode ? { referred_by: referredByCode } : undefined,
            },
        });

        if (error) {
            throw new Error(error.message);
        }

        if (!data.user) {
            throw new Error('An unexpected error occurred during signup. Please try again.');
        }

        return { id: data.user.id, email: data.user.email! };
    },

    login: async ({ email, password }: Credentials): Promise<User> => {
        // FIX: Cast supabase.auth to any to resolve signInWithPassword type error
        const { data, error } = await (supabase.auth as any).signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            throw new Error(error.message || 'Invalid email or password.');
        }
        if (!data.user) {
           throw new Error('Login failed. Please try again.');
       }

        return { id: data.user.id, email: data.user.email! };
    },

    logout: async (): Promise<void> => {
        // FIX: Cast supabase.auth to any to resolve signOut type error
        const { error } = await (supabase.auth as any).signOut();
        if (error) {
            console.error("Supabase logout error:", error);
            throw new Error(error.message);
        }
    },

    updatePassword: async (password: string): Promise<void> => {
        // FIX: Cast supabase.auth to any to resolve updateUser type error
        const { error } = await (supabase.auth as any).updateUser({ password });
        if (error) {
            throw new Error(error.message);
        }
    },
};
