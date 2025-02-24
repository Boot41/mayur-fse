import React, { useState, useEffect } from 'react';
import { Card, Form, Button, ListGroup, Spinner, Alert, Modal } from 'react-bootstrap';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const Tasks = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const projectId = queryParams.get('project');

    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [taskData, setTaskData] = useState({
        title: '',
        description: '',
        project: projectId || '',
        status: 'TODO'
    });

    // Fetch tasks and projects
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tasksResponse, projectsResponse] = await Promise.all([
                    projectId 
                        ? axios.get(`/api/projects/${projectId}/tasks/`)
                        : axios.get('/api/tasks/'),
                    axios.get('/api/projects/')
                ]);
                
                setTasks(tasksResponse.data);
                setProjects(projectsResponse.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load tasks');
                setLoading(false);
            }
        };
        
        fetchData();
    }, [projectId]);

    // Create new task
    const handleCreateTask = async (e) => {
        e.preventDefault();
        
        if (!taskData.project) {
            setError("Please select a project.");
            return;
        }
    
        try {
            const payload = {
                title: taskData.title,
                description: taskData.description,
                status: taskData.status,  // Remove user field
            };
    
            console.log("Sending task:", payload);
    
            // Ensure project_id is passed correctly in the URL
            const response = await axios.post(`/api/projects/${taskData.project}/tasks/`, payload);
            
            setTasks([...tasks, response.data]);
            setShowModal(false);
            setTaskData({
                title: '',
                description: '',
                project: projectId || '',
                status: 'TODO'
            });
        } catch (error) {
            console.error("Error creating task:", error.response?.data || error.message);
            setError('Failed to create task. Check your input.');
        }
    };
    

    // Toggle task status
    const handleToggleStatus = async (taskId, currentStatus) => {
        const newStatus = currentStatus === 'COMPLETED' ? 'TODO' : 'COMPLETED';
        try {
            const response = await axios.put(`/api/tasks/${taskId}/`, {
                status: newStatus
            });
            setTasks(tasks.map(task =>
                task.id === taskId ? response.data : task
            ));
        } catch (error) {
            setError('Failed to update task status');
        }
    };

    // Delete task
    const handleDeleteTask = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await axios.delete(`/api/tasks/${taskId}/`);
                setTasks(tasks.filter(task => task.id !== taskId));
            } catch (error) {
                setError('Failed to delete task');
            }
        }
    };

    if (loading) return <div className="text-center"><Spinner animation="border" /></div>;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Tasks {projectId && `for ${projects.find(p => p.id === parseInt(projectId))?.name}`}</h2>
                <Button variant="primary" onClick={() => setShowModal(true)}>
                    <i className="bi bi-plus"></i> New Task
                </Button>
            </div>

            {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

            <Card>
                <Card.Body>
                    <ListGroup variant="flush">
                        {tasks.length === 0 ? (
                            <Alert variant="info">No tasks found. Create a new task to get started!</Alert>
                        ) : (
                            tasks.map(task => (
                                <ListGroup.Item
                                    key={task.id}
                                    className="d-flex justify-content-between align-items-center"
                                >
                                    <div className="d-flex align-items-center flex-grow-1">
                                        <Form.Check
                                            type="checkbox"
                                            checked={task.status === 'COMPLETED'}
                                            onChange={() => handleToggleStatus(task.id, task.status)}
                                            className="me-3"
                                        />
                                        <div>
                                            <div style={{
                                                textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none',
                                                color: task.status === 'COMPLETED' ? '#6c757d' : 'inherit'
                                            }}>
                                                {task.title}
                                            </div>
                                            {task.description && (
                                                <small className="text-muted d-block">{task.description}</small>
                                            )}
                                            {!projectId && (
                                                <small className="text-primary">
                                                    {projects.find(p => p.id === task.project)?.name}
                                                </small>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleDeleteTask(task.id)}
                                    >
                                        <i className="bi bi-trash"></i>
                                    </Button>
                                </ListGroup.Item>
                            ))
                        )}
                    </ListGroup>
                </Card.Body>
                {tasks.length > 0 && (
                    <Card.Footer>
                        <small className="text-muted">
                            {tasks.filter(t => t.status === 'COMPLETED').length} of {tasks.length} tasks completed
                        </small>
                    </Card.Footer>
                )}
            </Card>

            {/* Create Task Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Create New Task</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleCreateTask}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Task Title</Form.Label>
                            <Form.Control
                                type="text"
                                value={taskData.title}
                                onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={taskData.description}
                                onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                            />
                        </Form.Group>
                        {!projectId && (
                            <Form.Group className="mb-3">
                                <Form.Label>Project</Form.Label>
                                <Form.Select
                                    value={taskData.project}
                                    onChange={(e) => setTaskData({ ...taskData, project: e.target.value })}
                                    required
                                >
                                    <option value="">Select a project</option>
                                    {projects.map(project => (
                                        <option key={project.id} value={project.id}>
                                            {project.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            Create Task
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default Tasks;
