
import React from 'react';
import { Asset } from '../../types';

interface AssetSelectorProps {
    assets: Asset[];
    selectedAsset: Asset;
    onSelectAsset: (asset: Asset) => void;
}

// Selector for choosing trading assets (Forex, Crypto, etc.)
export const AssetSelector: React.FC<AssetSelectorProps> = ({ assets, selectedAsset, onSelectAsset }) => (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {assets.map((asset) => (
            <button
                key={asset.ticker}
                onClick={() => onSelectAsset(asset)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    selectedAsset.ticker === asset.ticker
                        ? 'bg-cyan-600 text-white shadow-lg'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
            >
                {asset.ticker}
            </button>
        ))}
    </div>
);
