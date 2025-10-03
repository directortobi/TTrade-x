import { supabase } from './supabase';
import { AnalysisLog, AnalysisOutcome, AnalysisResult } from '../types';

export const logService = {
    async createLog(result: AnalysisResult, userEmail: string, tokensUsed: number): Promise<void> {
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
            // FIX: Log the actual error message instead of [object Object]
            const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
            console.error("Failed to create analysis log:", errorMessage);
            // We don't re-throw here to avoid blocking the user from seeing their result.
            // The error is logged for debugging.
        }
    },

    async getLogs(): Promise<AnalysisLog[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !user.email) {
            throw new Error("User not authenticated.");
        }

        const { data, error } = await supabase
            .from('analysis_logs')
            .select('*')
            .eq('user_email', user.email)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching analysis logs:", error);
            if (error.message.includes('relation "public.analysis_logs" does not exist')) {
                 throw new Error('The analysis_logs table is missing. Please run the setup script in INSTRUCTIONS.md.');
            }
            throw new Error(error.message);
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
