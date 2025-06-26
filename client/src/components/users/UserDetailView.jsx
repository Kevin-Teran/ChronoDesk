import React from 'react';

const UserDetailView = ({ user }) => {
  if (!user) return <p>Selecciona un usuario para ver los detalles</p>;

  return (
    <div>
      <h3>Detalles del Usuario</h3>
      <p><strong>Nombre:</strong> {user.firstName} {user.lastName}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Rol:</strong> {user.role}</p>
    </div>
  );
};

export default UserDetailView;