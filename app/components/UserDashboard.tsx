"use client";

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { User, LogOut, ClipboardList, History } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { ContractList } from './ContractList';
import { ContractDetail } from './ContractDetail';
import { ConnectWallet } from './ConnectWallet';
import { getContractsForVerification, getVerificationHistory, approveContract } from '@/app/actions/contract-actions';
import { useWeb3 } from '../hooks/useWeb3';
import type { ContractMode } from '../types';

interface UserDashboardProps {
    currentUser: string;
}

export function UserDashboard({ currentUser }: UserDashboardProps) {
    const { address, signer, loading: walletLoading, error: walletError, connectWallet } = useWeb3();
    const [currentMode, setCurrentMode] = useState<ContractMode>('onchain');
    const [currentView, setCurrentView] = useState<'pending' | 'history' | 'detail'>('pending');
    const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
    const [pendingContracts, setPendingContracts] = useState<any[]>([]);
    const [historyContracts, setHistoryContracts] = useState<any[]>([]);

    // Load data
    useEffect(() => {
        loadData();
    }, [currentView, currentUser]);

    const loadData = async () => {
        if (currentView === 'pending') {
            const pending = await getContractsForVerification(currentUser);
            setPendingContracts(pending);
        } else if (currentView === 'history') {
            const history = await getVerificationHistory(currentUser);
            setHistoryContracts(history);
        }
    };

    const handleApprove = async (contractId: string, userId: string, signature?: string, transactionHash?: string) => {
        const result = await approveContract(contractId, userId, signature, transactionHash);
        if (result.success) {
            await loadData();
            // Refresh both lists
            const pending = await getContractsForVerification(currentUser);
            setPendingContracts(pending);
            const history = await getVerificationHistory(currentUser);
            setHistoryContracts(history);
        } else {
            alert('Failed to approve contract');
        }
    };

    const handleViewContract = (contractId: string) => {
        setSelectedContractId(contractId);
        setCurrentView('detail');
    };

    const handleBackFromDetail = () => {
        setSelectedContractId(null);
        setCurrentView('pending');
        loadData();
    };

    // Filter contracts by mode
    const filteredPending = pendingContracts.filter(c => c.contractMode === currentMode);
    const filteredHistory = historyContracts.filter(c => c.contractMode === currentMode);

    const selectedContract = [...pendingContracts, ...historyContracts].find(c => c.id === selectedContractId);

    return (
        <div className="flex h-screen bg-gray-50">
            <UserSidebar
                currentMode={currentMode}
                currentView={currentView}
                onModeChange={setCurrentMode}
                onViewChange={setCurrentView}
                wallet={{
                    address,
                    loading: walletLoading,
                    error: walletError,
                    connect: connectWallet
                }}
            />

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white border-b border-gray-200 px-8 py-4">
                    <h1 className="text-xl font-semibold text-gray-900">
                        {currentMode === 'onchain' ? 'On Chain' : 'Off Chain'} - Contract Verification
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {currentView === 'pending'
                            ? 'Review and approve contracts that require your verification'
                            : currentView === 'history'
                                ? 'View your verification history'
                                : 'Contract Details'
                        }
                    </p>
                </header>

                <main className="flex-1 overflow-auto p-8">
                    {currentView === 'pending' && (
                        <div>
                            <h2 className="text-lg font-semibold mb-4">Pending Verifications</h2>
                            {filteredPending.length === 0 ? (
                                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                                    <p className="text-gray-500">No pending verifications</p>
                                </div>
                            ) : (
                                <ContractList
                                    contracts={filteredPending}
                                    onViewContract={handleViewContract}
                                />
                            )}
                        </div>
                    )}

                    {currentView === 'history' && (
                        <div>
                            <h2 className="text-lg font-semibold mb-4">Verification History</h2>
                            {filteredHistory.length === 0 ? (
                                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                                    <p className="text-gray-500">No verification history</p>
                                </div>
                            ) : (
                                <ContractList
                                    contracts={filteredHistory}
                                    onViewContract={handleViewContract}
                                />
                            )}
                        </div>
                    )}

                    {currentView === 'detail' && selectedContract && (
                        <ContractDetail
                            contract={selectedContract}
                            currentUser={currentUser}
                            onApprove={handleApprove}
                            onBack={handleBackFromDetail}
                            walletAddress={address}
                            signer={signer}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}

// User-specific sidebar
function UserSidebar({ currentMode, currentView, onModeChange, onViewChange, wallet }: {
    currentMode: ContractMode;
    currentView: 'pending' | 'history' | 'detail';
    onModeChange: (mode: ContractMode) => void;
    onViewChange: (view: 'pending' | 'history') => void;
    wallet: {
        address: string | null;
        loading: boolean;
        error: string | null;
        connect: () => void;
    };
}) {
    const { data: session } = useSession();

    const handleModeChange = (mode: ContractMode) => {
        onModeChange(mode);
        onViewChange('pending');
    };

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900 text-lg">Contract System</h2>
                <p className="text-xs text-gray-500 mt-1">Verification Dashboard</p>
            </div>

            <nav className="flex-1 p-4 overflow-y-auto">
                {/* Mode Selection */}
                <div className="mb-6">
                    <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Contract Mode
                    </p>
                    <button
                        onClick={() => handleModeChange('onchain')}
                        className={`w-full text-left px-3 py-2 rounded-md mb-2 transition-colors flex items-center justify-between ${currentMode === 'onchain'
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <span>On Chain</span>
                        {currentMode === 'onchain' && <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                    </button>
                    <button
                        onClick={() => handleModeChange('offchain')}
                        className={`w-full text-left px-3 py-2 rounded-md mb-2 transition-colors flex items-center justify-between ${currentMode === 'offchain'
                            ? 'bg-green-50 text-green-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <span>Off Chain</span>
                        {currentMode === 'offchain' && <div className="w-1.5 h-1.5 rounded-full bg-green-600" />}
                    </button>
                </div>

                {/* View Selection */}
                <div>
                    <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Verifications
                    </p>
                    <button
                        onClick={() => onViewChange('pending')}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors mb-1 ${(currentView === 'pending' || currentView === 'detail')
                            ? currentMode === 'onchain' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <ClipboardList size={16} />
                        Pending Verification
                    </button>
                    <button
                        onClick={() => onViewChange('history')}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors ${currentView === 'history'
                            ? currentMode === 'onchain' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <History size={16} />
                        Verification History
                    </button>
                </div>
            </nav>

            <div className="p-4 border-t border-gray-200 bg-gray-50/50">
                <ConnectWallet
                    address={wallet.address}
                    loading={wallet.loading}
                    error={wallet.error}
                    onConnect={wallet.connect}
                />

                <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                        <User size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {session?.user?.name || "Loading..."}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {session?.user?.email}
                        </p>
                        <p className="text-xs text-purple-600 font-medium">User</p>
                    </div>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                    <LogOut size={16} />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
