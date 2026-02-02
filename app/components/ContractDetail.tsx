import { useState } from 'react';
import { ArrowLeft, CheckCircle, Clock, Users, Target, Activity, FileText, Loader2 } from 'lucide-react';
import { format } from "date-fns";
import { JsonRpcSigner } from 'ethers';
import type { Contract, Approval, BlockchainLog } from '../types';
import { getDocumentUrl } from '@/app/actions/storage-actions';

interface ContractDetailProps {
    contract: Contract;
    currentUser: string;
    onApprove: (contractId: string, userId: string, signature?: string, transactionHash?: string) => void;
    onBack: () => void;
    walletAddress: string | null;
    signer: JsonRpcSigner | null;
}

export function ContractDetail({
    contract,
    currentUser,
    onApprove,
    onBack,
    walletAddress,
    signer,
}: ContractDetailProps) {
    const approvals = contract.approvals || [];
    const blockchainLogs = contract.proofs?.map((p: any) => ({
        action: 'On-Chain Approval',
        timestamp: new Date(p.provenAt),
        txHash: p.transactionHash
    })) || [];
    const approvedCount = approvals.filter((a: Approval) => a.status === 'approved').length;
    const currentUserApproval = approvals.find((a: Approval) => a.userId === currentUser);
    const canApprove = currentUserApproval && currentUserApproval.status === 'pending' && contract.status === 'pending';

    const [isSigning, setIsSigning] = useState(false);

    const handleApprove = async () => {
        if (!canApprove) return;

        if (contract.contractMode === 'onchain') {
            if (!signer || !walletAddress) {
                alert("Please connect your wallet first for On-Chain approval");
                return;
            }

            setIsSigning(true);
            try {
                // Check for Fee Payment
                let feeTxHash = null;
                if (contract.fee && parseFloat(contract.fee) > 0) {
                    try {
                        const { Contract, parseEther } = await import('ethers');
                        const { FEE_MANAGER_ADDRESS, FEE_MANAGER_ABI } = await import('../constants/contracts');

                        // Check if already paid? For now, we enforce payment on action.
                        // Ideally we check `hasPaidFee` but let's assume if they click approve they want to pay/approve.

                        const feeManager = new Contract(FEE_MANAGER_ADDRESS, FEE_MANAGER_ABI, signer);
                        const feeWei = parseEther(contract.fee);

                        console.log(`Paying fee of ${contract.fee} ETH...`);
                        const tx = await feeManager.payFee(contract.id, { value: feeWei });
                        console.log("Fee payment sent:", tx.hash);
                        await tx.wait();
                        console.log("Fee payment confirmed");
                        feeTxHash = tx.hash;
                    } catch (feeErr: any) {
                        console.error("Fee payment failed:", feeErr);
                        if (feeErr.action === "estimateGas") {
                            throw new Error("Fee payment failed. Ensure you have enough ETH.");
                        }
                        throw new Error("Fee payment failed: " + (feeErr.reason || feeErr.message));
                    }
                }

                // In a real app, you would call a smart contract method here
                // For this demo, we'll sign the document hash or a message
                const message = `Approving Contract: ${contract.title}\nID: ${contract.id}\nHash: ${contract.documents?.[0]?.fileHash || 'N/A'}`;
                const signature = await signer.signMessage(message);

                console.log("On-chain signature successful:", signature);

                // Use the real fee tx hash if available, otherwise mock
                const txHash = feeTxHash || "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

                // Proceed with database update
                onApprove(contract.id, currentUser, signature, txHash);
                alert("On-chain approval recorded successfully!" + (feeTxHash ? " Fee Paid." : ""));
            } catch (err: any) {
                console.error("Blockchain signing failed:", err);
                alert("Signing/Payment failed: " + (err.reason || err.message));
            } finally {
                setIsSigning(false);
            }
        } else {
            // Off-chain mode: Simple database update
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
                    {contract.status === 'completed' ? (
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
                                        {contract.contractMode === 'onchain' ? 'On Chain' : 'Off Chain'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Created</label>
                                    <p className="mt-1 text-sm text-gray-900">{format(contract.createdAt, "PPP")}</p>
                                </div>
                            </div>
                            {contract.fee && (
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Required Fee</label>
                                    <p className="mt-1 text-sm font-medium text-blue-700">{contract.fee} ETH</p>
                                </div>
                            )}
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
                                    className={`h-3 rounded-full transition-all ${contract.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                                        }`}
                                    style={{ width: `${Math.min((approvedCount / contract.threshold) * 100, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Approver List */}
                        <div className="space-y-2">
                            {approvals.map((approval: Approval) => (
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
                                            <p className="text-sm font-medium text-gray-900">{approval.user?.fullName}</p>
                                            {approval.approvedAt && (
                                                <p className="text-xs text-gray-500">
                                                    Approved on {format(new Date(approval.approvedAt), "PPP")}
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
                                    disabled={isSigning}
                                    className={`w-full px-4 py-2.5 rounded-md text-white transition-colors font-medium flex items-center justify-center gap-2 ${contract.contractMode === 'onchain'
                                        ? 'bg-indigo-600 hover:bg-indigo-700'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                        } disabled:bg-gray-400`}
                                >
                                    {isSigning ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Signing on Blockchain...
                                        </>
                                    ) : (
                                        contract.contractMode === 'onchain' ? 'Sign & Approve (On-Chain)' : 'Approve Contract'
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Attached Documents */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText size={16} className="text-gray-400" />
                            <h3 className="text-sm font-medium text-gray-900">Attached Documents</h3>
                        </div>
                        <div className="space-y-3">
                            {contract.documents && contract.documents.length > 0 ? (
                                contract.documents.map((doc: any) => (
                                    <div key={doc.id} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <FileText size={14} className="text-blue-500 shrink-0" />
                                            <span className="text-sm text-gray-700 truncate">{doc.fileName}</span>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                const result = await getDocumentUrl(doc.storagePath);
                                                if (result.success && result.url) {
                                                    window.open(result.url, '_blank');
                                                } else {
                                                    alert('Failed to get download URL');
                                                }
                                            }}
                                            className="text-xs text-blue-600 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            View
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-gray-500">No documents attached</p>
                            )}
                        </div>
                    </div>

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
                                {contract.contractMode === 'onchain' ? 'Blockchain Activity' : 'Activity Log'}
                            </h3>
                        </div>
                        <div className="space-y-3">
                            {blockchainLogs.map((log: any, index: number) => (
                                <div key={index} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-gray-900 capitalize">{log.action}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {format(log.timestamp, "PP pp")}
                                            </p>
                                            {contract.contractMode === 'onchain' && (
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
