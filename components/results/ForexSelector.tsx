import React from 'react';
import { Asset } from '../../types';

interface AssetSelectorProps {
    assets: Asset[];
    selectedAsset: Asset;
    onSelectAsset: (asset: Asset) => void;
}

export const AssetSelector: React.FC<AssetSelectorProps> = ({ assets, selectedAsset, onSelectAsset }) => {
    const handleSelectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedTicker = event.target.value;
        const asset = assets.find(a => a.ticker === selectedTicker);
        if (asset) {
            onSelectAsset(asset);
        }
    };

    return (
        <div>
            <label htmlFor="asset-selector" className="block text-sm font-medium text-gray-400 mb-2">
                Select Asset
            </label>
            <select
                id="asset-selector"
                value={selectedAsset.ticker}
                onChange={handleSelectionChange}
                className="w-full h-12 pl-3 pr-10 text-base text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
            >
                {assets.map((asset) => (
                    <option key={asset.ticker} value={asset.ticker} className="bg-gray-800 text-white">
                        {asset.name} ({asset.ticker})
                    </option>
                ))}
            </select>
        </div>
    );
};
