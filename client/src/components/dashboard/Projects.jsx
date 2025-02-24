import React, { useEffect, useState } from 'react';
import { Card, Table, Badge, Button, Spinner, Alert, Modal, Form, ListGroup } from 'react-bootstrap';
import axios from 'axios';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [projectTasks, setProjectTasks] = useState([]);
    
    // Modal States
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showTasksModal, setShowTasksModal] = useState(false);
    const [projectData, setProjectData] = useState({
        name: '',
        description: ''
    });

    // Fetch projects from API
    const fetchProjects = async () => {
        try {
            const response = await axios.get('/api/projects/');
            setProjects(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching projects:", error);
            setError("Failed to load projects");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    // Fetch tasks for a specific project
    const fetchProjectTasks = async (projectId) => {
        try {
            const response = await axios.get(`/api/projects/${projectId}/tasks/`);
            setProjectTasks(response.data.filter(task => task.status !== 'COMPLETED'));
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    // Handle project creation
    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/projects/', projectData);
            setProjects([...projects, response.data]);
            setShowCreateModal(false);
            setProjectData({ name: '', description: '' });
        } catch (error) {
            setError("Failed to create project");
        }
    };

    // Handle project update
    const handleUpdateProject = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`/api/projects/${selectedProject.id}/`, projectData);
            setProjects(projects.map(p => p.id === selectedProject.id ? response.data : p));
            setShowEditModal(false);
        } catch (error) {
            setError("Failed to update project");
        }
    };

    // Handle project deletion
    const handleDeleteProject = async (projectId) => {
        if (window.confirm('Are you sure you want to delete this project? All associated tasks will be deleted.')) {
            try {
                await axios.delete(`/api/projects/${projectId}/`);
                setProjects(projects.filter(p => p.id !== projectId));
            } catch (error) {
                setError("Failed to delete project");
            }
        }
    };

    // Handle opening project tasks
    const handleProjectClick = async (project) => {
        setSelectedProject(project);
        await fetchProjectTasks(project.id);
        setShowTasksModal(true);
    };

    // Handle opening edit modal
    const handleEditClick = (e, project) => {
        e.stopPropagation(); // Prevent opening tasks modal
        setSelectedProject(project);
        setProjectData({
            name: project.name,
            description: project.description || ''
        });
        setShowEditModal(true);
    };

    if (loading) return <div className="text-center"><Spinner animation="border" /></div>;
    if (error) return <Alert variant="danger">{error}</Alert>;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Projects</h2>
                <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                    <i className="bi bi-plus"></i> New Project
                </Button>
            </div>

            <Card>
                <Card.Body>
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map(project => (
                                <tr key={project.id} onClick={() => handleProjectClick(project)} style={{ cursor: 'pointer' }}>
                                    <td>{project.name}</td>
                                    <td>{project.description || 'No description'}</td>
                                    <td>{new Date(project.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            className="me-2"
                                            onClick={(e) => handleEditClick(e, project)}
                                        >
                                            <i className="bi bi-pencil"></i>
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteProject(project.id);
                                            }}
                                        >
                                            <i className="bi bi-trash"></i>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Create Project Modal */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Create New Project</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleCreateProject}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Project Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={projectData.name}
                                onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={projectData.description}
                                onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            Create Project
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Edit Project Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Project</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleUpdateProject}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Project Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={projectData.name}
                                onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={projectData.description}
                                onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            Update Project
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Project Tasks Modal */}
            <Modal
                show={showTasksModal}
                onHide={() => setShowTasksModal(false)}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        Tasks for {selectedProject?.name}
                        <Button
                            variant="primary"
                            size="sm"
                            className="ms-3"
                            onClick={() => {
                                setShowTasksModal(false);
                                window.location.href = `/dashboard/tasks?project=${selectedProject?.id}`;
                            }}
                        >
                            Add New Task
                        </Button>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {projectTasks.length === 0 ? (
                        <Alert variant="info">No incomplete tasks found for this project.</Alert>
                    ) : (
                        <ListGroup>
                            {projectTasks.map(task => (
                                <ListGroup.Item key={task.id} className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="mb-0">{task.title}</h6>
                                        <small className="text-muted">{task.description}</small>
                                    </div>
                                    <Badge bg={task.status === 'IN_PROGRESS' ? 'primary' : 'warning'}>
                                        {task.status.replace('_', ' ')}
                                    </Badge>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Projects;
