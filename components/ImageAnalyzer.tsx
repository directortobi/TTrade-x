import React, { useRef } from 'react';
import { ImageData } from '../types';

interface ImageAnalyzerProps {
    imageData: ImageData | null;
    onImageDataChange: (data: ImageData | null) => void;
    disabled: boolean;
}

export const ImageAnalyzer: React.FC<ImageAnalyzerProps> = ({ imageData, onImageDataChange, disabled }) => {
    const uploadInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = (reader.result as string).split(',')[1];
                if (base64String) {
                    onImageDataChange({ data: base64String, mimeType: file.type });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerUpload = () => uploadInputRef.current?.click();
    const triggerCamera = () => cameraInputRef.current?.click();
    const clearImage = () => onImageDataChange(null);

    return (
        <div>
             <label className="block text-sm font-medium text-gray-400 mb-2">
                Analyze Chart Image
            </label>
            {imageData ? (
                <div className="relative group">
                    <img
                        src={`data:${imageData.mimeType};base64,${imageData.data}`}
                        alt="Chart preview"
                        className="w-full rounded-lg max-h-64 object-contain bg-gray-900/50 border border-gray-600"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
                         <button
                            onClick={clearImage}
                            disabled={disabled}
                            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-500"
                        >
                            Clear Image
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <input
                        type="file"
                        ref={uploadInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                    <input
                        type="file"
                        ref={cameraInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                    />
                    <button
                        onClick={triggerUpload}
                        disabled={disabled}
                        className="w-full h-12 px-4 text-white font-medium bg-gray-700 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Upload Chart
                    </button>
                    <button
                        onClick={triggerCamera}
                        disabled={disabled}
                        className="w-full h-12 px-4 text-white font-medium bg-gray-700 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Snap Chart
                    </button>
                </div>
            )}
        </div>
    );
};
