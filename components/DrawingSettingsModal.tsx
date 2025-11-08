import React, { useState, useEffect } from 'react';
import { AppUser, DrawingSettings, LineSettings } from '../types';
import { settingsService } from '../services/settingsService';
import { LoadingSpinner } from './LoadingSpinner';

interface DrawingSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: DrawingSettings) => void;
    user: AppUser;
    initialSettings: DrawingSettings | null;
}

const DEFAULT_SETTINGS: DrawingSettings = {
    trendline: { color: '#1E90FF', style: 0, width: 2 },
    horizontalLine: { color: '#FFD700', style: 0, width: 1 },
    fibRetracement: { color: '#4B0082', style: 2, width: 1 },
};

type ToolKey = keyof DrawingSettings;

export const DrawingSettingsModal: React.FC<DrawingSettingsModalProps> = ({ isOpen, onClose, onSave, user, initialSettings }) => {
    const [settings, setSettings] = useState<DrawingSettings>(initialSettings || DEFAULT_SETTINGS);
    const [activeTab, setActiveTab] = useState<ToolKey>('trendline');
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        setSettings(initialSettings || DEFAULT_SETTINGS);
    }, [initialSettings]);

    if (!isOpen) return null;

    const handleSettingChange = (tool: ToolKey, property: keyof LineSettings, value: string | number) => {
        setSettings(prev => ({
            ...prev,
            [tool]: {
                ...prev[tool],
                [property]: value,
            }
        }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        setSuccessMessage(null);
        try {
            await settingsService.saveSettings(user.auth.id, settings);
            onSave(settings);
            setSuccessMessage("Settings saved successfully!");
            setTimeout(() => {
                setSuccessMessage(null);
                onClose();
            }, 1500);
        } catch (error) {
            console.error("Failed to save settings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderTabContent = (tool: ToolKey) => (
        <div className="space-y-4 p-4 bg-gray-900/50 rounded-b-lg">
            <div>
                <label className="block text-sm font-medium text-gray-400">Line Color</label>
                <input
                    type="color"
                    value={settings[tool].color}
                    onChange={(e) => handleSettingChange(tool, 'color', e.target.value)}
                    className="w-full h-10 p-1 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400">Line Style</label>
                <select
                    value={settings[tool].style}
                    onChange={(e) => handleSettingChange(tool, 'style', parseInt(e.target.value))}
                    className="w-full h-10 pl-3 text-white bg-gray-700 border border-gray-600 rounded-lg"
                >
                    <option value={0}>Solid</option>
                    <option value={2}>Dashed</option>
                    <option value={1}>Dotted</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400">Line Thickness</label>
                <select
                    value={settings[tool].width}
                    onChange={(e) => handleSettingChange(tool, 'width', parseInt(e.target.value))}
                    className="w-full h-10 pl-3 text-white bg-gray-700 border border-gray-600 rounded-lg"
                >
                    <option value={1}>1px</option>
                    <option value={2}>2px</option>
                    <option value={3}>3px</option>
                    <option value={4}>4px</option>
                </select>
            </div>
        </div>
    );
    
    const tabs: { key: ToolKey; name: string }[] = [
        { key: 'trendline', name: 'Trendline' },
        { key: 'horizontalLine', name: 'Support/Resistance' },
        { key: 'fibRetracement', name: 'Fib Retracement' },
    ];

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-sm border border-gray-700" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white">Drawing Tool Settings</h2>
                </div>
                <div className="flex border-b border-gray-700">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 py-2 text-sm font-medium transition-colors ${
                                activeTab === tab.key ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:bg-gray-700'
                            }`}
                        >
                            {tab.name}
                        </button>
                    ))}
                </div>
                
                {renderTabContent(activeTab)}

                <div className="p-4 bg-gray-800/50 border-t border-gray-700 flex justify-end gap-4">
                    {successMessage && <p className="text-green-400 text-sm flex items-center">{successMessage}</p>}
                    <button onClick={onClose} className="px-4 py-2 text-sm text-gray-300 rounded-lg hover:bg-gray-700">Cancel</button>
                    <button onClick={handleSave} disabled={isLoading} className="px-4 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 disabled:bg-cyan-800 w-24 flex justify-center">
                        {isLoading ? <LoadingSpinner /> : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};