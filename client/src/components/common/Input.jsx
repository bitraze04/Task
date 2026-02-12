/**
 * Input Component
 * 
 * Reusable form input with label and error state.
 */

import clsx from 'clsx';

const Input = ({
    label,
    type = 'text',
    name,
    value,
    onChange,
    placeholder,
    error,
    disabled = false,
    className = '',
    ...props
}) => {
    return (
        <div className={clsx('space-y-1', className)}>
            {label && (
                <label
                    htmlFor={name}
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                    {label}
                </label>
            )}
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={clsx(
                    'input-field',
                    error && 'border-red-500 focus:ring-red-500'
                )}
                {...props}
            />
            {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
        </div>
    );
};

export default Input;
