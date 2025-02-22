import React from 'react';
import { Card, Table, Badge, Button } from 'react-bootstrap';

const Projects = () => {
    const projects = [
        {
            id: 1,
            name: 'Website Redesign',
            status: 'In Progress',
            deadline: '2025-03-15',
            progress: 65
        },
        {
            id: 2,
            name: 'Mobile App Development',
            status: 'Planning',
            deadline: '2025-04-01',
            progress: 25
        },
        {
            id: 3,
            name: 'Database Migration',
            status: 'Completed',
            deadline: '2025-02-28',
            progress: 100
        },
        {
            id: 4,
            name: 'API Integration',
            status: 'In Progress',
            deadline: '2025-03-10',
            progress: 45
        }
    ];

    const getStatusBadge = (status) => {
        const statusMap = {
            'In Progress': 'primary',
            'Planning': 'warning',
            'Completed': 'success'
        };
        return <Badge bg={statusMap[status]}>{status}</Badge>;
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Projects</h2>
                <Button variant="primary">
                    <i className="bi bi-plus"></i> New Project
                </Button>
            </div>
            <Card>
                <Card.Body>
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>Project Name</th>
                                <th>Status</th>
                                <th>Deadline</th>
                                <th>Progress</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map(project => (
                                <tr key={project.id}>
                                    <td>{project.name}</td>
                                    <td>{getStatusBadge(project.status)}</td>
                                    <td>{project.deadline}</td>
                                    <td>
                                        <div className="progress" style={{ height: '20px' }}>
                                            <div
                                                className="progress-bar"
                                                role="progressbar"
                                                style={{ width: `${project.progress}%` }}
                                                aria-valuenow={project.progress}
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                            >
                                                {project.progress}%
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <Button variant="outline-primary" size="sm" className="me-2">
                                            <i className="bi bi-pencil"></i>
                                        </Button>
                                        <Button variant="outline-danger" size="sm">
                                            <i className="bi bi-trash"></i>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </div>
    );
};

export default Projects;
