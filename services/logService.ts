import { supabase } from './supabase';
import { AnalysisLog, AnalysisOutcome, AnalysisResult } from '../types';

export const logService = {
    async createLog(result: AnalysisResult, userEmail: string, tokensUsed: number, userId: string): Promise<void> {
        try {
            const { error } = await supabase.from('analysis_logs').insert({
                user_email: userEmail,
                symbol: result.pair,
                signal: result.signal,
                entry_price: result.signal !== 'HOLD' ? result.entryPrice : null,
                stop_loss: result.signal !== 'HOLD' ? result.stopLoss : null,
                take_profit_1: result.signal !== 'HOLD' ? result.takeProfit : null,
                confidence: result.confidenceLevel,
                analysis_notes: result.rationale,
                outcome: 'Pending',
                tokens_used: tokensUsed,
            });
            if (error) throw error;
        } catch (err) {
            const error = err as any;
            const errorMessage = (error.message || '').toLowerCase();
            if (errorMessage.includes("could not find the table 'public.analysis_logs'") || errorMessage.includes('relation "public.analysis_logs" does not exist')) {
                const specificError = "The 'analysis_logs' table is missing from your database. Please run the full database setup script from INSTRUCTIONS.md to enable history.";
                // Instead of throwing, we just warn the developer in the console.
                // This prevents a scary error message for a non-critical feature if the DB isn't fully set up.
                console.warn(`Analysis history not saved: ${specificError}`);
            } else {
                console.error("Failed to create analysis log:", errorMessage);
                // We don't re-throw other errors to avoid blocking the user from seeing their result.
            }
        }

        // Create notification for high-confidence signals
        if (result.signal !== 'HOLD' && result.confidenceLevel > 70) {
            try {
                const message = `New ${result.signal} signal for ${result.pair} with ${result.confidenceLevel}% confidence.`;
                const type = result.signal === 'BUY' ? 'signal_buy' : 'signal_sell';

                const { error: notificationError } = await supabase.from('notifications').insert({
                    user_id: userId,
                    type: type,
                    message: message,
                    link: 'history',
                });
                if (notificationError) throw notificationError;
            } catch (err) {
                console.error("Failed to create signal notification:", err);
                // Don't block UI for this
            }
        }
    },

    async getLogs(): Promise<AnalysisLog[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !user.email) {
            // This can happen on initial load, not an error.
            return [];
        }

        const { data, error } = await supabase
            .from('analysis_logs')
            .select('*')
            .eq('user_email', user.email)
            .order('created_at', { ascending: false });

        if (error) {
            const errorMessage = (error.message || '').toLowerCase();
            if (errorMessage.includes('relation "public.analysis_logs" does not exist') || errorMessage.includes("could not find the table 'public.analysis_logs'")) {
                 console.warn('The analysis_logs table is missing. History page will be empty. Please run the setup script in INSTRUCTIONS.md.');
                 return []; // Gracefully handle missing table
            }
            console.error("Error fetching analysis logs:", error);
            throw new Error(error.message); // Throw for other unexpected errors
        }

        return data as AnalysisLog[];
    },

    async updateLogOutcome(logId: number, outcome: AnalysisOutcome): Promise<AnalysisLog> {
        const { data, error } = await supabase
            .from('analysis_logs')
            .update({ outcome })
            .eq('id', logId)
            .select()
            .single();

        if (error) {
            console.error("Error updating log outcome:", error);
            throw new Error(error.message);
        }

        return data as AnalysisLog;
    }
};
