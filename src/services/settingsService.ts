import { supabase } from './supabase.ts';
import { DrawingSettings } from '../types.ts';

export const settingsService = {
    async saveSettings(userId: string, settings: DrawingSettings): Promise<void> {
        const { error } = await supabase
            .from('user_indicator_settings')
            .upsert(
                {
                    user_id: userId,
                    settings_json: settings,
                    updated_at: new Date().toISOString()
                },
                { onConflict: 'user_id' }
            );

        if (error) {
            console.error('Error saving settings:', error);
            throw new Error('Could not save your settings. Please try again.');
        }
    },

    async loadSettings(userId: string): Promise<DrawingSettings | null> {
        const { data, error } = await supabase
            .from('user_indicator_settings')
            .select('settings_json')
            .eq('user_id', userId)
            .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 = row not found
            console.error('Error loading settings:', error);
            return null;
        }

        return data?.settings_json as DrawingSettings | null;
    }
};