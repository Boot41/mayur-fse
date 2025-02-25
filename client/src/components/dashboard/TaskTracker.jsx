import React, { useState, useEffect } from "react";
import { Card, Button, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const TaskTracker = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [transcript, setTranscript] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [tasksUpdated, setTasksUpdated] = useState(false);

    const startInterview = () => {
        window.location.href = "http://localhost:3001";   // Redirect to the interview page
    };

    const fetchTranscript = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/api/transcript/");
    
            console.log("Full API Response:", response.data); // Debugging step
    
            if (response.data && response.data.conversations) {
                console.log("Conversations:", response.data.conversations);
                setTranscript(response.data.conversations);
            } else {
                console.error("Unexpected API response structure:", response.data);
                setError("Invalid response format from API.");
            }
        } catch (error) {
            console.error("Error fetching transcript:", error);
            setError("Failed to load transcript.");
        }
        setLoading(false);
    };
    
    
    const analyzeTranscript = async () => {
        if (!transcript) return;
        setProcessing(true);
        
        try {
            console.log("Sending transcript for analysis:", transcript);  // Debugging step
    
            const response = await axios.post("/api/transcript/process/", { transcript });
            console.log("LLM Analysis Response:", response.data);  // 🔹 Print the response
    
            const { completed_tasks = [], new_tasks = [] } = response.data;
    
            console.log("Completed Tasks:", completed_tasks);
            console.log("New Tasks:", new_tasks);
    
            // ✅ Update completed tasks
            if (completed_tasks.length > 0) {
                await Promise.all(
                    completed_tasks.map(async (taskTitle) => {
                        try {
                            await axios.put(`/api/tasks/update/`, { title: taskTitle, status: "COMPLETED" });
                            console.log(`Task marked as completed: ${taskTitle}`);
                        } catch (error) {
                            console.error(`Error updating task: ${taskTitle}`, error);
                        }
                    })
                );
            }
    
            // ✅ Add new tasks
            if (new_tasks.length > 0) {
                await Promise.all(
                    new_tasks.map(async (task) => {
                        try {
                            await axios.post(`/api/tasks/`, {
                                title: task.title,
                                description: task.description,
                                status: "TODO"
                            });
                            console.log(`New task added: ${task.title}`);
                        } catch (error) {
                            console.error(`Error adding task: ${task.title}`, error);
                        }
                    })
                );
            }
    
            setTasksUpdated(true);
        } catch (error) {
            console.error("Error analyzing transcript:", error);
            setError("Failed to analyze transcript.");
        }
    
        setProcessing(false);
    };
    
    

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Task Tracker Interview</h2>
                <Button variant="primary" onClick={startInterview}>
                    <i className="bi bi-mic"></i> Start Interview
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Card>
                <Card.Body>
                    <Button variant="info" onClick={fetchTranscript} disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : "Fetch Transcript"}
                    </Button>

                    {transcript && (
                        <div className="mt-3">
                            <h5>Transcript</h5>
                            <div style={{ whiteSpace: "pre-wrap", background: "#f8f9fa", padding: "10px" }}>
                                {transcript.map((entry, index) => (
                                    <p key={index}>
                                        <strong>{entry.speaker}:</strong> {entry.text}
                                    </p>
                                ))}
                            </div>
                            <Button
                                variant="success"
                                className="mt-2"
                                onClick={analyzeTranscript}
                                disabled={processing}
                            >
                                {processing ? <Spinner animation="border" size="sm" /> : "Analyze Transcript"}
                            </Button>
                        </div>
                    )}


                    {tasksUpdated && <Alert variant="success" className="mt-3">Tasks updated successfully!</Alert>}
                </Card.Body>
            </Card>
        </div>
    );
};

export default TaskTracker;
