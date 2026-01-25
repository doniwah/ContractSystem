import { FileText, ListChecks } from 'lucide-react';
import type { ContractMode } from '../App';

interface SidebarProps {
    currentMode: ContractMode;
    currentView: 'list' | 'create' | 'detail';
    onModeChange: (mode: ContractMode) => void;
    onViewChange: (view: 'list' | 'create') => void;
}

export function Sidebar({ currentMode, currentView, onModeChange, onViewChange }: SidebarProps) {
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
                <h2 className="font-semibold text-gray-900">Contract System</h2>
                <p className="text-xs text-gray-500 mt-1">Threshold Signature Approval</p>
            </div>

            <nav className="flex-1 p-4">
                {/* On Chain Section */}
                <div className="mb-6">
                    <button
                        onClick={() => handleModeChange('onchain')}
                        className={`w-full text-left px-3 py-2 rounded-md mb-2 transition-colors ${currentMode === 'onchain'
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        On Chain
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

                {/* Off Chain Section */}
                <div>
                    <button
                        onClick={() => handleModeChange('offchain')}
                        className={`w-full text-left px-3 py-2 rounded-md mb-2 transition-colors ${currentMode === 'offchain'
                                ? 'bg-green-50 text-green-700 font-medium'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        Off Chain
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
            </nav>

            <div className="p-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                    <div className="flex items-center justify-between mb-1">
                        <span>Current User:</span>
                        <span className="font-medium text-gray-700">Alice Johnson</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
