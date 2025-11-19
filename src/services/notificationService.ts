
import { supabase } from './supabase';
import { Notification } from '../types';

export const notificationService = {
    async getNotifications(): Promise<Notification[]> {
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError) {
                // Explicitly handle this error case to prevent it from bubbling up.
                if (userError.message.includes('User not authenticated')) {
                    // This is a common case during session refresh, not a critical error.
                    return [];
                }
                console.warn("Could not get user for notifications:", userError.message);
                return [];
            }
            if (!user) {
                return [];
            }

            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50);
            
            if (error) {
                const errorMessage = (error.message || '').toLowerCase();
                if (errorMessage.includes('relation "public.notifications" does not exist') || errorMessage.includes("could not find the table 'public.notifications'")) {
                    console.warn("Notifications table not found. App will function without notifications. Please run the database setup script from INSTRUCTIONS.md to enable this feature.");
                    return [];
                }
                console.error("Error fetching notifications:", error.message || error);
                return [];
            }
            return data || [];
        } catch (err) {
            console.error("Unexpected error in getNotifications, returning empty array:", (err as Error).message || err);
            return [];
        }
    },

    async markAsRead(notificationId: number): Promise<Notification> {
        const { data, error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId)
            .select()
            .single();
        
        if (error) {
            console.error("Error marking notification as read:", error);
            throw error;
        }
        return data;
    },

    async markAllAsRead(): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated.");

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);
        
        if (error) {
            console.error("Error marking all notifications as read:", error);
            throw error;
        }
    }
};