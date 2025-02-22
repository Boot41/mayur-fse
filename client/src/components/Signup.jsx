import axios from "axios";
import { useState } from "react";

export const Signup = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

    const submit = async (e) => {
        e.preventDefault();


        const newUser = { username, email, password };

        try {
            // Step 1: Register User
            const registerResponse = await axios.post(`${API_BASE_URL}/signup/`, newUser, {
                headers: { "Content-Type": "application/json" },
            });

            if (registerResponse.status === 201) {
                // Step 2: Automatically Log in the User
                const loginResponse = await axios.post(`${API_BASE_URL}/token/`, newUser, {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true
                });

                const { access, refresh } = loginResponse.data;

                // Step 3: Store Tokens and Redirect
                localStorage.clear();
                localStorage.setItem("access_token", access);
                localStorage.setItem("refresh_token", refresh);
                axios.defaults.headers.common["Authorization"] = `Bearer ${access}`;

                window.location.href = "/select-role";  // Redirect to the dashboard/home page
            }
        } catch (error) {
            console.error("Signup or login failed:", error);
            alert("Signup failed. Please try again.");
        }
    };

    return (
        <div className="Auth-form-container">
    <form className="Auth-form" onSubmit={submit}>
        <div className="Auth-form-content">
            <h3 className="Auth-form-title">Sign Up</h3>
            <div className="form-group mt-3">
                <label>Username</label>
                <input
                    className="form-control mt-1"
                    placeholder="Enter Username"
                    type="text"
                    value={username}
                    required
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <div className="form-group mt-3">
                <label>Email</label>
                <input
                    className="form-control mt-1"
                    placeholder="Enter Email"
                    type="email"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="form-group mt-3">
                <label>Password</label>
                <input
                    type="password"
                    className="form-control mt-1"
                    placeholder="Enter password"
                    value={password}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <div className="d-grid gap-2 mt-3">
                <button type="submit" className="btn btn-primary">Sign Up</button>
            </div>
        </div>
    </form>
</div>

    );
};
