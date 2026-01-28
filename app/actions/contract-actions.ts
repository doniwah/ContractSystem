'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getContracts() {
    try {
        const contracts = await prisma.contract.findMany({
            include: {
                creator: true,
                approvals: {
                    include: {
                        user: true,
                    },
                },
                documents: true,
                proofs: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return contracts;
    } catch (error) {
        console.error('Error fetching contracts:', error);
        return [];
    }
}

export async function createContract(data: {
    title: string;
    description: string;
    threshold: number;
    contractMode: string;
    creatorId: string;
    approverIds: string[];
}) {
    try {
        const contract = await prisma.$transaction(async (tx) => {
            const newContract = await tx.contract.create({
                data: {
                    title: data.title,
                    description: data.description,
                    contractMode: data.contractMode,
                    threshold: data.threshold,
                    creatorId: data.creatorId,
                },
            });

            await tx.approval.createMany({
                data: data.approverIds.map((userId) => ({
                    contractId: newContract.id,
                    userId: userId,
                    status: 'pending',
                })),
            });

            return newContract;
        });

        revalidatePath('/');
        return { success: true, contract };
    } catch (error) {
        console.error('Error creating contract:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return { success: false, error: 'Failed to create contract: ' + (error as any)?.message };
    }
}

export async function approveContract(
    contractId: string,
    userId: string,
    signature?: string,
    transactionHash?: string
) {
    try {
        await prisma.$transaction(async (tx) => {
            // 1. Update approval
            await tx.approval.updateMany({
                where: {
                    contractId: contractId,
                    userId: userId,
                    status: 'pending',
                },
                data: {
                    status: 'approved',
                    approvedAt: new Date(),
                    signature: signature,
                    transactionHash: transactionHash,
                },
            });

            // 2. Check threshold
            const approvals = await tx.approval.findMany({
                where: { contractId: contractId },
            });

            const approvedCount = approvals.filter((a) => a.status === 'approved').length;
            const contract = await tx.contract.findUnique({
                where: { id: contractId },
            });

            if (contract && approvedCount >= contract.threshold) {
                await tx.contract.update({
                    where: { id: contractId },
                    data: { status: 'completed' },
                });
            }

            // 3. If on-chain, record to BlockchainProof
            if (transactionHash) {
                await tx.blockchainProof.create({
                    data: {
                        contractId: contractId,
                        transactionHash: transactionHash,
                        networkName: 'Sepolia Testnet', // For demo
                    },
                });
            }
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error approving contract:', error);
        return { success: false, error: 'Failed to approve contract' };
    }
}

export async function getUsers() {
    try {
        return await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                walletAddress: true,
            },
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

// Get contracts that need verification by a specific user
export async function getContractsForVerification(userId: string) {
    try {
        const contracts = await prisma.contract.findMany({
            where: {
                approvals: {
                    some: {
                        userId: userId,
                        status: 'pending',
                    },
                },
            },
            include: {
                creator: true,
                approvals: {
                    include: {
                        user: true,
                    },
                },
                documents: true,
                proofs: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return contracts;
    } catch (error) {
        console.error('Error fetching contracts for verification:', error);
        return [];
    }
}

// Get verification history for a specific user
export async function getVerificationHistory(userId: string) {
    try {
        const contracts = await prisma.contract.findMany({
            where: {
                approvals: {
                    some: {
                        userId: userId,
                        status: {
                            in: ['approved', 'rejected'],
                        },
                    },
                },
            },
            include: {
                creator: true,
                approvals: {
                    include: {
                        user: true,
                    },
                },
                documents: true,
                proofs: true,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });
        return contracts;
    } catch (error) {
        console.error('Error fetching verification history:', error);
        return [];
    }
}
