/**
 * Permission Definitions
 * 
 * Central registry of all user permissions.
 * Used by both server middleware and shared with client.
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
        description: 'Grants read-only access to cases in the system. Users can browse the case list, open case details, view the activity timeline, and read comments. This does NOT allow any modification.',
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
        description: 'Allows users to create new cases, tasks, or issues by providing a title and description. Users are reporting issues, not managing workflow — they cannot assign cases to other users or set system-level properties like priority.',
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
        systemEffect: 'New cases appear in the system for admins and authorized users to triage. Cases created by regular users start as Open with default priority.'
    },
    {
        key: PERMISSION_KEYS.COMMENT_ON_CASES,
        label: 'Comment on Cases',
        description: 'Enables collaboration and discussion within tasks. Users can participate in conversations on cases by adding, editing, and deleting their own comments. They cannot modify comments made by other users.',
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
        description: 'If a user created a case, they can edit its title and description. Ownership rules apply — users can only modify cases they personally created. They cannot edit cases created by others, nor can they change priority or assignment.',
        canDo: [
            'Edit the title of cases they created',
            'Edit the description of cases they created'
        ],
        cannotDo: [
            'Edit cases created by other users',
            'Modify priority, status, or assignment',
            'Delete cases'
        ],
        systemEffect: 'Case creators can refine their submissions. Changes are tracked in the activity timeline. Only title and description are editable.'
    },
    {
        key: PERMISSION_KEYS.ASSIGN_TO_SELF,
        label: 'Assign to Self (Take Task)',
        description: 'Allows users to volunteer or take responsibility for work. Users can assign an unassigned case to themselves using a "Take Task" action. They cannot assign tasks to other users or reassign already-assigned cases.',
        canDo: [
            'Assign an unassigned case to themselves',
            'Take responsibility for unassigned work'
        ],
        cannotDo: [
            'Assign tasks to other users',
            'Reassign cases already assigned to someone',
            'Unassign themselves from a case'
        ],
        systemEffect: 'Cases move from unassigned to assigned status. The assignment is logged in the activity timeline. This enables self-service task distribution.'
    },
    {
        key: PERMISSION_KEYS.WATCH_CASE,
        label: 'Watch / Follow a Case',
        description: 'Users can follow a case to mark interest and track updates. This only subscribes the user to updates — they are not responsible for the task unless separately assigned. Watching does not grant any editing capabilities.',
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
        systemEffect: 'The user is added to the case\'s watcher list. This is purely informational and does not affect case ownership or assignment.'
    },
    {
        key: PERMISSION_KEYS.PROFILE_MANAGEMENT,
        label: 'Profile Management',
        description: 'Allows users to update their own personal account settings including display name, avatar, and preferences. This only affects the individual user\'s profile — they cannot modify other users\' profiles or change roles and permissions.',
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
        systemEffect: 'Only the user\'s own profile data is affected. Name changes are reflected across existing cases and comments upon next load.'
    }
];

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

/**
 * Validates that a permissions object only contains known keys
 */
export const validatePermissionKeys = (permissions) => {
    const validKeys = PERMISSIONS.map(p => p.key);
    const invalidKeys = Object.keys(permissions).filter(k => !validKeys.includes(k));
    return {
        valid: invalidKeys.length === 0,
        invalidKeys
    };
};
