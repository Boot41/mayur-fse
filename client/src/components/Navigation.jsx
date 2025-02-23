import { Nav, Navbar, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiLogOut, FiHome, FiUser } from 'react-icons/fi';
import authService from '../services/auth';

export function Navigation() {
    const [isAuth, setIsAuth] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setIsAuth(authService.isAuthenticated());
    }, []);

    const handleLogout = () => {
        authService.logout();
        setIsAuth(false);
        navigate('/login');
    };

    return (
        <Navbar expand="lg" className="navbar">
            <Container>
                <Navbar.Brand as={Link} to="/">
                    Think41
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        {isAuth && (
                            <Nav.Link as={Link} to="/" className="d-flex align-items-center gap-2">
                                <FiHome /> Home
                            </Nav.Link>
                        )}
                    </Nav>
                    <Nav className="d-flex align-items-center gap-2">
                        {isAuth ? (
                            <Nav.Link 
                                onClick={handleLogout}
                                className="d-flex align-items-center gap-2"
                            >
                                <FiLogOut /> Logout
                            </Nav.Link>
                        ) : (
                            <>
                                <Nav.Link 
                                    as={Link} 
                                    to="/login"
                                    className="d-flex align-items-center gap-2"
                                >
                                    <FiUser /> Login
                                </Nav.Link>
                                <Nav.Link 
                                    as={Link} 
                                    to="/signup"
                                    className="btn btn-primary text-white"
                                >
                                    Sign Up
                                </Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}