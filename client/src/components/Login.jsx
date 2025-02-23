import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMail, FiLock, FiAlertCircle } from "react-icons/fi";

export const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const user = {
            email: email,
            password: password
        };
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

        try {
            const { data } = await axios.post(
                `${API_BASE_URL}/token/`,
                user,
                { headers: { "Content-Type": "application/json" }, withCredentials: true }
            );

            localStorage.clear();
            localStorage.setItem("access_token", data.access);
            localStorage.setItem("refresh_token", data.refresh);
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
            window.location.href = "/dashboard/";
        } catch (err) {
            setError(err.response?.data?.detail || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="Auth-form-container">
            <form className="Auth-form" onSubmit={submit}>
                <div className="Auth-form-content">
                    <h3 className="Auth-form-title">Welcome Back</h3>
                    <p className="text-center text-secondary mb-4">
                        Please sign in to continue
                    </p>

                    {error && (
                        <div className="alert alert-danger d-flex align-items-center gap-2">
                            <FiAlertCircle />
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label>Email</label>
                        <div className="input-group">
                            <span className="input-group-text">
                                <FiMail />
                            </span>
                            <input
                                className="form-control"
                                placeholder="Enter your email"
                                name="email"
                                type="email"
                                value={email}
                                required
                                onChange={e => setEmail(e.target.value)}
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
                                name="password"
                                type="password"
                                className="form-control"
                                placeholder="Enter your password"
                                value={password}
                                required
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
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
                                    Signing in...
                                </span>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </div>

                    <p className="text-center mt-3">
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-primary text-decoration-none">
                            Sign up
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
};