"use client";

import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { CreateContract as CreateContractForm } from './components/CreateContract';
import { ContractList } from './components/ContractList';
import { ContractDetail } from './components/ContractDetail';
import { getContracts, createContract, approveContract } from '@/app/actions/contract-actions';
import { uploadDocument } from '@/app/actions/storage-actions';
import { useWeb3 } from './hooks/useWeb3';

export type ContractMode = 'onchain' | 'offchain';

export default function Dashboard({
    initialContracts,
    currentUser,
    users
}: {
    initialContracts: any[],
    currentUser: string,
    users: any[]
}) {
    const { address, signer, loading: walletLoading, error: walletError, connectWallet } = useWeb3();
    const [currentMode, setCurrentMode] = useState<ContractMode>('onchain');
    const [currentView, setCurrentView] = useState<'list' | 'create' | 'detail'>('list');
    const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
    const [contracts, setContracts] = useState(initialContracts);

    // Refresh data when the view changes to list
    useEffect(() => {
        if (currentView === 'list') {
            getContracts().then(setContracts);
        }
    }, [currentView]);

    const handleCreateContract = async (
        contractData: any,
        approvers: { userId: string }[],
        file: File | null
    ) => {
        const result = await createContract({
            ...contractData,
            contractMode: currentMode,
            creatorId: currentUser,
            approverIds: approvers.map(a => a.userId),
        });

        if (result.success && result.contract) {
            // Upload file if present
            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                await uploadDocument(formData, result.contract.id, currentUser);
            }

            setCurrentView('list');
            const updated = await getContracts();
            setContracts(updated);
        } else {
            alert(result.error || 'Failed to create contract');
        }
    };

    const handleApprove = async (contractId: string, userId: string, signature?: string, transactionHash?: string) => {
        const result = await approveContract(contractId, userId, signature, transactionHash);
        if (result.success) {
            const updated = await getContracts();
            setContracts(updated);
        } else {
            alert('Failed to approve contract');
        }
    };

    const handleViewContract = (contractId: string) => {
        setSelectedContractId(contractId);
        setCurrentView('detail');
    };

    // Filter by mode (if your schema supports it, for now we just show all)
    // Note: The original simulated data had a 'mode' field, but the Prisma schema doesn't.
    // I'll filter based on a virtual check or just show all for now.
    const filteredContracts = contracts;

    // Find selected contract
    const selectedContract = contracts.find(c => c.id === selectedContractId);

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar
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
                        {currentMode === 'onchain' ? 'On Chain' : 'Off Chain'} - Digital Contract Approval System
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {currentMode === 'onchain'
                            ? 'All approvals happen directly on the blockchain with full decentralization'
                            : 'Approvals in database with blockchain activity logging for audit trail'
                        }
                    </p>
                </header>

                <main className="flex-1 overflow-auto p-8">
                    {currentView === 'create' && (
                        <CreateContractForm
                            mode={currentMode}
                            users={users}
                            onSubmit={handleCreateContract}
                            onCancel={() => setCurrentView('list')}
                        />
                    )}

                    {currentView === 'list' && (
                        <ContractList
                            contracts={filteredContracts}
                            onViewContract={handleViewContract}
                        />
                    )}

                    {currentView === 'detail' && selectedContract && (
                        <ContractDetail
                            contract={selectedContract}
                            currentUser={currentUser}
                            onApprove={handleApprove}
                            onBack={() => setCurrentView('list')}
                            walletAddress={address}
                            signer={signer}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}
