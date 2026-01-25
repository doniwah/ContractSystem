import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { ContractMode, Contract, Approval } from '../page';

interface CreateContractProps {
    mode: ContractMode;
    onSubmit: (
        contract: Omit<Contract, 'id' | 'createdAt' | 'status'>,
        approvers: Omit<Approval, 'contractId' | 'status' | 'timestamp'>[]
    ) => void;
    onCancel: () => void;
}

const availableUsers = [
    { id: 'user-1', name: 'Alice Johnson' },
    { id: 'user-2', name: 'Bob Smith' },
    { id: 'user-3', name: 'Charlie Davis' },
    { id: 'user-4', name: 'Diana Martinez' },
    { id: 'user-5', name: 'Eve Wilson' },
];

export function CreateContract({ mode, onSubmit, onCancel }: CreateContractProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [threshold, setThreshold] = useState(3);
    const [selectedApprovers, setSelectedApprovers] = useState<string[]>([]);

    const handleAddApprover = (userId: string) => {
        if (selectedApprovers.length < 5 && !selectedApprovers.includes(userId)) {
            setSelectedApprovers([...selectedApprovers, userId]);
            // Adjust threshold if needed
            if (threshold > selectedApprovers.length + 1) {
                setThreshold(selectedApprovers.length + 1);
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

        const contract: Omit<Contract, 'id' | 'createdAt' | 'status'> = {
            title,
            description,
            mode,
            threshold,
        };

        const approvers = selectedApprovers.map(userId => ({
            userId,
            userName: availableUsers.find(u => u.id === userId)?.name || '',
        }));

        onSubmit(contract, approvers);
    };

    const availableToAdd = availableUsers.filter(u => !selectedApprovers.includes(u.id));
    const maxThreshold = Math.min(5, selectedApprovers.length);
    const minThreshold = 3;

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

                        {selectedApprovers.length < 5 && availableToAdd.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-gray-600 mb-2">Available Users:</p>
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
