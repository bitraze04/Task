/**
 * Permission Definitions (Client-side mirror)
 * 
 * Human-readable permission descriptions for the admin UI.
 */

export const PERMISSION_KEYS = {
    VIEW_CASES: 'view_cases',
    CREATE_CASE: 'create_case',
    COMMENT_ON_CASES: 'comment_on_cases',
    EDIT_OWN_CASES: 'edit_own_cases',
    ASSIGN_TO_SELF: 'assign_to_self',
    WATCH_CASE: 'watch_case',
    PROFILE_MANAGEMENT: 'profile_management'
};

export const PERMISSIONS = [
    {
        key: PERMISSION_KEYS.VIEW_CASES,
        label: 'View Cases',
        icon: '👁️',
        description: 'Grants read-only access to cases in the system. Users can browse the case list, open case details, view the activity timeline, and read comments.',
        canDo: [
            'View all cases in the system',
            'Open case detail pages',
            'See the activity timeline on each case',
            'Read comments on cases'
        ],
        cannotDo: [
            'Access the admin panel',
            'See restricted administrative data',
            'Modify any case information'
        ],
        systemEffect: 'Users gain visibility into the case workflow. No data is modified. This is a prerequisite for most other permissions to be useful.'
    },
    {
        key: PERMISSION_KEYS.CREATE_CASE,
        label: 'Create Case',
        icon: '➕',
        description: 'Allows users to create new cases by providing a title and description. Users are reporting issues, not managing workflow.',
        canDo: [
            'Create new cases/tasks/issues',
            'Provide a title and description',
            'Submit issues to the system'
        ],
        cannotDo: [
            'Assign the case to other users',
            'Set priority levels',
            'Set due dates or system-level properties'
        ],
        systemEffect: 'New cases appear in the system for admins to triage. Cases created by regular users start as Open with default priority.'
    },
    {
        key: PERMISSION_KEYS.COMMENT_ON_CASES,
        label: 'Comment on Cases',
        icon: '💬',
        description: 'Enables collaboration and discussion within tasks. Users can add, edit, and delete their own comments.',
        canDo: [
            'Add comments to any visible case',
            'Edit their own comments',
            'Delete their own comments'
        ],
        cannotDo: [
            'Modify or delete other users\' comments',
            'Post comments on admin-restricted cases'
        ],
        systemEffect: 'Enables team communication within case context. Comment activity is logged in the case timeline.'
    },
    {
        key: PERMISSION_KEYS.EDIT_OWN_CASES,
        label: 'Edit Own Cases',
        icon: '✏️',
        description: 'Users can edit the title and description of cases they created. Ownership rules apply.',
        canDo: [
            'Edit the title of cases they created',
            'Edit the description of cases they created'
        ],
        cannotDo: [
            'Edit cases created by other users',
            'Modify priority, status, or assignment',
            'Delete cases'
        ],
        systemEffect: 'Case creators can refine their submissions. Changes are tracked in the activity timeline.'
    },
    {
        key: PERMISSION_KEYS.ASSIGN_TO_SELF,
        label: 'Assign to Self (Take Task)',
        icon: '🙋',
        description: 'Allows users to volunteer for work by assigning unassigned cases to themselves.',
        canDo: [
            'Assign an unassigned case to themselves',
            'Take responsibility for unassigned work'
        ],
        cannotDo: [
            'Assign tasks to other users',
            'Reassign already-assigned cases',
            'Unassign themselves from a case'
        ],
        systemEffect: 'Cases move from unassigned to assigned. The assignment is logged in the activity timeline.'
    },
    {
        key: PERMISSION_KEYS.WATCH_CASE,
        label: 'Watch / Follow a Case',
        icon: '👀',
        description: 'Users can follow a case to track updates. This only subscribes — no editing capabilities are granted.',
        canDo: [
            'Follow any visible case',
            'Mark interest in a case',
            'Track updates on watched cases'
        ],
        cannotDo: [
            'Modify the case in any way',
            'Be automatically assigned to watched cases',
            'Receive responsibility for the task'
        ],
        systemEffect: 'The user is added to the case\'s watcher list. Purely informational, does not affect ownership.'
    },
    {
        key: PERMISSION_KEYS.PROFILE_MANAGEMENT,
        label: 'Profile Management',
        icon: '👤',
        description: 'Allows users to update their own personal account settings including display name and preferences.',
        canDo: [
            'Update their own display name',
            'Update their avatar',
            'Change personal preferences'
        ],
        cannotDo: [
            'Modify other users\' profiles',
            'Change roles or permissions',
            'Access administrative settings'
        ],
        systemEffect: 'Only the user\'s own profile data is affected. Name changes are reflected across the system.'
    }
];

/**
 * Get a permission definition by key
 */
export const getPermissionByKey = (key) => {
    return PERMISSIONS.find(p => p.key === key);
};

/**
 * Returns default permissions object with all values set to false
 */
export const getDefaultPermissions = () => {
    const defaults = {};
    PERMISSIONS.forEach(p => {
        defaults[p.key] = false;
    });
    return defaults;
};
