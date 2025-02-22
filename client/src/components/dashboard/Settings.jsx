import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';

const Settings = () => {
    const [showAlert, setShowAlert] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
    };

    return (
        <div>
            <h2 className="mb-4">Settings</h2>
            {showAlert && (
                <Alert variant="success" onClose={() => setShowAlert(false)} dismissible>
                    Settings updated successfully!
                </Alert>
            )}
            <Row>
                <Col md={8}>
                    <Card className="mb-4">
                        <Card.Body>
                            <h5 className="mb-4">Profile Settings</h5>
                            <Form onSubmit={handleSubmit}>
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>First Name</Form.Label>
                                            <Form.Control type="text" placeholder="Enter first name" />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Last Name</Form.Label>
                                            <Form.Control type="text" placeholder="Enter last name" />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control type="email" placeholder="Enter email" />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Job Title</Form.Label>
                                    <Form.Control type="text" placeholder="Enter job title" />
                                </Form.Group>
                                <Button type="submit" variant="primary">
                                    Update Profile
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>

                    <Card>
                        <Card.Body>
                            <h5 className="mb-4">Change Password</h5>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Current Password</Form.Label>
                                    <Form.Control type="password" placeholder="Enter current password" />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>New Password</Form.Label>
                                    <Form.Control type="password" placeholder="Enter new password" />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Confirm New Password</Form.Label>
                                    <Form.Control type="password" placeholder="Confirm new password" />
                                </Form.Group>
                                <Button type="submit" variant="primary">
                                    Change Password
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="mb-4">
                        <Card.Body>
                            <h5 className="mb-4">Notifications</h5>
                            <Form>
                                <Form.Check
                                    type="switch"
                                    id="email-notifications"
                                    label="Email Notifications"
                                    className="mb-3"
                                    defaultChecked
                                />
                                <Form.Check
                                    type="switch"
                                    id="push-notifications"
                                    label="Push Notifications"
                                    className="mb-3"
                                    defaultChecked
                                />
                                <Form.Check
                                    type="switch"
                                    id="task-reminders"
                                    label="Task Reminders"
                                    className="mb-3"
                                    defaultChecked
                                />
                                <Form.Check
                                    type="switch"
                                    id="project-updates"
                                    label="Project Updates"
                                    className="mb-3"
                                    defaultChecked
                                />
                            </Form>
                        </Card.Body>
                    </Card>

                    <Card>
                        <Card.Body>
                            <h5 className="mb-4">Theme</h5>
                            <Form>
                                <Form.Check
                                    type="radio"
                                    name="theme"
                                    id="light-theme"
                                    label="Light Theme"
                                    defaultChecked
                                    className="mb-2"
                                />
                                <Form.Check
                                    type="radio"
                                    name="theme"
                                    id="dark-theme"
                                    label="Dark Theme"
                                    className="mb-2"
                                />
                                <Form.Check
                                    type="radio"
                                    name="theme"
                                    id="system-theme"
                                    label="System Theme"
                                />
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Settings;
