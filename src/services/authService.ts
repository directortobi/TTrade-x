
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
            // If there's an error from Supabase (e.g., user already exists), throw it.
            throw new Error(error.message);
        }

        // When signup is successful (even with email confirmation), `data.user` should exist.
        // If it doesn't, it's an unexpected state.
        if (!data.user) {
            throw new Error('An unexpected error occurred during signup. Please try again.');
        }

        // The user object is returned. The App component will handle showing
        // the "check your email" message, and the onAuthStateChange listener
        // will handle the user state once they are logged in.
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
