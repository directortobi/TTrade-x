import { supabase } from './supabase';

export const drawingService = {
    async saveDrawings(userId: string, assetTicker: string, drawingsJson: object): Promise<void> {
        const { error } = await supabase
            .from('user_chart_drawings')
            .upsert(
                {
                    user_id: userId,
                    asset_ticker: assetTicker,
                    drawings_json: drawingsJson,
                    updated_at: new Date().toISOString()
                },
                { onConflict: 'user_id, asset_ticker' }
            );

        if (error) {
            console.error('Error saving chart drawings:', error);
            throw new Error('Could not save your drawings. Please try again.');
        }
    },

    async loadDrawings(userId: string, assetTicker: string): Promise<object | null> {
        const { data, error } = await supabase
            .from('user_chart_drawings')
            .select('drawings_json')
            .eq('user_id', userId)
            .eq('asset_ticker', assetTicker)
            .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 = row not found, which is not an error here
            console.error('Error loading chart drawings:', error);
            // Don't throw, just return null so the chart can still load without saved drawings.
            return null;
        }

        return data?.drawings_json || null;
    }
};
