import { FileText, ListChecks, LogOut, User, Wallet } from 'lucide-react';
import { useSession, signOut } from "next-auth/react";
import type { ContractMode } from '../types';
import { ConnectWallet } from './ConnectWallet';

interface SidebarProps {
    currentMode: ContractMode;
    currentView: 'list' | 'create' | 'detail';
    onModeChange: (mode: ContractMode) => void;
    onViewChange: (view: 'list' | 'create') => void;
    wallet: {
        address: string | null;
        loading: boolean;
        error: string | null;
        connect: () => void;
    };
}

export function Sidebar({ currentMode, currentView, onModeChange, onViewChange, wallet }: SidebarProps) {
    const { data: session } = useSession();

    const handleModeChange = (mode: ContractMode) => {
        onModeChange(mode);
        onViewChange('list');
    };

    const handleMenuClick = (view: 'list' | 'create') => {
        onViewChange(view);
    };

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900 text-lg">Contract System</h2>
                <p className="text-xs text-gray-500 mt-1">Threshold Signature Approval</p>
            </div>

            <nav className="flex-1 p-4 overflow-y-auto">
                { }
                <div className="mb-6">
                    <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Main Workflows
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
                    {currentMode === 'onchain' && (
                        <div className="ml-3 space-y-1">
                            <button
                                onClick={() => handleMenuClick('create')}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors ${currentView === 'create'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <FileText size={16} />
                                Create Contract
                            </button>
                            <button
                                onClick={() => handleMenuClick('list')}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors ${currentView === 'list' || currentView === 'detail'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <ListChecks size={16} />
                                Contract List
                            </button>
                        </div>
                    )}
                </div>

                { }
                <div>
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
                    {currentMode === 'offchain' && (
                        <div className="ml-3 space-y-1">
                            <button
                                onClick={() => handleMenuClick('create')}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors ${currentView === 'create'
                                    ? 'bg-green-50 text-green-700'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <FileText size={16} />
                                Create Contract
                            </button>
                            <button
                                onClick={() => handleMenuClick('list')}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors ${currentView === 'list' || currentView === 'detail'
                                    ? 'bg-green-50 text-green-700'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <ListChecks size={16} />
                                Contract List
                            </button>
                        </div>
                    )}
                </div>

                {/* Admin Menu */}
                {session?.user && (session.user as any).role === 'admin' && (
                    <div className="mt-6">
                        <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Admin
                        </p>
                        <button
                            onClick={() => window.location.href = '/dashboard/admin/users'}
                            className="w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <User size={16} />
                            User Management
                        </button>
                    </div>
                )}
            </nav>

            <div className="p-4 border-t border-gray-200 bg-gray-50/50">
                <ConnectWallet
                    address={wallet.address}
                    loading={wallet.loading}
                    error={wallet.error}
                    onConnect={wallet.connect}
                />

                <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <User size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {session?.user?.name || "Loading..."}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {session?.user?.email}
                        </p>
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

