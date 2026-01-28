import Dashboard from '../Dashboard';
import { getContracts, getUsers } from '../actions/contract-actions';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from '@/lib/prisma';
import type { UserRole } from '../types';

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const currentUser = (session.user as any)?.id;

    const user = await prisma.user.findUnique({
        where: { id: currentUser },
        select: { role: true },
    });

    const userRole = (user?.role as UserRole) || 'user';


    const contracts = await getContracts();
    const users = await getUsers();

    return (
        <Dashboard
            initialContracts={contracts}
            currentUser={currentUser}
            users={users}
            userRole={userRole}
        />
    );
}
