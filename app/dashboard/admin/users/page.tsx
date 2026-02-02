"use client";

import { useEffect, useState } from 'react';
import { User } from '@/app/types';
import { Sidebar } from '@/app/components/Sidebar';
import { useWeb3 } from '@/app/hooks/useWeb3';

export default function AdminUsersPage() {
    const { address, loading: walletLoading, error: walletError, connectWallet } = useWeb3();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Sidebar state mocks
    const [currentMode, setCurrentMode] = useState<any>('onchain');
    const [currentView, setCurrentView] = useState<any>('list');

    useEffect(() => {
        async function fetchUsers() {
            try {
                const res = await fetch('/api/admin/users');
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data);
                } else {
                    console.error('Failed to fetch users');
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
    const [isSaving, setIsSaving] = useState(false);

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setNewRole(user.role || 'user');
    };

    const handleSaveRole = async () => {
        if (!editingUser) return;
        setIsSaving(true);
        try {
            const { updateUserRole } = await import('@/app/actions/user-actions');
            const result = await updateUserRole(editingUser.id, newRole);

            if (result.success) {
                // Update local state
                setUsers(users.map(u => u.id === editingUser.id ? { ...u, role: newRole } : u));
                setEditingUser(null);
            } else {
                alert('Failed to update role');
            }
        } catch (error) {
            console.error('Error updating role:', error);
            alert('Error updating role');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar
                currentMode={currentMode}
                currentView={currentView}
                onModeChange={setCurrentMode}
                onViewChange={() => window.location.href = '/dashboard'} // Go back to dashboard on view change
                wallet={{
                    address,
                    loading: walletLoading,
                    error: walletError,
                    connect: connectWallet
                }}
            />

            <div className="flex-1 flex flex-col overflow-hidden relative">
                <div className="p-8 max-w-7xl mx-auto w-full overflow-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                            <p className="text-sm text-gray-500 mt-1">Manage platform users and their roles</p>
                        </div>
                        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
                            Total Users: {users.length}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-200">
                            <input
                                type="text"
                                placeholder="Search users..."
                                className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3">User</th>
                                        <th className="px-6 py-3">Role</th>
                                        <th className="px-6 py-3">Wallet Address</th>
                                        <th className="px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                                Loading users...
                                            </td>
                                        </tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                                No users found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="font-medium text-gray-900">{user.fullName}</div>
                                                        <div className="text-gray-500 text-xs">{user.email}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                        ${user.role === 'admin'
                                                            ? 'bg-purple-100 text-purple-800'
                                                            : 'bg-green-100 text-green-800'}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                                    {user.walletAddress || 'Not connected'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                                                    >
                                                        Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Edit Role Modal */}
                {editingUser && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-full m-4">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Edit User Role</h3>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                                <p className="text-sm text-gray-900">{editingUser.fullName} ({editingUser.email})</p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value as 'admin' | 'user')}
                                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setEditingUser(null)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveRole}
                                    disabled={isSaving}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-blue-400 cursor-pointer flex items-center gap-2"
                                >
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
