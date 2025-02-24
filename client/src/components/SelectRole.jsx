import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const SelectRole = () => {
    const [jobRole, setJobRole] = useState("");
    const [specialization, setSpecialization] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            navigate("/login"); // Redirect to login if not authenticated
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const token = localStorage.getItem("access_token");
        if (!token) {
            setError("Authentication failed. Please log in again.");
            return;
        }

        if (!jobRole) {
            setError("Please select a job role.");
            return;
        }

        try {
            await axios.post(
                `${API_BASE_URL}/select-role/`,
                { job_role: jobRole, specialization: specialization },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            navigate("/dashboard"); // Redirect to dashboard on success
        } catch (err) {
            console.error("Error updating role:", err);
            setError(err.response?.data?.error || "Failed to update role. Please try again.");
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card shadow-lg p-4" style={{ width: "400px" }}>
                <h2 className="text-center mb-4">Select Your Role</h2>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {/* Job Role Dropdown */}
                    <div className="mb-3">
                        <label htmlFor="jobRole" className="form-label">
                            Job Role *
                        </label>
                        <select
                            id="jobRole"
                            className="form-select"
                            value={jobRole}
                            onChange={(e) => setJobRole(e.target.value)}
                            required
                        >
                            <option value="">Select a role...</option>
                            <option value="Software Engineer">Software Engineer</option>
                            <option value="Data Scientist">Data Scientist</option>
                            <option value="Product Manager">Product Manager</option>
                            <option value="UX Designer">UX Designer</option>
                        </select>
                    </div>

                    {/* Specialization Input */}
                    <div className="mb-3">
                        <label htmlFor="specialization" className="form-label">
                            Specialization (Optional)
                        </label>
                        <input
                            id="specialization"
                            type="text"
                            className="form-control"
                            value={specialization}
                            onChange={(e) => setSpecialization(e.target.value)}
                            placeholder="e.g., Frontend, AI, Backend..."
                        />
                    </div>

                    {/* Submit Button */}
                    <button type="submit" className="btn btn-primary w-100">
                        Save Role
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SelectRole;
