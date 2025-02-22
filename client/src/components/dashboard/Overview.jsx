import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';

const Overview = () => {
    return (
        <div>
            <h2 className="mb-4">Overview</h2>
            <Row>
                <Col md={4} className="mb-4">
                    <Card>
                        <Card.Body>
                            <Card.Title>Total Projects</Card.Title>
                            <Card.Text className="display-4">12</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-4">
                    <Card>
                        <Card.Body>
                            <Card.Title>Active Tasks</Card.Title>
                            <Card.Text className="display-4">24</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-4">
                    <Card>
                        <Card.Body>
                            <Card.Title>Completed</Card.Title>
                            <Card.Text className="display-4">8</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row>
                <Col md={8} className="mb-4">
                    <Card>
                        <Card.Body>
                            <Card.Title>Recent Activity</Card.Title>
                            <div className="mt-3">
                                <div className="d-flex align-items-center mb-3">
                                    <div className="bg-primary rounded-circle p-2 me-3"></div>
                                    <div>
                                        <h6 className="mb-0">New Project Created</h6>
                                        <small className="text-muted">2 hours ago</small>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center mb-3">
                                    <div className="bg-success rounded-circle p-2 me-3"></div>
                                    <div>
                                        <h6 className="mb-0">Task Completed</h6>
                                        <small className="text-muted">4 hours ago</small>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center">
                                    <div className="bg-warning rounded-circle p-2 me-3"></div>
                                    <div>
                                        <h6 className="mb-0">New Task Assigned</h6>
                                        <small className="text-muted">1 day ago</small>
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-4">
                    <Card>
                        <Card.Body>
                            <Card.Title>Quick Actions</Card.Title>
                            <div className="d-grid gap-2 mt-3">
                                <button className="btn btn-primary">Create Project</button>
                                <button className="btn btn-outline-primary">Add Task</button>
                                <button className="btn btn-outline-primary">Generate Report</button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Overview;
