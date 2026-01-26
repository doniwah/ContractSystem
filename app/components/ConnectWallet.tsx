"use client";

import { Wallet, Loader2, Link2, ShieldCheck } from 'lucide-react';

interface ConnectWalletProps {
    address: string | null;
    loading: boolean;
    error: string | null;
    onConnect: () => void;
}

export function ConnectWallet({ address, loading, error, onConnect }: ConnectWalletProps) {
    if (address) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-md border border-green-100 mb-4">
                <ShieldCheck size={16} className="shrink-0" />
                <span className="text-xs font-mono truncate">
                    {address.substring(0, 6)}...{address.substring(address.length - 4)}
                </span>
            </div>
        );
    }

    return (
        <div className="mb-4">
            {error && (
                <p className="text-[10px] text-red-500 mb-2 px-1 leading-tight">{error}</p>
            )}
            <button
                onClick={onConnect}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors disabled:bg-blue-400"
            >
                {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                ) : (
                    <Wallet size={16} />
                )}
                <span>Connect Wallet</span>
            </button>
        </div>
    );
}
