import React from 'react';
import { Notification, NotificationType } from '../../types';
import { View } from '../../MainApp';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US');

const SignalIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>);
const TokenIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" /></svg>);
const ReferralIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962A3.75 3.75 0 0112 15v-2.25L8.625 9.75M15 15v-2.25L11.625 9.75M12 21a9.004 9.004 0 008.634-11.956 9.004 9.004 0 00-17.268 0A9.004 9.004 0 0012 21z" /></svg>);
const CheckCircleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const XCircleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);

const getIconForType = (type: NotificationType) => {
    if (type.startsWith('signal')) return <SignalIcon />;
    if (type.startsWith('purchase')) return type.endsWith('approved') ? <CheckCircleIcon /> : <XCircleIcon />;
    if (type.startsWith('withdrawal')) return type.endsWith('approved') ? <CheckCircleIcon /> : <XCircleIcon />;
    if (type.startsWith('referral_withdrawal')) return type.endsWith('approved') ? <CheckCircleIcon /> : <XCircleIcon />;
    if (type.startsWith('referral')) return <ReferralIcon />;
    return <TokenIcon />;
};


interface NotificationPanelProps {
    notifications: Notification[];
    onMarkAsRead: (id: number) => void;
    onMarkAllAsRead: () => void;
    onNavigate: (view: View) => void;
    onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onMarkAsRead, onMarkAllAsRead, onNavigate, onClose }) => {

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.is_read) {
            onMarkAsRead(notification.id);
        }
        if (notification.link) {
            onNavigate(notification.link as View);
        }
        onClose();
    };

    return (
        <div className="absolute top-16 right-0 w-80 sm:w-96 bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-lg shadow-2xl z-50 animate-fade-in-down">
            <div className="flex justify-between items-center p-3 border-b border-gray-700">
                <h3 className="font-semibold text-white">Notifications</h3>
                <button onClick={onMarkAllAsRead} className="text-sm text-cyan-400 hover:underline disabled:text-gray-500 disabled:no-underline" disabled={!notifications.some(n => !n.is_read)}>
                    Mark all as read
                </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                    <p className="text-center text-gray-400 py-10">You have no notifications.</p>
                ) : (
                    <ul>
                        {notifications.map(n => (
                            <li key={n.id} className="border-b border-gray-800 last:border-b-0">
                                <button onClick={() => handleNotificationClick(n)} className="w-full text-left p-3 hover:bg-gray-800/50 transition-colors flex items-start gap-3">
                                    {!n.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>}
                                    <div className={`flex-shrink-0 text-gray-300 ${n.is_read ? 'ml-5' : ''}`}>{getIconForType(n.type)}</div>
                                    <div>
                                        <p className={`text-sm ${n.is_read ? 'text-gray-400' : 'text-gray-200 font-medium'}`}>{n.message}</p>
                                        <p className="text-xs text-gray-500 mt-1">{timeAgo.format(new Date(n.created_at))}</p>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};