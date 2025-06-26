import React from 'react';
import UserItem from './UserItem';

const UserList = ({ users }) => {
  if (!users || users.length === 0) {
    return <p>No hay usuarios disponibles.</p>;
  }

  return (
    <ul>
      {users.map((user) => (
        <UserItem key={user.id} user={user} />
      ))}
    </ul>
  );
};

export default UserList;
