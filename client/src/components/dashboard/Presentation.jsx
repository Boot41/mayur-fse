import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Button, Row, Col, Form, Spinner, Container, Modal } from "react-bootstrap";
import { FaEdit, FaTrash, FaPlay, FaPlus } from 'react-icons/fa';
import "./Presentation.css";

const Presentation = () => {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [slides, setSlides] = useState([]);
    const [talkingPoints, setTalkingPoints] = useState([]);
    const [presentations, setPresentations] = useState([]);
    const [fetching, setFetching] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingPresentation, setEditingPresentation] = useState(null);
    const [newTitle, setNewTitle] = useState("");

    const API_BASE_URL = "http://localhost:8000/api";

    useEffect(() => {
        fetchPresentations();
    }, []);

    const fetchPresentations = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const { data } = await axios.get(`${API_BASE_URL}/fetch-ppt/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPresentations(data);
        } catch (error) {
            console.error("Error fetching presentations:", error);
        } finally {
            setFetching(false);
        }
    };

    const handlePromptChange = (e) => {
        setPrompt(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!prompt.trim()) {
            alert("Please enter a prompt!");
            return;
        }

        setLoading(true);
        setSlides([]);
        setTalkingPoints([]);

        try {
            const token = localStorage.getItem("access_token");
            const { data } = await axios.post(
                `${API_BASE_URL}/create-ppt/`,
                { prompt: prompt },
                { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
            );

            console.log(data);

            if (data.message === "Presentation created successfully") {
                // Fetch all presentations again to get the updated list
                await fetchPresentations();
                setPrompt("");
            } else {
                alert("Error generating slides!");
            }
        } catch (error) {
            console.error("Error generating slides:", error);
            alert("There was an error processing your request.");
        } finally {
            setLoading(false);
        }
    };

    const openPresentation = (presentation) => {
        if (!presentation || typeof presentation !== "object") {
            alert("Invalid presentation data!");
            return;
        }

        const { title, data } = presentation;
        if (!data || !data.slides || !Array.isArray(data.slides)) {
            alert("Invalid slide data!");
            return;
        }
        if (!data.talking_points || !Array.isArray(data.talking_points)) {
            data.talking_points = [];
        }

        const presentationHTML = `
            <html>
                <head>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.3.1/reveal.min.css">
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.3.1/theme/moon.min.css">
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.3.1/reveal.min.js"></script>
                    <style>
                        .reveal {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        }
                        .reveal h2 {
                            color: #FFFFFF;
                            margin-bottom: 30px;
                        }
                        .reveal ul {
                            list-style-type: none;
                        }
                        .reveal li {
                            margin: 15px 0;
                            color: #ffffff;
                        }
                        .reveal li::before {
                            content: "•";
                            color: #ffffff;
                            font-weight: bold;
                            display: inline-block;
                            width: 1em;
                            margin-left: -1em;
                        }
                    </style>
                </head>
                <body>
                    <div class="reveal">
                        <div class="slides">
                            ${data.slides.map(slide => `
                                <section>
                                    <h2>${slide.title || "Untitled Slide"}</h2>
                                    <ul>
                                        ${(slide.content || []).map(point => `<li>${point}</li>`).join("")}
                                    </ul>
                                </section>
                            `).join("")}
                            <section>
                                <h2>Talking Points</h2>
                                <ul>
                                    ${data.talking_points.map(point => `<li>${point}</li>`).join("")}
                                </ul>
                            </section>
                        </div>
                    </div>
                    <script>
                        document.addEventListener("DOMContentLoaded", function () {
                            Reveal.initialize({
                                transition: 'slide',
                                controls: true,
                                progress: true,
                                center: true,
                                hash: true
                            });
                        });
                    </script>
                </body>
            </html>
        `;

        const presentationWindow = window.open("", "_blank");
        presentationWindow.document.write(presentationHTML);
        presentationWindow.document.close();
    };

    const handleEditClick = (presentation) => {
        setEditingPresentation(presentation);
        setNewTitle(presentation.title);
        setShowEditModal(true);
    };

    const handleEditSubmit = async () => {
        if (!newTitle.trim() || newTitle === editingPresentation.title) {
            setShowEditModal(false);
            return;
        }

        try {
            const token = localStorage.getItem("access_token");
            const response = await axios.put(
                `${API_BASE_URL}/update-ppt/${editingPresentation.id}/`,
                { title: newTitle },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setPresentations((prev) =>
                prev.map((p) => (p.id === editingPresentation.id ? { ...p, ...response.data } : p))
            );
            setShowEditModal(false);
        } catch (error) {
            console.error("Error updating presentation:", error);
        }
    };

    const handleDeletePresentation = async (id) => {
        if (!window.confirm("Are you sure you want to delete this presentation?")) return;

        try {
            const token = localStorage.getItem("access_token");
            await axios.delete(`${API_BASE_URL}/delete-ppt/${id}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPresentations((prev) => prev.filter((p) => p.id !== id));
        } catch (error) {
            console.error("Error deleting presentation:", error);
        }
    };

    return (
        <Container className="py-4">
            <div className="header-section mb-5">
                <h2 className="text-primary mb-4">Presentation Generator</h2>
                <Card className="shadow-sm">
                    <Card.Body>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label className="h5 text-muted">Enter your presentation prompt</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={prompt}
                                    onChange={handlePromptChange}
                                    placeholder="Describe your idea for the presentation..."
                                    className="mb-3"
                                />
                            </Form.Group>
                            <Button 
                                type="submit" 
                                variant="primary" 
                                disabled={loading}
                                className="d-flex align-items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Spinner animation="border" size="sm" />
                                        <span>Generating...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaPlus />
                                        <span>Generate Presentation</span>
                                    </>
                                )}
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
            </div>

            <div className="presentations-section">
                <h3 className="text-muted mb-4">Your Presentations</h3>
                {fetching ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                    </div>
                ) : presentations.length === 0 ? (
                    <div className="text-center py-5">
                        <p className="text-muted">No presentations yet. Create your first one!</p>
                    </div>
                ) : (
                    <Row xs={1} md={2} lg={3} className="g-4">
                        {presentations.map((presentation) => (
                            <Col key={presentation.id}>
                                <Card className="h-100 presentation-card shadow-sm">
                                    <Card.Body>
                                        <Card.Title className="mb-3 d-flex justify-content-between align-items-start">
                                            <span className="text-truncate">{presentation.title}</span>
                                        </Card.Title>
                                        <Card.Text className="text-muted mb-4" style={{
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            display: "-webkit-box",
                                            WebkitLineClamp: "3",
                                            WebkitBoxOrient: "vertical",
                                            minHeight: "4.5em"
                                        }}>
                                            {presentation.description}
                                        </Card.Text>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => openPresentation(presentation)}
                                                className="d-flex align-items-center gap-1"
                                            >
                                                <FaPlay size={12} />
                                                <span>Present</span>
                                            </Button>
                                            <div className="d-flex gap-2">
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    onClick={() => handleEditClick(presentation)}
                                                >
                                                    <FaEdit />
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleDeletePresentation(presentation.id)}
                                                >
                                                    <FaTrash />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </div>

            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Presentation Title</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Control
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Enter new title"
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleEditSubmit}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Presentation;
