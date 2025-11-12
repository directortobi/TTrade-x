import { supabase } from './supabase';
// FIX: Add .ts extension to import path.
import { Profile } from '../types';

export const profileService = {
    async getProfile(userId: string): Promise<Profile | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            // Case 1: Row not found. This is expected if the trigger is slow or fails.
            if (error.code === 'PGRST116') {
                console.warn(`Profile for user ${userId} not found in database.`);
                return null;
            }
            
            // Case 2: Table not found. This happens if the DB is not set up correctly.
            // The error message from PostgREST for a missing table is "relation "public.profiles" does not exist"
            // The user reported "Could not find the table 'public.profiles' in the schema cache"
            if (error.message.includes('relation "public.profiles" does not exist') || error.message.includes("Could not find the table 'public.profiles'")) {
                 console.warn(`'profiles' table not found. The app will run with a default profile. See INSTRUCTIONS.md to set up the database table.`);
                 return null;
            }

            // Case 3: Any other database error.
            console.error('Error fetching profile:', error);
            throw new Error(error.message);
        }

        return data;
    }
};