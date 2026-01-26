import { Eye, CheckCircle, Clock } from 'lucide-react';
import { format } from "date-fns";
import type { Contract } from '../types';

interface ContractListProps {
    contracts: Contract[];
    onViewContract: (contractId: string) => void;
}

export function ContractList({ contracts, onViewContract }: ContractListProps) {
    const getApprovalProgress = (contract: Contract) => {
        const contractApprovals = contract.approvals || [];
        const approvedCount = contractApprovals.filter(a => a.status === 'approved').length;
        return { approvedCount, totalCount: contractApprovals.length, threshold: contract.threshold };
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Contract List</h2>
                <p className="text-sm text-gray-500 mt-1">
                    {contracts.length} {contracts.length === 1 ? 'contract' : 'contracts'} found
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contract
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Threshold
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Progress
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {contracts.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                                    No contracts found. Create your first contract to get started.
                                </td>
                            </tr>
                        ) : (
                            contracts.map((contract) => {
                                const { approvedCount, totalCount, threshold } = getApprovalProgress(contract);
                                return (
                                    <tr key={contract.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{contract.title}</div>
                                            <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                                                {contract.description}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {contract.status === 'completed' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <CheckCircle size={12} />
                                                    Approved
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    <Clock size={12} />
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {threshold} of {totalCount}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[120px]">
                                                    <div
                                                        className={`h-2 rounded-full ${contract.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                                                            }`}
                                                        style={{ width: `${(approvedCount / threshold) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-600">
                                                    {approvedCount}/{threshold}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {format(contract.createdAt, "PPP")}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => onViewContract(contract.id)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                                            >
                                                <Eye size={14} />
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
