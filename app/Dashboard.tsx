"use client";

import { AdminDashboard } from './components/AdminDashboard';
import { UserDashboard } from './components/UserDashboard';
import type { UserRole } from './types';

export default function Dashboard({
    initialContracts,
    currentUser,
    users,
    userRole
}: {
    initialContracts: any[],
    currentUser: string,
    users: any[],
    userRole: UserRole
}) {
    // Route to appropriate dashboard based on role
    if (userRole === 'admin') {
        return (
            <AdminDashboard
                initialContracts={initialContracts}
                currentUser={currentUser}
                users={users}
            />
        );
    }

    // User role
    return (
        <UserDashboard
            currentUser={currentUser}
        />
    );
}
