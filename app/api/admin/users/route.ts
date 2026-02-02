import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session || (session.user as any)?.role !== 'admin') {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                walletAddress: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error('[ADMIN_USERS_GET]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
