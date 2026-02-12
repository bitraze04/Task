/**
 * LoadingSkeleton Component
 * 
 * Shimmer loading placeholder for content.
 */

import clsx from 'clsx';

const LoadingSkeleton = ({
    variant = 'rect',
    width,
    height,
    className = '',
    count = 1
}) => {
    const baseStyles = 'skeleton rounded';

    const variants = {
        rect: 'rounded-lg',
        circle: 'rounded-full',
        text: 'rounded h-4',
        card: 'rounded-xl h-48'
    };

    const style = {
        width: width || (variant === 'text' ? '100%' : undefined),
        height: height || (variant === 'circle' ? width : undefined)
    };

    const items = Array.from({ length: count }, (_, i) => i);

    return (
        <>
            {items.map((i) => (
                <div
                    key={i}
                    className={clsx(baseStyles, variants[variant], className)}
                    style={style}
                />
            ))}
        </>
    );
};

// Pre-made skeleton layouts
export const CaseCardSkeleton = () => (
    <div className="glass-card p-5 space-y-4">
        <div className="flex items-start justify-between">
            <LoadingSkeleton variant="text" width="60%" height="24px" />
            <LoadingSkeleton variant="rect" width="80px" height="24px" />
        </div>
        <LoadingSkeleton variant="text" count={2} className="mb-2" />
        <div className="flex items-center gap-4">
            <LoadingSkeleton variant="rect" width="60px" height="20px" />
            <LoadingSkeleton variant="rect" width="80px" height="20px" />
        </div>
    </div>
);

export const TableRowSkeleton = () => (
    <tr className="border-b border-slate-200 dark:border-slate-700">
        {[...Array(5)].map((_, i) => (
            <td key={i} className="px-4 py-3">
                <LoadingSkeleton variant="text" height="20px" />
            </td>
        ))}
    </tr>
);

export default LoadingSkeleton;
