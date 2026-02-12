/**
 * CaseList Component
 * 
 * Displays a list of cases in a grid with staggered fade-in animation.
 */

import CaseCard from './CaseCard';
import { CaseCardSkeleton } from '../common/LoadingSkeleton';
import { FolderOpenIcon } from '@heroicons/react/24/outline';

const CaseList = ({ cases, isLoading }) => {
    return (
        <div>
            {/* Case grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <CaseCardSkeleton key={i} />
                    ))}
                </div>
            ) : cases.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {cases.map((caseItem, index) => (
                        <div
                            key={caseItem.id}
                            className="stagger-item"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <CaseCard caseItem={caseItem} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass-card p-12 text-center animate-fade-in">
                    <FolderOpenIcon className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                    <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                        No cases found
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        No cases have been created yet
                    </p>
                </div>
            )}
        </div>
    );
};

export default CaseList;
