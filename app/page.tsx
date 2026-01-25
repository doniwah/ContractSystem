"use client";

import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { CreateContract } from './components/CreateContract';
import { ContractList } from './components/ContractList';
import { ContractDetail } from './components/ContractDetail';

export type ContractMode = 'onchain' | 'offchain';
export type ContractStatus = 'pending' | 'approved';
export type ApprovalStatus = 'pending' | 'approved';

export interface Contract {
    id: string;
    title: string;
    description: string;
    mode: ContractMode;
    threshold: number;
    status: ContractStatus;
    createdAt: Date;
}

export interface Approval {
    contractId: string;
    userId: string;
    userName: string;
    status: ApprovalStatus;
    timestamp?: Date;
}

export interface BlockchainLog {
    txHash: string;
    contractId: string;
    userId: string;
    action: 'create' | 'approve' | 'finalize';
    timestamp: Date;
}

export default function Home() {
    const [currentMode, setCurrentMode] = useState<ContractMode>('onchain');
    const [currentView, setCurrentView] = useState<'list' | 'create' | 'detail'>('list');
    const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
    const [currentUser] = useState('user-1'); // Simulated current user

    const [contracts, setContracts] = useState<Contract[]>([
        {
            id: 'c1',
            title: 'Partnership Agreement Q1 2026',
            description: 'Strategic partnership contract for first quarter operations',
            mode: 'onchain',
            threshold: 3,
            status: 'pending',
            createdAt: new Date('2026-01-15'),
        },
        {
            id: 'c2',
            title: 'Vendor Service Contract',
            description: 'Annual service agreement with primary vendor',
            mode: 'offchain',
            threshold: 4,
            status: 'approved',
            createdAt: new Date('2026-01-10'),
        },
    ]);

    const [approvals, setApprovals] = useState<Approval[]>([
        { contractId: 'c1', userId: 'user-1', userName: 'Alice Johnson', status: 'approved', timestamp: new Date('2026-01-16') },
        { contractId: 'c1', userId: 'user-2', userName: 'Bob Smith', status: 'approved', timestamp: new Date('2026-01-17') },
        { contractId: 'c1', userId: 'user-3', userName: 'Charlie Davis', status: 'pending' },
        { contractId: 'c1', userId: 'user-4', userName: 'Diana Martinez', status: 'pending' },
        { contractId: 'c2', userId: 'user-1', userName: 'Alice Johnson', status: 'approved', timestamp: new Date('2026-01-11') },
        { contractId: 'c2', userId: 'user-2', userName: 'Bob Smith', status: 'approved', timestamp: new Date('2026-01-12') },
        { contractId: 'c2', userId: 'user-3', userName: 'Charlie Davis', status: 'approved', timestamp: new Date('2026-01-13') },
        { contractId: 'c2', userId: 'user-4', userName: 'Diana Martinez', status: 'approved', timestamp: new Date('2026-01-14') },
    ]);

    const [blockchainLogs, setBlockchainLogs] = useState<BlockchainLog[]>([
        { txHash: '0x1a2b3c...', contractId: 'c1', userId: 'admin', action: 'create', timestamp: new Date('2026-01-15') },
        { txHash: '0x4d5e6f...', contractId: 'c1', userId: 'user-1', action: 'approve', timestamp: new Date('2026-01-16') },
        { txHash: '0x7g8h9i...', contractId: 'c1', userId: 'user-2', action: 'approve', timestamp: new Date('2026-01-17') },
        { txHash: '0x2b3c4d...', contractId: 'c2', userId: 'admin', action: 'create', timestamp: new Date('2026-01-10') },
        { txHash: '0x5e6f7g...', contractId: 'c2', userId: 'user-1', action: 'approve', timestamp: new Date('2026-01-11') },
        { txHash: '0x8h9i0j...', contractId: 'c2', userId: 'user-2', action: 'approve', timestamp: new Date('2026-01-12') },
        { txHash: '0x1k2l3m...', contractId: 'c2', userId: 'user-3', action: 'approve', timestamp: new Date('2026-01-13') },
        { txHash: '0x4n5o6p...', contractId: 'c2', userId: 'user-4', action: 'approve', timestamp: new Date('2026-01-14') },
        { txHash: '0x7q8r9s...', contractId: 'c2', userId: 'admin', action: 'finalize', timestamp: new Date('2026-01-14') },
    ]);

    const handleCreateContract = (contract: Omit<Contract, 'id' | 'createdAt' | 'status'>, approvers: Omit<Approval, 'contractId' | 'status' | 'timestamp'>[]) => {
        const newContract: Contract = {
            ...contract,
            id: `c${Date.now()}`,
            status: 'pending',
            createdAt: new Date(),
        };

        const newApprovals: Approval[] = approvers.map(approver => ({
            contractId: newContract.id,
            userId: approver.userId,
            userName: approver.userName,
            status: 'pending',
        }));

        const txHash = `0x${Math.random().toString(16).substring(2, 10)}...`;
        const newLog: BlockchainLog = {
            txHash,
            contractId: newContract.id,
            userId: 'admin',
            action: 'create',
            timestamp: new Date(),
        };

        setContracts([...contracts, newContract]);
        setApprovals([...approvals, ...newApprovals]);
        setBlockchainLogs([...blockchainLogs, newLog]);
        setCurrentView('list');
    };

    const handleApprove = (contractId: string, userId: string) => {
        const contract = contracts.find(c => c.id === contractId);
        if (!contract) return;

        // Update approval
        const updatedApprovals = approvals.map(approval =>
            approval.contractId === contractId && approval.userId === userId
                ? { ...approval, status: 'approved' as ApprovalStatus, timestamp: new Date() }
                : approval
        );
        setApprovals(updatedApprovals);

        // Add blockchain log
        const txHash = `0x${Math.random().toString(16).substring(2, 10)}...`;
        const newLog: BlockchainLog = {
            txHash,
            contractId,
            userId,
            action: 'approve',
            timestamp: new Date(),
        };
        setBlockchainLogs([...blockchainLogs, newLog]);

        // Check if threshold is met
        const contractApprovals = updatedApprovals.filter(a => a.contractId === contractId);
        const approvedCount = contractApprovals.filter(a => a.status === 'approved').length;

        if (approvedCount >= contract.threshold && contract.status === 'pending') {
            // Finalize contract
            const updatedContracts = contracts.map(c =>
                c.id === contractId ? { ...c, status: 'approved' as ContractStatus } : c
            );
            setContracts(updatedContracts);

            // Add finalize log
            const finalizeTxHash = `0x${Math.random().toString(16).substring(2, 10)}...`;
            const finalizeLog: BlockchainLog = {
                txHash: finalizeTxHash,
                contractId,
                userId: 'system',
                action: 'finalize',
                timestamp: new Date(),
            };
            setBlockchainLogs([...blockchainLogs, newLog, finalizeLog]);
        }
    };

    const handleViewContract = (contractId: string) => {
        setSelectedContractId(contractId);
        setCurrentView('detail');
    };

    const filteredContracts = contracts.filter(c => c.mode === currentMode);

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar
                currentMode={currentMode}
                currentView={currentView}
                onModeChange={setCurrentMode}
                onViewChange={setCurrentView}
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
                        <CreateContract
                            mode={currentMode}
                            onSubmit={handleCreateContract}
                            onCancel={() => setCurrentView('list')}
                        />
                    )}

                    {currentView === 'list' && (
                        <ContractList
                            contracts={filteredContracts}
                            approvals={approvals}
                            onViewContract={handleViewContract}
                        />
                    )}

                    {currentView === 'detail' && selectedContractId && (
                        <ContractDetail
                            contract={contracts.find(c => c.id === selectedContractId)!}
                            approvals={approvals.filter(a => a.contractId === selectedContractId)}
                            blockchainLogs={blockchainLogs.filter(log => log.contractId === selectedContractId)}
                            currentUser={currentUser}
                            onApprove={handleApprove}
                            onBack={() => setCurrentView('list')}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}
