export const ROLES = {
  ADMIN: 'administrador',
  EDITOR: 'supervisor',
  USER: 'usuario',
};
export const canEdit = (role) => role === ROLES.ADMIN || role === ROLES.EDITOR;