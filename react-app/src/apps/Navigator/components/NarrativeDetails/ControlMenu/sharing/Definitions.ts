export const PERM_MAPPING: { [key: string]: string } = {
  a: 'can view, edit, and share',
  w: 'can view and edit',
  r: 'can view',
  n: 'None',
};

export interface UserPerms {
  userId: string;
  userName: string;
  perm: string;
}
