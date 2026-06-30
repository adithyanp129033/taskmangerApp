import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import TaskItem from '../components/TaskItem';

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'false' },
  { label: 'Completed', value: 'true' },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Add task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = filter !== 'all' ? { completed: filter } : {};
      const { data } = await client.get('/tasks/', { params });
      setTasks(data);
    } catch {
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) { setAddError('Title is required.'); return; }
    setAdding(true);
    setAddError('');
    try {
      await client.post('/tasks/', { title: newTitle.trim(), description: newDesc.trim() });
      setNewTitle('');
      setNewDesc('');
      fetchTasks();
    } catch (err) {
      const data = err.response?.data;
      setAddError(data?.title?.[0] || 'Failed to add task.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="dashboard-header">
        <h1 className="dashboard-title">Task Manager</h1>
        <div className="header-right">
          <span className="header-user">Hello, {user?.username}</span>
          <button className="btn btn-outline" onClick={logout}>Logout</button>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Add Task Form */}
        <section className="section-card">
          <h2 className="section-title">Add New Task</h2>
          <form onSubmit={handleAddTask} className="add-task-form">
            <div className="add-task-row">
              <input
                id="new-task-title"
                type="text"
                className="form-input"
                placeholder="Task title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <button type="submit" className="btn btn-green" disabled={adding}>
                {adding ? 'Adding...' : 'Add Task'}
              </button>
            </div>
            <textarea
              id="new-task-desc"
              className="form-input"
              placeholder="Description (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={2}
            />
            {addError && <p className="error-text">{addError}</p>}
          </form>
        </section>

        {/* Task List */}
        <section className="section-card">
          {/* Filter Tabs */}
          <div className="filter-tabs">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                className={`filter-tab ${filter === f.value ? 'filter-tab-active' : ''}`}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Task List Body */}
          {loading && <p className="status-text">Loading tasks...</p>}
          {error && <div className="alert alert-error">{error}</div>}
          {!loading && !error && tasks.length === 0 && (
            <p className="status-text">No tasks found.</p>
          )}
          {!loading && tasks.length > 0 && (
            <div className="task-list">
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onUpdated={fetchTasks}
                  onDeleted={fetchTasks}
                />
              ))}
            </div>
          )}

          {/* Summary count */}
          {!loading && tasks.length > 0 && (
            <p className="task-count">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
          )}
        </section>
      </main>
    </div>
  );
}
