"use client";

import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';

export function useWeb3() {
    const [address, setAddress] = useState<string | null>(null);
    const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const connectWallet = useCallback(async () => {
        if (typeof window === 'undefined' || !window.ethereum) {
            setError("MetaMask not found. Please install MetaMask extension.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const provider = new BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();

            setAddress(accounts[0]);
            setSigner(signer);
        } catch (err: any) {
            console.error("Wallet connection error:", err);
            setError(err.message || "Failed to connect wallet");
        } finally {
            setLoading(false);
        }
    }, []);

    const disconnectWallet = useCallback(() => {
        setAddress(null);
        setSigner(null);
    }, []);

    // Listen for account changes
    useEffect(() => {
        if (typeof window !== 'undefined' && window.ethereum) {
            const handleAccountsChanged = (accounts: string[]) => {
                if (accounts.length > 0) {
                    setAddress(accounts[0]);
                } else {
                    setAddress(null);
                    setSigner(null);
                }
            };

            window.ethereum.on('accountsChanged', handleAccountsChanged);
            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            };
        }
    }, []);

    return { address, signer, loading, error, connectWallet, disconnectWallet };
}
