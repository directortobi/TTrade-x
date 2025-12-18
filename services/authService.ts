
// FIX: Removed .ts extension from import path.
import { User, Credentials } from '../types';
import { supabase } from './supabase';

export const authService = {
    signup: async ({ email, password }: Credentials, referredByCode?: string | null): Promise<User> => {
        const { data, error } = await supabase.auth.signUp({
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
        const { data, error } = await supabase.auth.signInWithPassword({
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
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Supabase logout error:", error);
            throw new Error(error.message);
        }
    },

    updatePassword: async (password: string): Promise<void> => {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
            throw new Error(error.message);
        }
    },
};
