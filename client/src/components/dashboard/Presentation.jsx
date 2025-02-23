import React, { useState } from "react";
import axios from "axios";
import { Card, Button, Form, Spinner } from "react-bootstrap";

const Presentation = () => {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [slides, setSlides] = useState([]);
    const [talkingPoints, setTalkingPoints] = useState([]);

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
            const API_BASE_URL = "http://localhost:8000"; // Update as needed
            const { data } = await axios.post(
                `${API_BASE_URL}/groq/`,
                { prompt: prompt },
                { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
            );

            if (data.response && data.response.slides) {
                setSlides(data.response.slides);
                setTalkingPoints(data.response.talking_points);
            } else {
                alert("Error generating slides!");
            }
        } catch (error) {
            console.error("Error generating slides:", error);
            alert("There was an error processing your request.");
        } finally {
            setLoading(false);
            setPrompt("");
        }
    };

    const openPresentation = () => {
        if (slides.length === 0) {
            alert("No slides available!");
            return;
        }

        const presentationHTML = `
            <html>
                <head>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.3.1/reveal.min.css">
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.3.1/theme/solarized.min.css">
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.3.1/reveal.min.js"></script>
                </head>
                <body>
                    <div class="reveal">
                        <div class="slides">
                            ${slides
                                .map(
                                    (slide) => `
                                    <section>
                                        <h2>${slide.title}</h2>
                                        <ul>
                                            ${slide.content.map((point) => `<li>${point}</li>`).join("")}
                                        </ul>
                                    </section>
                                `
                                )
                                .join("")}
                            <section>
                                <h2>Talking Points</h2>
                                <ul>
                                    ${talkingPoints.map((point) => `<li>${point}</li>`).join("")}
                                </ul>
                            </section>
                        </div>
                    </div>
                    <script>
                        document.addEventListener("DOMContentLoaded", function () {
                            Reveal.initialize();
                        });
                    </script>
                </body>
            </html>
        `;

        const presentationWindow = window.open("", "_blank");
        presentationWindow.document.write(presentationHTML);
        presentationWindow.document.close();
    };

    return (
        <div>
            <h2 className="mb-4">Generate Presentation</h2>

            <Card className="mb-4">
                <Card.Body>
                    <Card.Title>Enter a Prompt for Slide Generation</Card.Title>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={prompt}
                                onChange={handlePromptChange}
                                placeholder="Describe your idea for the presentation"
                            />
                        </Form.Group>
                        <Button type="submit" variant="primary" disabled={loading}>
                            {loading ? <Spinner animation="border" size="sm" /> : "Generate Slides"}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>

            {loading && (
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p>Generating slides...</p>
                </div>
            )}

            {slides.length > 0 && (
                <div className="text-center mt-4">
                    <Button variant="success" onClick={openPresentation}>
                        Open Presentation
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Presentation;
