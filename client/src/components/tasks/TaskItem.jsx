import React from 'react';

const TaskItem = ({ task }) => (
  <li>
    <h3>{task.title}</h3>
    <p>{task.description}</p>
    {/* Agrega más detalles y acciones según sea necesario */}
  </li>
);

export default TaskItem;