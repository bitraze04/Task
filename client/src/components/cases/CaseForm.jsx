/**
 * CaseForm Component
 * 
 * Form for creating/editing cases in a modal.
 * Includes due date picker and user assignment.
 */

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createCase, updateCase } from '../../features/cases/caseSlice';
import { closeModal } from '../../features/ui/uiSlice';
import { fetchUsers } from '../../features/auth/authSlice';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../../utils/constants';

// Get allowed status options based on current status (workflow validation)
const getAllowedStatuses = (currentStatus) => {
    const transitions = {
        'Open': ['Open', 'In Progress'],
        'In Progress': ['In Progress', 'Closed'],
        'Closed': ['Closed'] // Cannot transition from Closed
    };
    return transitions[currentStatus] || ['Open'];
};

const CaseForm = () => {
    const dispatch = useDispatch();
    const toast = useToast();
    const { isAdmin } = useAuth();
    const { modal } = useSelector(state => state.ui);
    const { users } = useSelector(state => state.auth);
    const { isLoading } = useSelector(state => state.cases);

    const isEdit = modal.type === 'edit';
    const initialData = modal.data || {};

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'Open',
        assignedTo: ''
    });
    const [errors, setErrors] = useState({});

    // Load users for assignment dropdown (admin only)
    useEffect(() => {
        if (modal.isOpen && isAdmin && users.length === 0) {
            dispatch(fetchUsers());
        }
    }, [modal.isOpen, dispatch, users.length, isAdmin]);

    // Populate form when editing
    useEffect(() => {
        if (isEdit && initialData) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                priority: initialData.priority || 'Medium',
                status: initialData.status || 'Open',
                assignedTo: initialData.assignedTo || ''
            });
        }
    }, [isEdit, modal.data]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (formData.title.length < 3) {
            newErrors.title = 'Title must be at least 3 characters';
        }
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (formData.description.length < 10) {
            newErrors.description = 'Description must be at least 10 characters';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const submitData = { ...formData };

        try {
            if (isEdit) {
                await dispatch(updateCase({
                    id: initialData.id,
                    data: submitData
                })).unwrap();
                toast.success('Case updated successfully');
            } else {
                await dispatch(createCase(submitData)).unwrap();
                toast.success('Case created successfully');
            }
            dispatch(closeModal());
        } catch (error) {
            toast.error(error || 'Failed to save case');
        }
    };

    const handleClose = () => {
        setFormData({
            title: '',
            description: '',
            priority: 'Medium',
            status: 'Open',
            assignedTo: ''
        });
        setErrors({});
        dispatch(closeModal());
    };

    if (!modal.isOpen || (modal.type !== 'create' && modal.type !== 'edit')) {
        return null;
    }

    // Get allowed statuses based on current status
    const allowedStatuses = isEdit
        ? getAllowedStatuses(initialData.status)
        : ['Open'];

    return (
        <Modal
            isOpen={modal.isOpen}
            onClose={handleClose}
            title={isEdit ? 'Edit Case' : 'Create New Case'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter case title"
                    error={errors.title}
                />

                <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe the case in detail..."
                        rows={4}
                        className="input-field resize-none"
                    />
                    {errors.description && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                    )}
                </div>

                {/* Admin-only fields */}
                {isAdmin && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Priority
                            </label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="input-field"
                            >
                                {PRIORITY_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {isEdit && (
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="input-field"
                                >
                                    {STATUS_OPTIONS.filter(o => allowedStatuses.includes(o.value)).map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {initialData.status === 'Closed' && (
                                    <p className="text-xs text-amber-600 dark:text-amber-400">
                                        Closed cases cannot change status
                                    </p>
                                )}
                            </div>
                        )}



                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Assign To
                            </label>
                            <select
                                name="assignedTo"
                                value={formData.assignedTo}
                                onChange={handleChange}
                                className="input-field"
                            >
                                <option value="">Unassigned</option>
                                {users.map(user => (
                                    <option key={user.uid} value={user.uid}>
                                        {user.name} ({user.role})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* Non-admin info */}
                {!isAdmin && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                        💡 As a regular user, you can set the title and description. Priority and assignment are managed by admins.
                    </p>
                )}

                <div className="flex justify-end gap-3 pt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        isLoading={isLoading}
                    >
                        {isEdit ? 'Update Case' : 'Create Case'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CaseForm;
