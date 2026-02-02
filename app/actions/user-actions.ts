'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateUserWallet(userId: string, walletAddress: string) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { walletAddress },
        });
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Failed to update wallet:', error);
        return { success: false, error: 'Failed to update wallet address' };
    }
}

export async function updateUserRole(userId: string, role: 'admin' | 'user') {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role },
        });
        revalidatePath('/dashboard/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Failed to update user role:', error);
        return { success: false, error: 'Failed to update user role' };
    }
}
