"use client";

import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { CreateContract as CreateContractForm } from './CreateContract';
import { ContractList } from './ContractList';
import { ContractDetail } from './ContractDetail';
import { getContracts, createContract, approveContract } from '@/app/actions/contract-actions';
import { uploadDocument } from '@/app/actions/storage-actions';
import { useWeb3 } from '../hooks/useWeb3';
import type { ContractMode } from '../types';

interface AdminDashboardProps {
    initialContracts: any[];
    currentUser: string;
    users: any[];
}

export function AdminDashboard({
    initialContracts,
    currentUser,
    users
}: AdminDashboardProps) {
    const { address, signer, loading: walletLoading, error: walletError, connectWallet } = useWeb3();
    const [currentMode, setCurrentMode] = useState<ContractMode>('onchain');
    const [currentView, setCurrentView] = useState<'list' | 'create' | 'detail'>('list');
    const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
    const [contracts, setContracts] = useState(initialContracts);

    // Save wallet to DB when connected
    useEffect(() => {
        if (address && currentUser) {
            import('@/app/actions/user-actions').then(({ updateUserWallet }) => {
                updateUserWallet(currentUser, address);
            });
        }
    }, [address, currentUser]);

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
        try {
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

                // If on-chain and fee is set, call Smart Contract
                if (currentMode === 'onchain' && contractData.fee && parseFloat(contractData.fee) > 0) {
                    if (!signer) {
                        alert("Contract created in DB, but Wallet not connected to set Fee. Please connect wallet.");
                    } else {
                        try {
                            const { Contract, parseEther } = await import('ethers');
                            const { FEE_MANAGER_ADDRESS, FEE_MANAGER_ABI } = await import('../constants/contracts');

                            const feeManager = new Contract(FEE_MANAGER_ADDRESS, FEE_MANAGER_ABI, signer);
                            const feeWei = parseEther(contractData.fee);

                            const tx = await feeManager.setFee(result.contract.id, feeWei);
                            console.log("Setting fee...", tx.hash);
                            await tx.wait();
                            alert("Contract created and Fee set on-chain successfully!");
                        } catch (err: any) {
                            console.error("Failed to set fee on-chain:", err);
                            alert("Contract created, BUT failed to set fee on-chain: " + (err.reason || err.message));
                        }
                    }
                } else {
                    if (result.success) alert("Contract created successfully!");
                }

                setCurrentView('list');
                const updated = await getContracts();
                setContracts(updated);
            } else {
                alert(result.error || 'Failed to create contract');
            }
        } catch (error) {
            console.error(error);
            alert("An unexpected error occurred");
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

    // Filter by mode
    const filteredContracts = contracts.filter(c => c.contractMode === currentMode);

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
