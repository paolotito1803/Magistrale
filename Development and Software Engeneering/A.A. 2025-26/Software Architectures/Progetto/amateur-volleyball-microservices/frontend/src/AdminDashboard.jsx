import React, { useEffect, useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import { GATEWAY_URL } from './App';

export default function AdminDashboard() {
    const [teams, setTeams] = useState([]);
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);


    const [tName, setTName] = useState('');
    const [selectedTeams, setSelectedTeams] = useState([]);

    const navigate = useNavigate();
    const token = localStorage.getItem('jwt_token');
    const user = JSON.parse(localStorage.getItem('user_info') || '{}');


    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        loadData();
    }, [token, navigate]);

    const loadData = async () => {
        setLoading(true);
        const headers = { 'Authorization': `Bearer ${token}` };

        try {
            // Fetch Teams (per il form)
            const resTeams = await fetch(`${GATEWAY_URL}/teams`, { headers });
            const dataTeams = await resTeams.json();
            setTeams(dataTeams);

            // Fetch Tournaments (per la lista)
            const resTournaments = await fetch(`${GATEWAY_URL}/tournaments`, { headers });
            const dataTournaments = await resTournaments.json();
            setTournaments(dataTournaments);

        } catch (error) {
            console.error("Error loading data:", error);
            // alert("Error loading dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    // 2. LOGOUT
    const logout = () => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_info');
        navigate('/');
    };


    const handleCheckboxChange = (teamName) => {
        if (selectedTeams.includes(teamName)) {
            setSelectedTeams(selectedTeams.filter(t => t !== teamName));
        } else {
            setSelectedTeams([...selectedTeams, teamName]);
        }
    };


    const createTournament = async () => {
        if (!tName) {
            alert("Please enter a tournament name!");
            return;
        }
        if (selectedTeams.length < 2) {
            alert("Please select at least 2 teams!");
            return;
        }

        const body = {
            tournamentName: tName,
            teams: selectedTeams
        };

        try {
            const res = await fetch(`${GATEWAY_URL}/tournaments/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-Auth-User-Id': user.id,
                    'X-Auth-Role': user.role
                },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                alert("Tournament created successfully!");
                setTName('');
                setSelectedTeams([]);
                await loadData();
            } else {
                const txt = await res.text();
                alert("Error: " + txt);
            }
        } catch (error) {
            alert("Connection Error: " + error.message);
        }
    };


    const deleteTournament = async (id) => {
        if (!window.confirm("Are you sure you want to delete this tournament? All matches will be lost.")) {
            return;
        }

        try {
            const res = await fetch(`${GATEWAY_URL}/tournaments/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'X-Auth-User-Id': user.id, 'X-Auth-Role': user.role}
            });

            if (res.ok) {
                alert("Tournament deleted successfully!");
                await loadData();
            } else {
                const txt = await res.text();
                alert("Error: " + txt);
            }
        } catch (error) {
            alert("Connection Error: " + error.message);
        }
    };


    const viewTournament = (id) => {
        // Usa la rotta definita in App.jsx per il bracket pubblico o admin view
        navigate(`/tournament/${id}/admin_bracket_view`);
    };

    if (loading && teams.length === 0) {
        return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
    }

    return (
        <div className="bg-light min-vh-100">
            {/* STILI INLINE (o puoi metterli in un file CSS) */}
            <style>{`
                .action-buttons { display: flex; gap: 0.5rem; justify-content: flex-end; }
                .navbar-brand { margin-left: 40px; }
            `}</style>

            {/* NAVBAR */}
            <nav className="navbar navbar-dark bg-dark mb-5">
                <div className="container">
                    <div className="d-flex align-items-center">
                        <button
                            onClick={() => navigate('/')}
                            className="btn btn-outline-secondary me-3"
                        >
                            <i className="bi bi-arrow-left me-1"></i> Home
                        </button>
                        <Link className="navbar-brand fw-bold" to="/">🏐 Admin Dashboard</Link>
                    </div>
                    <button onClick={logout} className="btn btn-danger btn-sm">Logout</button>
                </div>
            </nav>

            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-10">

                        {/* CREATE CARD */}
                        <div className="card shadow mb-5">
                            <div className="card-header bg-primary text-white">
                                <h4 className="mb-0">Create New Tournament</h4>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Tournament Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g. Winter Cup 2024"
                                        value={tName}
                                        onChange={(e) => setTName(e.target.value)}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold">Select Teams (Min 2)</label>
                                    <div className="card p-3 bg-light" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                        {teams.length === 0 ? (
                                            <div className="text-danger small">No teams found.</div>
                                        ) : (
                                            teams.map(team => (
                                                <div key={team.id} className="form-check mb-2">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        value={team.name}
                                                        checked={selectedTeams.includes(team.name)}
                                                        onChange={() => handleCheckboxChange(team.name)}
                                                        id={`team-${team.id}`}
                                                    />
                                                    <label className="form-check-label" htmlFor={`team-${team.id}`}>
                                                        {team.name}
                                                    </label>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <small className="text-muted">{selectedTeams.length} selected</small>
                                </div>

                                <div className="d-grid">
                                    <button onClick={createTournament} className="btn btn-success btn-lg">Generate Tournament</button>
                                </div>
                            </div>
                        </div>

                        {/* LIST CARD */}
                        <div className="card shadow">
                            <div className="card-header bg-dark text-white">
                                <h4 className="mb-0">Active Tournaments</h4>
                            </div>
                            <div className="card-body p-0">
                                <table className="table table-hover table-striped mb-0">
                                    <thead className="table-light">
                                    <tr>
                                        <th style={{ width: '50%' }}>Tournament Name</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {tournaments.length === 0 ? (
                                        <tr>
                                            <td colSpan="2" className="text-center text-muted py-4">
                                                No active tournaments. Create one above!
                                            </td>
                                        </tr>
                                    ) : (
                                        tournaments.map(t => (
                                            <tr key={t.id}>
                                                <td className="align-middle">
                                                    <strong>{t.tournamentName}</strong>
                                                </td>
                                                <td className="text-end">
                                                    <div className="action-buttons">
                                                        {/* VIEW BUTTON */}
                                                        <button
                                                            onClick={() => viewTournament(t.id)}
                                                            className="btn btn-primary btn-sm"
                                                            title="View tournament bracket"
                                                        >
                                                            <i className="bi bi-eye me-1"></i> View
                                                        </button>

                                                        {/* DELETE BUTTON */}
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => deleteTournament(t.id)}
                                                            title="Delete tournament"
                                                        >
                                                            <i className="bi bi-trash me-1"></i> Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}