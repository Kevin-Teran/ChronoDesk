import React from 'react';

const UserItem = ({ user, onClick }) => (
  <li onClick={() => onClick(user)}>
    <strong>{user.firstName} {user.lastName}</strong> - {user.role}
  </li>
);

export default UserItem;