export type ContractMode = 'onchain' | 'offchain';
export type ContractStatus = 'pending' | 'completed' | 'rejected';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface User {
    id: string;
    email: string;
    fullName: string;
    walletAddress?: string | null;
}

export interface Approval {
    id: string;
    contractId: string | null;
    userId: string | null;
    status: ApprovalStatus;
    approvedAt?: Date | null;
    user?: User | null;
}

export interface Contract {
    id: string;
    title: string;
    description?: string | null;
    contractMode: ContractMode;
    status: ContractStatus;
    threshold: number;
    createdAt: Date;
    updatedAt: Date;
    creatorId?: string | null;
    creator?: User | null;
    approvals?: Approval[];
    documents?: any[];
}

export interface BlockchainLog {
    txHash: string;
    contractId: string;
    userId: string;
    action: 'create' | 'approve' | 'finalize';
    timestamp: Date;
}
