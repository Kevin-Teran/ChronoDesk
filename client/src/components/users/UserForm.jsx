import React, { useState } from 'react';

const UserForm = ({ onSubmit, initialData = {} }) => {
  const [firstName, setFirstName] = useState(initialData.firstName || '');
  const [lastName, setLastName] = useState(initialData.lastName || '');
  const [email, setEmail] = useState(initialData.email || '');
  const [role, setRole] = useState(initialData.role || 'user');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ firstName, lastName, email, role });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Nombre" required />
      <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Apellido" required />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo" required type="email" />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="admin">Administrador</option>
        <option value="supervisor">Supervisor</option>
        <option value="user">Usuario</option>
      </select>
      <button type="submit">Guardar</button>
    </form>
  );
};

export default UserForm;