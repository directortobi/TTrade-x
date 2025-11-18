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
                console.error("Error creating analysis log:", err);
                // We don't re-throw here, as logging is a non-critical background task.
                // Throwing would block the user from seeing their analysis result.
            }
        }
    },
    
    async getLogs(): Promise<AnalysisLog[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.log("No user session found, cannot fetch logs.");
            return [];
        }

        const { data, error } = await supabase
            .from('analysis_logs')
            .select('*')
            .eq('user_email', user.email)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching analysis logs:', error);
            if (error.message.includes('relation "public.analysis_logs" does not exist')) {
                 throw new Error("The 'analysis_logs' table seems to be missing. Please run the database setup script in INSTRUCTIONS.md to enable this feature.");
            }
            throw error;
        }
        return data || [];
    },

    async updateLogOutcome(logId: number, outcome: AnalysisOutcome): Promise<void> {
        const { error } = await supabase
            .from('analysis_logs')
            .update({ outcome: outcome })
            .eq('id', logId);

        if (error) {
            console.error('Error updating log outcome:', error);
            throw error;
        }
    }
};