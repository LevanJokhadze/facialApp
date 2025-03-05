import React, { useState } from 'react';
import './Cards.scss';

export const Card = ({ message, user_name, room_number, timestamp, priority = 'medium' }) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleting2, setIsDeleting2] = useState(false);

  const handleComplete = () => {
    setIsCompleted(!isCompleted);
  };

  const handleDelete = () => {
    setIsDeleting(true);
    // Simulating delete animation
    setTimeout(() => {
      // Actual delete logic would be handled by parent component
      setIsDeleting2(true);
    }, 500);
  };

  return (
    <div
      className={`
        task-card 
        ${isCompleted ? 'task-card--completed' : ''} 
        task-card--${priority}
        ${isDeleting ? `task-card--deleting ${isDeleting2 ? `none` : ''}` : ''}
      `}
    >
      <div className="task-card__background"></div>
      <div className="task-card__content">
        <div className="task-card__header">
          <h3 className="task-card__title">{message}</h3>
          <div className="task-card__priority-badge">{priority}</div>
        </div>
        <div className="task-card__info">
          <p className="task-card__user-name">User: {user_name}</p>
          <p className="task-card__room-number">Room: {room_number}</p>
          <p className="task-card__timestamp">Time: {new Date(timestamp).toLocaleString()}</p>
        </div>
        <div className="task-card__actions">
          <button 
            className="task-card__complete-btn" 
            onClick={handleComplete}
          >
            {isCompleted ? 'Undo' : 'Complete'}
          </button>
          <button 
            className="task-card__delete-btn"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
