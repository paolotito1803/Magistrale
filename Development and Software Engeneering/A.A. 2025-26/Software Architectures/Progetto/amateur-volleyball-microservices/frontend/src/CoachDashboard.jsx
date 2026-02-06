import React, { useEffect, useState, useCallback } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import { GATEWAY_URL } from './App';

export default function CoachDashboard() {

    const [myTeam, setMyTeam] = useState(null);
    const [loading, setLoading] = useState(true);


    const [availableRoles, setAvailableRoles] = useState([]);

    // Form States
    const [regName, setRegName] = useState('');
    const [pName, setPName] = useState('');
    const [pNum, setPNum] = useState('');


    const [pRole, setPRole] = useState('');

    // Edit Player State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingPlayer, setEditingPlayer] = useState(null);
    const [editPName, setEditPName] = useState('');
    const [editPNum, setEditPNum] = useState('');
    const [editPRole, setEditPRole] = useState('');

    // Stadium Form
    const [showStadiumModal, setShowStadiumModal] = useState(false);
    const [sName, setSName] = useState('');
    const [sSeats, setSSeats] = useState('');

    const navigate = useNavigate();
    const token = localStorage.getItem('jwt_token');
    const user = JSON.parse(localStorage.getItem('user_info') || '{}');

    const loadTeamData = useCallback(async () => {
        try {
            const res = await fetch(`${GATEWAY_URL}/teams`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const foundTeam = data.find(t => t.coachId === user.id);
                setMyTeam(foundTeam);

                if (foundTeam && foundTeam.stadium) {
                    setSName(foundTeam.stadium.name);
                    setSSeats(foundTeam.stadium.maxSeats);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [token, user.id]);


    const loadRoles = useCallback(async () => {
        try {
            const res = await fetch(`${GATEWAY_URL}/teams/players/roles`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const roles = await res.json();
                setAvailableRoles(roles);

                if (roles.length > 0) setPRole(roles[0]);
            }
        } catch (err) {
            console.error("Error loading roles:", err);
            // Fallback in caso di errore
            setAvailableRoles(["PLAYER", "SETTER", "LIBERO"]);
        }
    }, [token]);

    // 1. INITIAL LOAD
    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        if (user.role !== 'COACH') {
            alert("Access Denied: Not a Coach.");
            navigate('/login');
            return;
        }


        loadTeamData();
        loadRoles();

    }, [token, navigate, user.role, loadTeamData, loadRoles]);

    // 2. LOGOUT
    const logout = () => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_info');
        navigate('/');
    };

    // 3. REGISTER TEAM
    const registerTeam = async (e) => {
        e.preventDefault();
        const body = {
            coachId: user.id,
            coachName: `${user.username} ${user.surname || ''}`.trim(),
            teamName: regName
        };

        try {
            const res = await fetch(`${GATEWAY_URL}/teams/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-Auth-User-Id': user.id,
                    'X-Auth-Role': user.role },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                alert("Team Created Successfully!");
                await loadTeamData();
            } else {
                alert("Creation Error (Duplicate name?)");
            }
        } catch (error) {
            alert("Connection Error");
        }
    };

    // 4. ADD PLAYER
    const addPlayer = async (e) => {
        e.preventDefault();
        const playerDto = {
            name: pName,
            number: parseInt(pNum),
            role: pRole
        };

        try {
            const res = await fetch(`${GATEWAY_URL}/teams/${user.id}/players`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-Auth-User-Id': user.id,
                    'X-Auth-Role': user.role
                },
                body: JSON.stringify(playerDto)
            });

            if (res.ok) {
                alert("Player Added!");
                setPName(''); setPNum('');
                await loadTeamData();
            } else {
                const txt = await res.text();
                alert("Error: " + txt);
            }
        } catch (error) {
            alert("Connection Error");
        }
    };

    // DELETE PLAYER
    const deletePlayer = async (number) => {
        if (!window.confirm("Delete this player?")) return;

        const res = await fetch(`${GATEWAY_URL}/teams/${user.id}/players/${number}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Auth-User-Id': user.id,
                'X-Auth-Role': user.role
            }
        });

        if (res.ok) {
            alert("Player deleted!");
            loadTeamData();
        }
        else
            alert("Error: " + await res.text());
    };

    // UPDATE PLAYER
    const openEditModal = (player) => {
        setEditingPlayer(player);
        setEditPName(player.name);
        setEditPNum(player.number);
        setEditPRole(player.role);
        setShowEditModal(true);
    };

    const updatePlayer = async (e) => {
        e.preventDefault();
        const playerDto = { name: editPName, number: parseInt(editPNum), role: editPRole };
        try {
            const res = await fetch(`${GATEWAY_URL}/teams/${user.id}/players/${editingPlayer.number}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-Auth-User-Id': user.id,
                    'X-Auth-Role': user.role },
                body: JSON.stringify(playerDto)
            });
            if (res.ok) {
                setShowEditModal(false);
                await loadTeamData();
            } else
                alert("Error updating player.");
        } catch (err) { alert("Connection error."); }
    };

    // 5. UPDATE STADIUM
    const updateStadium = async (e) => {
        e.preventDefault();
        const body = {
            name: sName,
            maxSeats: parseInt(sSeats)
        };

        try {
            // Esempio di fix temporaneo nel Frontend
            const res = await fetch(`${GATEWAY_URL}/teams/${user.id}/stadium`, {
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
                alert("Stadium Updated Successfully!");
                setShowStadiumModal(false);
                await loadTeamData();
            } else {
                const txt = await res.text();
                alert("Update Error: " + txt);
            }
        } catch (error) {
            alert("Connection Error");
        }
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="bg-light min-vh-100 position-relative">
            <nav className="navbar navbar-dark bg-primary mb-5">
                <div className="container">
                    <div className="d-flex align-items-center">
                        <button
                            onClick={() => navigate('/')}
                            className="btn btn-outline-secondary me-3"
                        >
                            <i className="bi bi-arrow-left me-1"></i> Home
                        </button>
                        <Link className="navbar-brand fw-bold" to="/">🏐 Coach Dashboard</Link>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        <span className="text-white fw-bold">{user.username}</span>
                        <button onClick={logout} className="btn btn-outline-light btn-sm">Logout</button>
                    </div>
                </div>
            </nav>

            <div className="container">
                {!myTeam ? (
                    <div className="row justify-content-center">
                        <div className="col-md-6">
                            <div className="card shadow">
                                <div className="card-header bg-white">
                                    <h4>Welcome Coach!</h4>
                                    <p className="text-muted mb-0">You don't have a team yet. Create one now.</p>
                                </div>
                                <div className="card-body">
                                    <form onSubmit={registerTeam}>
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Team Name</label>
                                            <input
                                                type="text" className="form-control"
                                                placeholder="e.g. Tigers" required
                                                value={regName} onChange={e => setRegName(e.target.value)}
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-primary w-100">Register Team</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="card shadow mb-4 border-primary">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h2 className="text-primary fw-bold mb-0">{myTeam.name}</h2>
                                        <p className="text-muted mb-0">Coach: {myTeam.coachName}</p>
                                        <div className="mt-2">
                                            <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                                            <span className="badge bg-secondary">
                                                {myTeam.stadium ? `${myTeam.stadium.name} (${myTeam.stadium.maxSeats} seats)` : "Stadium not assigned"}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="btn btn-outline-primary" onClick={() => setShowStadiumModal(true)}>
                                        <i className="bi bi-pencil-square me-1"></i> Update Stadium
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-4">
                                <div className="card shadow mb-4">
                                    <div className="card-header bg-success text-white">
                                        <h5 className="mb-0">Add Player</h5>
                                    </div>
                                    <div className="card-body">
                                        <form onSubmit={addPlayer}>
                                            <div className="mb-2">
                                                <label className="form-label">Name</label>
                                                <input
                                                    type="text" className="form-control" required
                                                    value={pName} onChange={e => setPName(e.target.value)}
                                                />
                                            </div>
                                            <div className="mb-2">
                                                <label className="form-label">Number</label>
                                                <input
                                                    type="number" className="form-control" required
                                                    value={pNum} onChange={e => setPNum(e.target.value)}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Role</label>

                                                {}
                                                <select
                                                    className="form-select"
                                                    required
                                                    value={pRole}
                                                    onChange={e => setPRole(e.target.value)}
                                                >
                                                    {availableRoles.length === 0 && <option value="">Loading roles...</option>}

                                                    {availableRoles.map(role => (
                                                        <option key={role} value={role}>
                                                            {role}
                                                        </option>
                                                    ))}
                                                </select>

                                            </div>
                                            <button type="submit" className="btn btn-success w-100">Save Player</button>
                                        </form>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-8">
                                <div className="card shadow">
                                    <div className="card-header">
                                        <h5 className="mb-0">Roster</h5>
                                    </div>
                                    <div className="card-body p-0">
                                        <table className="table table-hover mb-0 align-middle">
                                            <thead className="table-light">
                                            <tr>
                                                <th>#</th>
                                                <th>Name</th>
                                                <th>Role</th>
                                                <th className="text-end">Actions</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {(!myTeam.players || myTeam.players.length === 0) ? (
                                                <tr><td colSpan="4" className="text-center p-4 text-muted">No players in roster.</td></tr>
                                            ) : (
                                                myTeam.players.sort((a,b) => a.number - b.number).map(p => (
                                                    <tr key={p.number}>
                                                        <td className="fw-bold">{p.number}</td>
                                                        <td>{p.name}</td>
                                                        <td><span className="badge bg-info text-dark">{p.role}</span></td>
                                                        <td className="text-end">
                                                            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEditModal(p)}>
                                                                <i className="bi bi-pencil">Edit</i>
                                                            </button>
                                                            <button className="btn btn-sm btn-outline-danger" onClick={() => deletePlayer(p.number)}>
                                                                <i className="bi bi-trash">Delete</i>
                                                            </button>
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
                )}
            </div>

            {/* STADIUM MODAL */}
            {showStadiumModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">Stadium Management</h5>
                                <button className="btn-close btn-close-white" onClick={() => setShowStadiumModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={updateStadium}>
                                    <div className="mb-3">
                                        <label className="form-label">Stadium Name</label>
                                        <input
                                            type="text" className="form-control" placeholder="Es. PalaVolley" required
                                            value={sName} onChange={e => setSName(e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Available Seats</label>
                                        <input
                                            type="number" className="form-control" placeholder="Es. 500" required min="10"
                                            value={sSeats} onChange={e => setSSeats(e.target.value)}
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100">Save Changes</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT PLAYER MODAL */}
            {showEditModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">Edit Player</h5>
                                <button className="btn-close btn-close-white" onClick={() => setShowEditModal(false)}></button>
                            </div>
                            <form onSubmit={updatePlayer}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Name</label>
                                        <input type="text" className="form-control" required value={editPName} onChange={e => setEditPName(e.target.value)} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Number</label>
                                        <input type="number" className="form-control" required value={editPNum} onChange={e => setEditPNum(e.target.value)} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Role</label>
                                        <select className="form-select" required value={editPRole} onChange={e => setEditPRole(e.target.value)}>
                                            {availableRoles.map(role => <option key={role} value={role}>{role}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Close</button>
                                    <button type="submit" className="btn btn-primary">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}