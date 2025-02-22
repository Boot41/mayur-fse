import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

console.log("REACHED")
const SelectRole = () => {
    const [jobRole, setJobRole] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

    useEffect(() => {
        // Check if the user is authenticated
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');  // Redirect to login if not authenticated
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const token = localStorage.getItem('access_token');
        if (!token) {
            setError('Authentication failed. Please log in again.');
            return;
        }

        try {
            const response = await axios.post(
                `${API_BASE_URL}/select-role/`,
                { job_role: jobRole, specialization: specialization },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Redirect the user to the homepage after successfully setting their role
            navigate('/dashboard');
        } catch (err) {
            console.error("Error updating role:", err);
            setError(err.response?.data?.error || 'Failed to update role. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Select Your Role
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="jobRole" className="block text-sm font-medium text-gray-700">
                                Job Role *
                            </label>
                            <div className="mt-1">
                                <input
                                    id="jobRole"
                                    name="jobRole"
                                    type="text"
                                    required
                                    value={jobRole}
                                    onChange={(e) => setJobRole(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
                                Specialization (Optional)
                            </label>
                            <div className="mt-1">
                                <input
                                    id="specialization"
                                    name="specialization"
                                    type="text"
                                    value={specialization}
                                    onChange={(e) => setSpecialization(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Save Role
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SelectRole;
