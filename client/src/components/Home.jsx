import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const Home = () => {
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMessage = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const { data } = await axios.get('http://localhost:8000/home/', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                setMessage(data.message);
            } catch (error) {
                console.log('Not authorized');
            }
        };

        fetchMessage();
    }, [navigate]);

    return (
        <div className="form-signin mt-5 text-center">
            <h3>Hi {message}</h3>
        </div>
    );
};
