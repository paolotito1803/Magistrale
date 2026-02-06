import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GATEWAY_URL } from './App';

export default function Register() {
    const navigate = useNavigate();


    const [formData, setFormData] = useState({
        username: '',
        surname: '',
        email: '',
        password: '',
        role: 'PLAYER'
    });


    const [alertInfo, setAlertInfo] = useState({ show: false, type: '', message: '' });


    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [id]: value
        }));
    };


    const handleRegister = async (e) => {
        e.preventDefault();
        setAlertInfo({ show: false, type: '', message: '' });

        try {
            // Chiamata al Gateway
            const response = await fetch(`${GATEWAY_URL}/users/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setAlertInfo({
                    show: true,
                    type: 'success',
                    message: 'Registration successful! Redirecting to login...'
                });

                // Reindirizza al login dopo 2 secondi
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                const text = await response.text();
                setAlertInfo({ show: true, type: 'danger', message: 'Error: ' + text });
            }
        } catch (error) {
            console.error(error);
            setAlertInfo({ show: true, type: 'danger', message: 'Connection Error: ' + error.message });
        }
    };

    return (
        <div className="bg-light py-5 min-vh-100 d-flex align-items-center justify-content-center position-relative">

            {/* PULSANTE HOME */}
            <button
                onClick={() => navigate('/')}
                className="btn btn-outline-secondary position-absolute top-0 start-0 m-3"
            >
                <i className="bi bi-arrow-left me-1"></i> Home
            </button>

            <div className="container">
                <div className="card shadow mx-auto" style={{ maxWidth: '500px' }}>
                    <div className="card-header bg-success text-white">
                        <h4 className="mb-0">New User Registration</h4>
                    </div>
                    <div className="card-body">

                        {/* BOX MESSAGGI */}
                        {alertInfo.show && (
                            <div className={`alert alert-${alertInfo.type}`} role="alert">
                                {alertInfo.message}
                            </div>
                        )}

                        <form onSubmit={handleRegister}>
                            {/* Username & Surname */}
                            <div className="row mb-3">
                                <div className="col">
                                    <label className="form-label" htmlFor="username">Username</label>
                                    <input
                                        type="text"
                                        id="username"
                                        className="form-control"
                                        required
                                        value={formData.username}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col">
                                    <label className="form-label" htmlFor="surname">Surname</label>
                                    <input
                                        type="text"
                                        id="surname"
                                        className="form-control"
                                        required
                                        value={formData.surname}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Email & Password */}
                            <div className="mb-3">
                                <label className="form-label" htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    className="form-control"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label" htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    className="form-control"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Role */}
                            <div className="mb-3">
                                <label className="form-label" htmlFor="role">Role</label>
                                <select
                                    id="role"
                                    className="form-select"
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <option value="PLAYER">Player</option>
                                    <option value="COACH">Coach</option>
                                    <option value="REFEREE">Referee</option>
                                    <option value="VIEWER">Viewer</option>
                                </select>
                            </div>

                            <button type="submit" className="btn btn-success w-100">Register</button>
                        </form>

                        <div className="mt-3 text-center">
                            <button
                                className="btn btn-link text-decoration-none"
                                onClick={() => navigate('/login')}
                            >
                                Already have an account? Login
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}