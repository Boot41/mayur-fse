import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiAlertCircle } from "react-icons/fi";

export const Signup = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const newUser = { username, email, password };

        try {
            // Step 1: Register User
            const registerResponse = await axios.post(
                `${API_BASE_URL}/signup/`,
                newUser,
                { headers: { "Content-Type": "application/json" } }
            );

            if (registerResponse.status === 201) {
                // Step 2: Automatically Log in the User
                const loginResponse = await axios.post(
                    `${API_BASE_URL}/token/`,
                    newUser,
                    { headers: { "Content-Type": "application/json" }, withCredentials: true }
                );

                const { access, refresh } = loginResponse.data;

                // Step 3: Store Tokens and Redirect
                localStorage.clear();
                localStorage.setItem("access_token", access);
                localStorage.setItem("refresh_token", refresh);
                axios.defaults.headers.common["Authorization"] = `Bearer ${access}`;

                window.location.href = "/select-role";
            }
        } catch (err) {
            let errorMessage = "Signup failed. Please try again.";
            if (err.response?.data) {
                // Handle different types of error responses
                if (typeof err.response.data === 'string') {
                    errorMessage = err.response.data;
                } else if (err.response.data.email) {
                    errorMessage = err.response.data.email[0];
                } else if (err.response.data.username) {
                    errorMessage = err.response.data.username[0];
                } else if (err.response.data.password) {
                    errorMessage = err.response.data.password[0];
                }
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="Auth-form-container">
            <form className="Auth-form" onSubmit={submit}>
                <div className="Auth-form-content">
                    <h3 className="Auth-form-title">Create Account</h3>
                    <p className="text-center text-secondary mb-4">
                        Fill in your details to get started
                    </p>

                    {error && (
                        <div className="alert alert-danger d-flex align-items-center gap-2">
                            <FiAlertCircle />
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label>Username</label>
                        <div className="input-group">
                            <span className="input-group-text">
                                <FiUser />
                            </span>
                            <input
                                className="form-control"
                                placeholder="Choose a username"
                                type="text"
                                value={username}
                                required
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <div className="input-group">
                            <span className="input-group-text">
                                <FiMail />
                            </span>
                            <input
                                className="form-control"
                                placeholder="Enter your email"
                                type="email"
                                value={email}
                                required
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-group">
                            <span className="input-group-text">
                                <FiLock />
                            </span>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Choose a strong password"
                                value={password}
                                required
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <small className="text-secondary mt-1 d-block">
                            Password must be at least 8 characters long
                        </small>
                    </div>

                    <div className="d-grid gap-2 mt-4">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="d-flex align-items-center justify-content-center gap-2">
                                    <span className="loading-spinner"></span>
                                    Creating account...
                                </span>
                            ) : (
                                "Sign Up"
                            )}
                        </button>
                    </div>

                    <p className="text-center mt-3">
                        Already have an account?{" "}
                        <Link to="/login" className="text-primary text-decoration-none">
                            Sign in
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
};
