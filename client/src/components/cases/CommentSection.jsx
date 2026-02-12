/**
 * CommentSection Component
 * 
 * Displays comments for a case and allows adding new ones.
 * Users with comment_on_cases permission can add, edit, and delete their own comments.
 */

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addComment, fetchComments } from '../../features/cases/caseSlice';
import { useAuth } from '../../hooks/useAuth';
import usePermissions from '../../hooks/usePermissions';
import { PERMISSION_KEYS } from '../../utils/permissions';
import { useToast } from '../../hooks/useToast';
import api from '../../services/api';
import Button from '../common/Button';
import { formatDate, getInitials } from '../../utils/formatters';
import {
    ChatBubbleLeftRightIcon,
    PencilIcon,
    TrashIcon,
    CheckIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const CommentSection = ({ caseId, comments = [], isLoading }) => {
    const dispatch = useDispatch();
    const toast = useToast();
    const { user, isAdmin } = useAuth();
    const { hasPermission } = usePermissions();
    const canComment = hasPermission(PERMISSION_KEYS.COMMENT_ON_CASES);

    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editMessage, setEditMessage] = useState('');
    const [deletingId, setDeletingId] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsSubmitting(true);
        try {
            await dispatch(addComment({ caseId, message: message.trim() })).unwrap();
            setMessage('');
            toast.success('Comment added');
        } catch (error) {
            toast.error(error || 'Failed to add comment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (comment) => {
        setEditingId(comment.id);
        setEditMessage(comment.message);
    };

    const handleEditSave = async (commentId) => {
        if (!editMessage.trim()) return;
        try {
            await api.patch(`/cases/${caseId}/comments/${commentId}`, {
                message: editMessage.trim()
            });
            toast.success('Comment updated');
            setEditingId(null);
            dispatch(fetchComments(caseId));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to edit comment');
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm('Delete this comment?')) return;
        setDeletingId(commentId);
        try {
            await api.delete(`/cases/${caseId}/comments/${commentId}`);
            toast.success('Comment deleted');
            dispatch(fetchComments(caseId));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete comment');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                Comments
                {comments.length > 0 && (
                    <span className="text-sm font-normal text-slate-400">({comments.length})</span>
                )}
            </h3>

            {/* Comment list */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2].map(i => (
                        <div key={i} className="flex gap-3">
                            <div className="w-8 h-8 skeleton rounded-full" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 skeleton rounded w-1/3" />
                                <div className="h-3 skeleton rounded w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : comments.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">
                    No comments yet
                </p>
            ) : (
                <div className="space-y-4 mb-6">
                    {comments.map(comment => {
                        const isOwn = comment.authorId === user?.uid;
                        const isEditing = editingId === comment.id;

                        return (
                            <div
                                key={comment.id}
                                className={`flex gap-3 group animate-fade-in-up ${deletingId === comment.id ? 'opacity-30 scale-[0.98] transition-all duration-200' : ''}`}
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                                    {getInitials(comment.authorName)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                                            {comment.authorName}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            {formatDate(comment.createdAt)}
                                        </span>
                                        {comment.editedAt && (
                                            <span className="text-xs text-slate-400 italic">(edited)</span>
                                        )}
                                    </div>

                                    {isEditing ? (
                                        <div className="space-y-2">
                                            <textarea
                                                value={editMessage}
                                                onChange={(e) => setEditMessage(e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                rows={2}
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditSave(comment.id)}
                                                    className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                                                    title="Save"
                                                >
                                                    <CheckIcon className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                                    title="Cancel"
                                                >
                                                    <XMarkIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                                                {comment.message}
                                            </p>
                                            {/* Edit/Delete for own comments */}
                                            {(isOwn && canComment) && (
                                                <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEdit(comment)}
                                                        className="p-1 rounded text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <PencilIcon className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(comment.id)}
                                                        disabled={deletingId === comment.id}
                                                        className="p-1 rounded text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <TrashIcon className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                            {/* Admin can delete any comment */}
                                            {(isAdmin && !isOwn) && (
                                                <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleDelete(comment.id)}
                                                        disabled={deletingId === comment.id}
                                                        className="p-1 rounded text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <TrashIcon className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add comment form */}
            {canComment && (
                <form onSubmit={handleSubmit} className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                        {getInitials(user?.name)}
                    </div>
                    <div className="flex-1">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Add a comment..."
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                            rows={2}
                        />
                        <div className="flex justify-end mt-2">
                            <Button
                                type="submit"
                                variant="primary"
                                size="sm"
                                disabled={!message.trim()}
                                isLoading={isSubmitting}
                            >
                                Add Comment
                            </Button>
                        </div>
                    </div>
                </form>
            )}

            {/* No permission message */}
            {!canComment && !isAdmin && (
                <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-3 border-t border-slate-200 dark:border-slate-700">
                    You don't have permission to comment on cases
                </p>
            )}
        </div>
    );
};

export default CommentSection;
