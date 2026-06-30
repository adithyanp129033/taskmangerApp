import { useState } from 'react';
import client from '../api/client';

export default function TaskItem({ task, onUpdated, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [error, setError] = useState('');

  const handleToggle = async () => {
    try {
      await client.patch(`/tasks/${task.id}/`, { completed: !task.completed });
      onUpdated();
    } catch {
      setError('Failed to update task.');
    }
  };

  const handleSave = async () => {
    if (!title.trim()) { setError('Title is required.'); return; }
    try {
      await client.patch(`/tasks/${task.id}/`, { title: title.trim(), description: description.trim() });
      setEditing(false);
      setError('');
      onUpdated();
    } catch {
      setError('Failed to save task.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await client.delete(`/tasks/${task.id}/`);
      onDeleted();
    } catch {
      setError('Failed to delete task.');
    }
  };

  return (
    <div className={`task-item ${task.completed ? 'task-completed' : ''}`}>
      {editing ? (
        <div className="task-edit-form">
          <input
            className="task-edit-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
          />
          <textarea
            className="task-edit-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
          />
          {error && <p className="error-text">{error}</p>}
          <div className="task-actions">
            <button className="btn btn-green" onClick={handleSave}>Save</button>
            <button className="btn btn-outline" onClick={() => { setEditing(false); setError(''); }}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="task-content">
          <div className="task-info">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={handleToggle}
              className="task-checkbox"
            />
            <div className="task-text">
              <p className={`task-title ${task.completed ? 'strikethrough' : ''}`}>{task.title}</p>
              {task.description && (
                <p className="task-description">{task.description}</p>
              )}
            </div>
          </div>
          {error && <p className="error-text">{error}</p>}
          <div className="task-actions">
            <button className="btn btn-outline" onClick={() => setEditing(true)}>Edit</button>
            <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}
