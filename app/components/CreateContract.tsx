import { useState } from 'react';
import { Plus, X, FileText, Search } from 'lucide-react';
import type { ContractMode, Contract, Approval } from '../types';

interface CreateContractProps {
    mode: ContractMode;
    users: { id: string; fullName: string; email: string }[];
    onSubmit: (
        contract: Omit<Contract, 'id' | 'createdAt' | 'status' | 'updatedAt'>,
        approvers: { userId: string }[],
        file: File | null
    ) => void;
    onCancel: () => void;
}

export function CreateContract({ mode, users, onSubmit, onCancel }: CreateContractProps) {
    const availableUsers = users.map(u => ({ id: u.id, name: u.fullName }));
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [threshold, setThreshold] = useState(3);
    const [selectedApprovers, setSelectedApprovers] = useState<string[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleAddApprover = (userId: string) => {
        if (selectedApprovers.length < 5 && !selectedApprovers.includes(userId)) {
            setSelectedApprovers([...selectedApprovers, userId]);
            // Threshold should stay at 3 minimum, but adjust down if it exceeds available approvers
            if (threshold > selectedApprovers.length + 1) {
                setThreshold(Math.max(3, selectedApprovers.length + 1));
            }
        }
    };

    const handleRemoveApprover = (userId: string) => {
        const updated = selectedApprovers.filter(id => id !== userId);
        setSelectedApprovers(updated);
        // Adjust threshold if needed
        if (threshold > updated.length) {
            setThreshold(Math.max(3, updated.length));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !description.trim()) {
            alert('Please fill in all fields');
            return;
        }

        if (selectedApprovers.length < 3) {
            alert('Please select at least 3 approvers');
            return;
        }

        const contract: Omit<Contract, 'id' | 'createdAt' | 'status' | 'updatedAt'> = {
            title,
            description,
            contractMode: mode,
            threshold,
        };

        const approvers = selectedApprovers.map(userId => ({
            userId,
        }));

        // Pass the file separately to handle upload
        onSubmit(contract, approvers, file);
    };

    const availableToAdd = availableUsers
        .filter(u => !selectedApprovers.includes(u.id))
        .filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const maxThreshold = Math.min(5, selectedApprovers.length);
    const minThreshold = 3; // Always minimum 3

    return (
        <div className="max-w-3xl">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Create New Contract</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {mode === 'onchain' ? 'On Chain Mode' : 'Off Chain Mode'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Contract Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contract Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter contract title"
                        />
                    </div>

                    {/* Contract Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contract Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter contract description"
                        />
                    </div>

                    {/* Approval Threshold */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Approval Threshold (minimum 3, maximum 5)
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min={minThreshold}
                                max={maxThreshold}
                                value={threshold}
                                onChange={(e) => setThreshold(Number(e.target.value))}
                                className="flex-1"
                                disabled={selectedApprovers.length < 3}
                            />
                            <span className="text-lg font-semibold text-gray-900 w-12 text-center">
                                {threshold}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Contract will be approved when {threshold} out of {selectedApprovers.length || 0} approvers confirm
                        </p>
                    </div>

                    {/* Document Upload */}
                    <div className="bg-blue-50/50 p-6 rounded-lg border-2 border-dashed border-blue-100">
                        <label className="block text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                            <Plus size={18} />
                            Contract Document (PDF/Image)
                        </label>
                        <div className="flex flex-col items-center">
                            <input
                                type="file"
                                id="file-upload"
                                onChange={handleFileChange}
                                className="hidden"
                                accept=".pdf,image/*"
                            />
                            <label
                                htmlFor="file-upload"
                                className="w-full flex flex-col items-center justify-center cursor-pointer py-4 hover:bg-blue-100/50 transition-colors rounded-lg"
                            >
                                {file ? (
                                    <div className="flex items-center gap-2 text-blue-700 font-medium">
                                        <FileText size={20} />
                                        <span>{file.name}</span>
                                        <X
                                            size={16}
                                            className="ml-2 hover:text-red-500"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setFile(null);
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <p className="text-sm text-blue-600 font-medium">Click to upload or drag and drop</p>
                                        <p className="text-xs text-blue-400 mt-1">PDF, PNG, JPG (max. 10MB)</p>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Selected Approvers */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Selected Approvers ({selectedApprovers.length}/5)
                        </label>
                        {selectedApprovers.length > 0 ? (
                            <div className="space-y-2 mb-3">
                                {selectedApprovers.map(userId => {
                                    const user = availableUsers.find(u => u.id === userId);
                                    return (
                                        <div
                                            key={userId}
                                            className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md border border-gray-200"
                                        >
                                            <span className="text-sm text-gray-900">{user?.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveApprover(userId)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 mb-3">No approvers selected yet</p>
                        )}

                        {selectedApprovers.length < 5 && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-medium text-gray-600">Available Users:</p>
                                    <span className="text-xs text-gray-500">
                                        {availableToAdd.length} {availableToAdd.length === 1 ? 'user' : 'users'}
                                    </span>
                                </div>

                                {/* Search Input */}
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Users List */}
                                {availableToAdd.length > 0 ? (
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {availableToAdd.map(user => (
                                            <button
                                                key={user.id}
                                                type="button"
                                                onClick={() => handleAddApprover(user.id)}
                                                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors w-full text-left"
                                            >
                                                <Plus size={16} className="text-gray-400" />
                                                <span className="text-sm text-gray-700">{user.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 text-center py-4">
                                        {searchQuery ? 'No users match your search' : 'All users have been added'}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={selectedApprovers.length < 3 || !title.trim() || !description.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            Create Contract
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
