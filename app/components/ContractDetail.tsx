import { ArrowLeft, CheckCircle, Clock, Users, Target, Activity } from 'lucide-react';
import type { Contract, Approval, BlockchainLog } from '../App';

interface ContractDetailProps {
    contract: Contract;
    approvals: Approval[];
    blockchainLogs: BlockchainLog[];
    currentUser: string;
    onApprove: (contractId: string, userId: string) => void;
    onBack: () => void;
}

export function ContractDetail({
    contract,
    approvals,
    blockchainLogs,
    currentUser,
    onApprove,
    onBack,
}: ContractDetailProps) {
    const approvedCount = approvals.filter(a => a.status === 'approved').length;
    const currentUserApproval = approvals.find(a => a.userId === currentUser);
    const canApprove = currentUserApproval && currentUserApproval.status === 'pending' && contract.status === 'pending';

    const handleApprove = () => {
        if (canApprove) {
            onApprove(contract.id, currentUser);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft size={16} />
                    Back to Contract List
                </button>
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">{contract.title}</h2>
                        <p className="text-sm text-gray-500 mt-1">Contract ID: {contract.id}</p>
                    </div>
                    {contract.status === 'approved' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            <CheckCircle size={16} />
                            Approved
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                            <Clock size={16} />
                            Pending Approval
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Contract Information */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-4">Contract Information</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Description</label>
                                <p className="mt-1 text-sm text-gray-900">{contract.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</label>
                                    <p className="mt-1 text-sm text-gray-900 capitalize">
                                        {contract.mode === 'onchain' ? 'On Chain' : 'Off Chain'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Created</label>
                                    <p className="mt-1 text-sm text-gray-900">{contract.createdAt.toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Approval Progress */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-900">Approval Progress</h3>
                            <div className="flex items-center gap-2">
                                <Target size={16} className="text-gray-400" />
                                <span className="text-sm text-gray-600">
                                    Threshold: {contract.threshold} of {approvals.length}
                                </span>
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">
                                    {approvedCount} / {contract.threshold} approvals
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                    {Math.round((approvedCount / contract.threshold) * 100)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full transition-all ${contract.status === 'approved' ? 'bg-green-500' : 'bg-blue-500'
                                        }`}
                                    style={{ width: `${Math.min((approvedCount / contract.threshold) * 100, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Approver List */}
                        <div className="space-y-2">
                            {approvals.map((approval) => (
                                <div
                                    key={approval.userId}
                                    className={`flex items-center justify-between p-3 rounded-md border ${approval.status === 'approved'
                                        ? 'bg-green-50 border-green-200'
                                        : 'bg-gray-50 border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center ${approval.status === 'approved'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-200 text-gray-500'
                                                }`}
                                        >
                                            {approval.status === 'approved' ? (
                                                <CheckCircle size={16} />
                                            ) : (
                                                <Clock size={16} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{approval.userName}</p>
                                            {approval.timestamp && (
                                                <p className="text-xs text-gray-500">
                                                    Approved on {approval.timestamp.toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <span
                                        className={`text-xs font-medium ${approval.status === 'approved' ? 'text-green-700' : 'text-gray-500'
                                            }`}
                                    >
                                        {approval.status === 'approved' ? 'Approved' : 'Pending'}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Approve Button */}
                        {canApprove && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <button
                                    onClick={handleApprove}
                                    className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Approve Contract
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Stats */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Users size={16} className="text-gray-400" />
                            <h3 className="text-sm font-medium text-gray-900">Statistics</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Total Approvers</span>
                                <span className="text-sm font-medium text-gray-900">{approvals.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Approved</span>
                                <span className="text-sm font-medium text-green-700">{approvedCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Pending</span>
                                <span className="text-sm font-medium text-yellow-700">
                                    {approvals.length - approvedCount}
                                </span>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                <span className="text-sm text-gray-600">Transactions</span>
                                <span className="text-sm font-medium text-gray-900">{blockchainLogs.length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Blockchain Activity Log */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Activity size={16} className="text-gray-400" />
                            <h3 className="text-sm font-medium text-gray-900">
                                {contract.mode === 'onchain' ? 'Blockchain Activity' : 'Activity Log'}
                            </h3>
                        </div>
                        <div className="space-y-3">
                            {blockchainLogs.map((log, index) => (
                                <div key={index} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-gray-900 capitalize">{log.action}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {log.timestamp.toLocaleString()}
                                            </p>
                                            {contract.mode === 'onchain' && (
                                                <p className="text-xs text-gray-400 mt-1 font-mono truncate">
                                                    {log.txHash}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {blockchainLogs.length === 0 && (
                                <p className="text-xs text-gray-500">No activity yet</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
