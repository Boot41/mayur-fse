import React, { useState } from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { Link, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';

// Import dashboard section components
import Overview from './dashboard/Overview';
import Projects from './dashboard/Projects';
import Tasks from './dashboard/Tasks';
import Settings from './dashboard/Settings';

const Dashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeKey, setActiveKey] = useState('overview');

    // Handle navigation
    const handleSelect = (selectedKey) => {
        setActiveKey(selectedKey);
        navigate(`/dashboard/${selectedKey}`);
    };

    const CustomNavLink = ({ to, children, eventKey }) => (
        <Link 
            to={to}
            className={`nav-link text-white ${activeKey === eventKey ? 'bg-primary' : ''}`}
            onClick={() => handleSelect(eventKey)}
        >
            {children}
        </Link>
    );

    return (
        <Container fluid className="vh-100 p-0">
            <Row className="h-100 g-0">
                {/* Sidebar */}
                <Col md={2} className="bg-dark text-white min-vh-100 d-flex flex-column p-3">
                    <div className="fs-4 mb-4">Dashboard</div>
                    <Nav className="flex-column">
                        <Nav.Item>
                            <CustomNavLink 
                                to="/dashboard/overview" 
                                eventKey="overview"
                            >
                                <i className="bi bi-house-door me-2"></i>
                                Overview
                            </CustomNavLink>
                        </Nav.Item>
                        <Nav.Item>
                            <CustomNavLink 
                                to="/dashboard/projects" 
                                eventKey="projects"
                            >
                                <i className="bi bi-folder me-2"></i>
                                Projects
                            </CustomNavLink>
                        </Nav.Item>
                        <Nav.Item>
                            <CustomNavLink 
                                to="/dashboard/tasks" 
                                eventKey="tasks"
                            >
                                <i className="bi bi-list-task me-2"></i>
                                Tasks
                            </CustomNavLink>
                        </Nav.Item>
                        <Nav.Item>
                            <CustomNavLink 
                                to="/dashboard/settings" 
                                eventKey="settings"
                            >
                                <i className="bi bi-gear me-2"></i>
                                Settings
                            </CustomNavLink>
                        </Nav.Item>
                    </Nav>
                    <div className="mt-auto">
                        <div className="text-muted">
                            <small>Logged in as</small>
                            <div className="fw-bold">User</div>
                        </div>
                    </div>
                </Col>

                {/* Main Content */}
                <Col md={10} className="p-4">
                    <Routes>
                        {/* Redirect from /dashboard to /dashboard/overview */}
                        <Route path="/" element={<Navigate to="/dashboard/overview" replace />} />
                        <Route path="/overview" element={<Overview />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/tasks" element={<Tasks />} />
                        <Route path="/settings" element={<Settings />} />
                    </Routes>
                </Col>
            </Row>
        </Container>
    );
};

export default Dashboard;