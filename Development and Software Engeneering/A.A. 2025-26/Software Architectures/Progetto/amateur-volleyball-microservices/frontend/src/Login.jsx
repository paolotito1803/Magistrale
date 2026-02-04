import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GATEWAY_URL } from './App';

export default function Login() {
    // Stati del form
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    // Funzione di login riutilizzabile (usata sia dal form manuale che dai bottoni demo)
    const performLogin = async (loginEmail, loginPass) => {
        // 1. Aggiorna visivamente i campi (feedback utente)
        setEmail(loginEmail);
        setPassword(loginPass);
        setError('');

        try {

            const response = await fetch(`${GATEWAY_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: loginEmail, password: loginPass })
            });

            if (response.ok) {
                const data = await response.json();


                localStorage.setItem('jwt_token', data.token);
                localStorage.setItem('user_info', JSON.stringify(data.user));


                const role = data.user.role;

                if (role === 'ADMIN') {
                    navigate('/admin');
                }
                else if (role === 'REFEREE') {
                    navigate('/referee');
                }
                else if (role === 'COACH') {
                    navigate('/coach');
                }
                else if (role === 'VIEWER' || role === 'PLAYER') {
                    navigate('/viewer');
                }
                else {
                    navigate('/');
                }
            } else {

                setError("Invalid credentials! (Check if demo users exist in DB)");
            }
        } catch (err) {
            console.error(err);
            setError("Server connection failed.");
        }
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        performLogin(email, password);
    };

    return (
        <div className="d-flex align-items-center justify-content-center vh-100 bg-light position-relative">

            <button
                onClick={() => navigate('/')}
                className="btn btn-outline-secondary position-absolute top-0 start-0 m-3"
            >
                <i className="bi bi-arrow-left me-1"></i> Home
            </button>

            <div className="card shadow p-4" style={{ maxWidth: '450px', width: '100%' }}>
                <div className="text-center mb-4">
                    <h3 className="fw-bold">Sign In</h3>
                    <p className="text-muted">Volleyball Tournament System</p>
                </div>

                {/* DEMO QUICK LOGIN SECTION */}
                <div className="mb-4">
                    <div className="text-center position-relative mb-3">
                        <hr />
                        <span className="position-absolute top-50 start-50 translate-middle bg-white px-2 text-muted small fw-bold">
                            DEMO QUICK LOGIN
                        </span>
                    </div>

                    <div className="row g-2" style={{ marginTop: '40px' }}>
                        <div className="col-6">
                            <button
                                className="btn btn-outline-danger w-100"
                                onClick={() => performLogin('admin@volleyball.com', 'admin_pass')}
                            >
                                Admin
                            </button>
                        </div>
                        <div className="col-6">
                            <button
                                className="btn btn-outline-primary w-100"
                                onClick={() => performLogin('coach1@mail.com', 'pwd')}
                            >
                                Coach
                            </button>
                        </div>
                        <div className="col-6">
                            <button
                                className="btn btn-outline-warning w-100"
                                onClick={() => performLogin('ref1@mail.com', 'pwd')}
                            >
                                Referee
                            </button>
                        </div>
                        <div className="col-6">
                            <button
                                className="btn btn-outline-success w-100"
                                onClick={() => performLogin('viewer1@mail.com', 'pwd')}
                            >
                                Viewer
                            </button>
                        </div>
                    </div>
                </div>

                {/* BOX ERRORI */}
                {error && (
                    <div className="alert alert-danger text-center" role="alert">
                        {error}
                    </div>
                )}

                {/* STANDARD FORM */}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="user@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="******"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-dark w-100 py-2">Login Manually</button>
                </form>

                <div className="mt-4 text-center">
                    <span className="text-muted me-1">Don't have an account?</span>
                    <button
                        className="btn btn-link fw-bold text-decoration-none p-0 align-baseline"
                        onClick={() => navigate('/register')}
                    >
                        Register
                    </button>
                </div>
            </div>
        </div>
    );
}