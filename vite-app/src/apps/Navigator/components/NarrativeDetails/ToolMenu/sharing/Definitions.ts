import { UserPermission } from "lib/kb_lib/comm/coreServices/Workspace";

export const PERM_MAPPING: { [key: string]: string } = {
    a: 'can view, edit, and share',
    w: 'can view and edit',
    r: 'can view',
    n: 'None',
};

export interface UserPerms {
    userId: string;
    userName: string;
    perm: UserPermission;
}

// export type PermissionLevel = 'a' | 'w' | 'r' | 'n';
