/**
 * Custom Hook: useToast
 * 
 * Provides toast notification functions.
 */

import { useDispatch } from 'react-redux';
import { addToast } from '../features/ui/uiSlice';

export const useToast = () => {
    const dispatch = useDispatch();

    const toast = {
        success: (message) => {
            dispatch(addToast({ type: 'success', message }));
        },
        error: (message) => {
            dispatch(addToast({ type: 'error', message }));
        },
        warning: (message) => {
            dispatch(addToast({ type: 'warning', message }));
        },
        info: (message) => {
            dispatch(addToast({ type: 'info', message }));
        }
    };

    return toast;
};

export default useToast;
