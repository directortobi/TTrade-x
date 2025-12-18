
import { supabase } from './supabase';
// FIX: Removed .ts extension.
import { Profile } from '../types';

export const profileService = {
    async getProfile(userId: string): Promise<Profile | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                console.warn(`Profile for user ${userId} not found.`);
                return null;
            }
            if (error.message.includes('relation "public.profiles" does not exist')) {
                 console.warn(`'profiles' table not found.`);
                 return null;
            }
            throw new Error(error.message);
        }
        return data;
    }
};
