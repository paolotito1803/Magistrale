import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { GATEWAY_URL } from './App'; // Assuming this export exists based on Home.jsx

/**
 * AdminBracketView Component
 * Displays the tournament bracket and allows admins to manage matches.
 */
export default function AdminBracketView() {
    const { id } = useParams();
    const navigate = useNavigate();

    // --- STATE ---
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [matchesByStage, setMatchesByStage] = useState({});

    // Dropdown Data States
    const [refereesList, setRefereesList] = useState([]);
    const [stadiumsList, setStadiumsList] = useState([]);

    // Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        matchId: '',
        matchIndex: '',
        teamA: '',
        teamB: '',
        date: '',
        time: '',
        stadium: '',
        referee: '',
        scoreA: 0,
        scoreB: 0
    });

    const token = localStorage.getItem('jwt_token');

    // Constants
    const TIME_SLOTS = [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
        "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
        "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
        "21:00", "21:30", "22:00"
    ];

    // --- EFFECTS ---

    // 1. Check User Auth
    useEffect(() => {
        try {
            const userStr = localStorage.getItem('user_info');
            if (userStr) {
                const parsedUser = JSON.parse(userStr);
                setUser(parsedUser);
                setIsAdmin(parsedUser.role === 'ADMIN');
            }
        } catch (e) {
            console.error('Error parsing user info:', e);
        }
    }, [id]);

    // 2. Fetch Tournament Data & Aux Data
    const fetchData = useCallback(async () => {
        if (!id) return;
        setLoading(true);

        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = 'Bearer ' + token;

        try {
            // Fetch Tournament Details (including matches)
            const response = await fetch(`${GATEWAY_URL}/tournaments/id/${id}`, { headers });

            if (response.ok) {
                const data = await response.json();
                setTournament(data);
                processBracket(data.matches || []);
            } else {
                console.error("Failed to fetch tournament data");
            }

            // Fetch Aux Data (Referees/Stadiums) - Mocking endpoints based on structure
            // In a real scenario, you'd have endpoints like /api/users/referees or /api/stadiums
            const refResponse = await fetch(`${GATEWAY_URL}/users/referees`, { headers });
            if (refResponse.ok) setRefereesList(await refResponse.json());

            const stadResponse = await fetch(`${GATEWAY_URL}/tournaments/${id}/stadiums`, { headers });
            if (stadResponse.ok) setStadiumsList(await stadResponse.json());

        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    }, [id, token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- HELPERS ---

    const processBracket = (matches) => {
        const grouped = {};
        matches.forEach(match => {
            if (!grouped[match.stage]) {
                grouped[match.stage] = [];
            }
            grouped[match.stage].push(match);
        });
        setMatchesByStage(grouped);
    };

    const getStageName = (stageStr, teamCount, totalStages) => {
        const stageNum = parseInt(stageStr);
        if (teamCount === 16) {
            if (stageNum === 1) return 'Round of 16';
            if (stageNum === 2) return 'Quarter-finals';
            if (stageNum === 3) return 'Semi-finals';
            if (stageNum === 4) return 'Final';
        } else if (teamCount === 8) {
            if (stageNum === 1) return 'Quarter-finals';
            if (stageNum === 2) return 'Semi-finals';
            if (stageNum === 3) return 'Final';
        } else if (teamCount === 4) {
            if (stageNum === 1) return 'Semi-finals';
            if (stageNum === 2) return 'Final';
        } else if (teamCount === 2) {
            return 'Final';
        }

        if (stageNum === totalStages && totalStages > 1) return 'Final';
        if (stageNum === totalStages - 1 && totalStages > 2) return 'Semi-finals';
        return `Round ${stageNum}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleString('en-GB', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const logout = () => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_info');
        navigate('/');
    };

    // --- HANDLERS ---

    const handleSetWinner = async (matchId, teamName) => {
        if (!isAdmin) return;
        if (!teamName || teamName === 'Waiting...' || teamName === 'BYE') return;

        if (!window.confirm(`Declare ${teamName} as the winner?`)) return;

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': token ? 'Bearer ' + token : '',
            'X-Auth-User-Id': user.id,
            'X-Auth-Role': user.role
        };

        try {
            const response = await fetch(`${GATEWAY_URL}/tournaments/match/winner`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ matchId, winner: teamName })
            });

            if (response.ok) {
                await fetchData(); // Reload bracket
            } else {
                const text = await response.text();
                alert(`Error: ${text}`);
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    const openEditModal = (match) => {
        if (!isAdmin) {
            alert('Only administrators can edit match details.');
            return;
        }

        let dateStr = '';
        let timeStr = '';

        if (match.date) {
            const dateObj = new Date(match.date);
            // YYYY-MM-DD
            dateStr = dateObj.toISOString().split('T')[0];
            // HH:MM
            const hours = String(dateObj.getHours()).padStart(2, '0');
            const minutes = String(dateObj.getMinutes()).padStart(2, '0');
            timeStr = `${hours}:${minutes}`;
        }

        setEditForm({
            matchId: match.matchId,
            matchIndex: match.matchIndex,
            teamA: match.teamA || 'TBD',
            teamB: match.teamB || 'TBD',
            date: dateStr,
            time: timeStr,
            stadium: match.stadium || '',
            referee: match.referee || '',
            scoreA: match.scoreA || 0,
            scoreB: match.scoreB || 0
        });

        setShowEditModal(true);
    };

    const saveMatchChanges = async () => {
        const { matchId, date, time, stadium, referee, scoreA, scoreB } = editForm;

        if (!date || !time) {
            alert('Please select both date and time for the match.');
            return;
        }
        if (!stadium) {
            if (!window.confirm('WARNING: You are saving without assigning a stadium. Do you want to continue?')) {
                return;
            }
        }
        if (!referee) {
            if (!window.confirm('WARNING: You are saving without assigning a referee. Do you want to continue?')) {
                return;
            }
        }

        const dateTimeString = `${date}T${time}`;
        console.log("Invio data al backend:", dateTimeString);
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': token ? 'Bearer ' + token : '',
            'X-Auth-User-Id': user.id,
            'X-Auth-Role': user.role
        };

        const sendUpdate = async (url, payload, label) => {
            const response = await fetch(`${GATEWAY_URL}${url}`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`${label}: ${text}`);
            }
        };

        try {
            await sendUpdate(`/tournaments/match/stadium`, { matchId, newStadium: stadium }, 'Stadium');
            await sendUpdate('/tournaments/match/date', { matchId, date: dateTimeString }, 'Date');
            await sendUpdate('/tournaments/match/referee', { matchId, newReferee: referee }, 'Referee');
            await sendUpdate('/tournaments/match/score', { matchId, scoreA, scoreB }, 'Scores');

            alert('Match updated successfully!');
            setShowEditModal(false);
            await fetchData();
        } catch (error) {
            console.error('Update failed:', error);
            alert('Update failed: ' + error.message);
            await fetchData(); // Partial updates might have worked
        }
    };

    // --- CSS ---
    // Copied from the HTML head, converted to template literal for use in render
    const cssStyles = `
        .hero-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 0;
        }
        .bracket-container {
            display: flex;
            flex-direction: row;
            overflow-x: auto;
            gap: 30px;
            padding: 30px 20px;
            background-color: #f8f9fa;
            border-radius: 10px;
            min-height: 400px;
        }
        .stage-column {
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            min-width: 280px;
            padding: 0 15px;
        }
        .stage-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            margin-bottom: 25px;
            text-align: center;
            font-weight: 600;
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }
        .match-card {
            border: 2px solid #dee2e6;
            border-radius: 12px;
            margin-bottom: 25px;
            background-color: white;
            box-shadow: 0 3px 10px rgba(0,0,0,0.1);
            overflow: hidden;
            transition: all 0.3s;
            position: relative;
        }
        .match-card:hover {
            box-shadow: 0 5px 15px rgba(0,0,0,0.15);
            transform: translateY(-2px);
        }
        .match-header {
            background-color: #f8f9fa;
            padding: 8px 15px;
            border-bottom: 1px solid #dee2e6;
            text-align: center;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .match-index {
            font-size: 0.85rem;
            color: #6c757d;
            font-weight: 600;
        }
        .edit-match-btn {
            font-size: 0.75rem;
            padding: 2px 8px;
        }
        .team-row {
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: background 0.2s;
            position: relative;
            z-index: 10;
        }
        .team-row:not(:last-child) {
            border-bottom: 1px solid #dee2e6;
        }
        .team-name {
            font-weight: 500;
            font-size: 1rem;
            color: #212529;
        }
        /* ADMIN MODE: Clickable team rows */
        .team-row.clickable {
            cursor: pointer;
        }
        .team-row.clickable:hover:not(.locked):not(.waiting) {
            background-color: #e2e6ea;
        }
        /* State classes */
        .team-row.winner {
            background: linear-gradient(to right, #d4edda 0%, #ffffff 100%);
            border-left: 4px solid #28a745;
        }
        .team-row.winner .team-name {
            color: #155724;
            font-weight: 700;
        }
        .team-row.winner .winner-icon {
            color: #28a745;
            font-size: 1.2rem;
            margin-left: 10px;
        }
        .team-row.waiting {
            background-color: #fff9e6;
            border-left: 4px solid #ffc107;
        }
        .team-row.waiting .team-name {
            color: #856404;
            font-style: italic;
        }
        .team-row.loser {
            opacity: 0.6;
            background-color: #f8f9fa;
        }
        .team-row.loser .team-name {
            color: #6c757d;
            text-decoration: line-through;
        }
        .team-row.locked {
            pointer-events: none !important;
            opacity: 0.8;
        }
        .badge-bye {
            background-color: #6c757d;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        .match-score {
            font-size: 1.1rem;
            font-weight: 700;
            color: #667eea;
            min-width: 30px;
            text-align: center;
        }
        .stage-connector {
            border-right: 2px dashed #dee2e6;
            margin-right: 15px;
        }
        .legend {
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .legend-item {
            display: inline-flex;
            align-items: center;
            margin-right: 25px;
            margin-bottom: 10px;
        }
        .legend-box {
            width: 40px;
            height: 30px;
            border-radius: 5px;
            margin-right: 10px;
            border: 1px solid #dee2e6;
        }
        .legend-winner {
            background: linear-gradient(to right, #d4edda 0%, #ffffff 100%);
            border-left: 4px solid #28a745;
        }
        .legend-waiting {
            background-color: #fff9e6;
            border-left: 4px solid #ffc107;
        }
        .legend-loser {
            background-color: #f8f9fa;
            opacity: 0.6;
        }
        .admin-badge {
            background-color: #dc3545;
            color: white;
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 0.85rem;
            font-weight: 600;
        }
        .match-info-section {
            background-color: #f8f9fa;
            padding: 10px 15px;
            border-top: 1px solid #dee2e6;
            font-size: 0.85rem;
        }
        .match-info-item {
            display: flex;
            align-items: center;
            margin-bottom: 5px;
        }
        .match-info-item:last-child {
            margin-bottom: 0;
        }
        .match-info-item i {
            margin-right: 8px;
            width: 20px;
            text-align: center;
        }
        .time-picker-group {
            display: flex;
            gap: 10px;
            align-items: center;
        }
        /* Modal visibility utilities for React */
        .modal.show {
            display: block;
            background-color: rgba(0,0,0,0.5);
        }
    `;

    console.log("Tournament Data:", tournament);

    return (
        <div className="bg-light min-vh-100 font-sans">
            {/* Inject CSS */}
            <style>{cssStyles}</style>

            {/* NAVBAR */}
            <nav className="navbar navbar-dark bg-dark mb-0">
                <div className="container">
                    <div className="d-flex align-items-center">
                        <button
                            onClick={() => navigate('/')}
                            className="btn btn-outline-secondary me-3"
                        >
                            <i className="bi bi-arrow-left me-1"></i> Home
                        </button>
                        <Link className="navbar-brand fw-bold" to="/">🏐 Volleyball Tournament</Link>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        {user && <span className="text-white">Hello, {user.username}!</span>}
                        {user && (
                            <button onClick={logout} className="btn btn-danger btn-sm">Logout</button>
                        )}
                    </div>
                </div>
            </nav>

            {/* HERO SECTION */}
            <section className="hero-section">
                <div className="container">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 className="mb-2 fw-bold">
                                {tournament ? tournament.tournamentName : 'Tournament Bracket'}
                            </h2>
                            <p className="mb-0 opacity-75">
                                <span>{tournament && tournament.teams ? tournament.teams.length : 0}</span> Teams •
                                <span>{tournament && tournament.matches ? tournament.matches.length : 0}</span> Total Matches
                            </p>
                        </div>
                        <div>
                            <Link to="/admin" className="btn btn-light">
                                ← Back to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* MAIN CONTENT */}
            <div className="container-fluid py-4">
                {/* LOADING */}
                {loading && (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                        <p className="mt-3">Loading bracket...</p>
                    </div>
                )}

                {!loading && (
                    <div id="bracket-view">
                        {/* LEGEND */}
                        <div className="legend">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="mb-0">Legend</h5>
                                {isAdmin && (
                                    <div id="admin-notice">
                                        <span className="badge bg-danger">🔓 Admin Mode: Click teams to set winner or Edit match details</span>
                                    </div>
                                )}
                            </div>
                            <div className="d-flex flex-wrap">
                                <div className="legend-item">
                                    <div className="legend-box legend-winner"></div>
                                    <span>🏆 Winner</span>
                                </div>
                                <div className="legend-item">
                                    <div className="legend-box legend-waiting"></div>
                                    <span>⏳ Waiting for Opponent</span>
                                </div>
                                <div className="legend-item">
                                    <div className="legend-box legend-loser"></div>
                                    <span>❌ Eliminated</span>
                                </div>
                            </div>
                        </div>

                        {/* BRACKET RENDER */}
                        {Object.keys(matchesByStage).length > 0 ? (
                            <div className="bracket-container">
                                {Object.keys(matchesByStage)
                                    .sort((a, b) => a - b)
                                    .map((stage, index, stages) => {
                                        const stageMatches = matchesByStage[stage].sort((a, b) => a.matchIndex - b.matchIndex);
                                        const teamCount = tournament.teams ? tournament.teams.length : 0;
                                        const stageName = getStageName(stage, teamCount, stages.length);
                                        const isLastStage = index === stages.length - 1;

                                        return (
                                            <div key={stage} className={`stage-column ${!isLastStage ? 'stage-connector' : ''}`}>
                                                <div className="stage-header">
                                                    <h5 className="mb-0">{stageName}</h5>
                                                </div>

                                                {stageMatches.map(match => {
                                                    const isMatchReady = match.teamA && match.teamA !== '' && match.teamB && match.teamB !== '';
                                                    const hasWinner = match.winner && match.winner !== '';

                                                    // Team Row Helper
                                                    const renderTeamRow = (teamName, score, isTeamWinner) => {
                                                        const isLoser = hasWinner && !isTeamWinner;
                                                        const isWaiting = !teamName || teamName === '' || (!hasWinner && !isMatchReady);
                                                        const isLocked = hasWinner || !isMatchReady;

                                                        let rowClass = "team-row";
                                                        // Only clickable if admin, not locked (not winner decided yet), not waiting for team
                                                        if (isAdmin && !hasWinner && !isWaiting && teamName && teamName !== 'BYE') {
                                                            rowClass += " clickable";
                                                        }

                                                        if (isTeamWinner) rowClass += " winner";
                                                        else if (isLoser) rowClass += " loser";
                                                        else if (isWaiting) rowClass += " waiting";
                                                        if (isLocked) rowClass += " locked";

                                                        return (
                                                            <div
                                                                className={rowClass}
                                                                onClick={() => {
                                                                    if (rowClass.includes('clickable')) handleSetWinner(match.matchId, teamName);
                                                                }}
                                                            >
                                                                <span className="team-name">
                                                                    {teamName && teamName !== '' ? teamName : 'Waiting...'}
                                                                </span>

                                                                {teamName === 'BYE' ? (
                                                                    <span className="badge-bye">BYE</span>
                                                                ) : (
                                                                    <>
                                                                        {isTeamWinner && <span className="winner-icon">🏆</span>}
                                                                        <span className="match-score">{score !== undefined ? score : 0}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        );
                                                    };

                                                    return (
                                                        <div key={match.matchId} className="match-card">
                                                            <div className="match-header">
                                                                <span className="match-index">Match #{match.matchIndex}</span>
                                                                {isAdmin && (
                                                                    <button
                                                                        className="btn btn-warning btn-sm edit-match-btn"
                                                                        onClick={(e) => { e.stopPropagation(); openEditModal(match); }}
                                                                    >
                                                                        <i className="bi bi-pencil"></i> Edit
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {/* Team A */}
                                                            {renderTeamRow(match.teamA, match.scoreA, hasWinner && match.winner === match.teamA)}

                                                            {/* Team B */}
                                                            {renderTeamRow(match.teamB, match.scoreB, hasWinner && match.winner === match.teamB)}

                                                            {/* Info Section */}
                                                            {(match.matchDate || match.stadium || match.referee) && (
                                                                <div className="match-info-section">
                                                                    {match.matchDate && (
                                                                        <div className="match-info-item">
                                                                            <i className="bi bi-calendar-event text-primary"></i>
                                                                            <span>{formatDate(match.matchDate)}</span>
                                                                        </div>
                                                                    )}
                                                                    {match.stadium && (
                                                                        <div className="match-info-item">
                                                                            <i className="bi bi-geo-alt text-danger"></i>
                                                                            <span>{match.stadium}</span>
                                                                        </div>
                                                                    )}
                                                                    {match.referee && (
                                                                        <div className="match-info-item">
                                                                            <i className="bi bi-person-badge text-primary"></i>
                                                                            <span>{match.referee}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                            </div>
                        ) : (
                            <div className="alert alert-warning text-center">
                                <i className="bi bi-exclamation-triangle"></i> No matches found for this tournament.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* EDIT MATCH MODAL */}
            {/* Using a manually controlled standard Bootstrap Modal structure */}
            <div className={`modal fade ${showEditModal ? 'show' : ''}`} tabIndex="-1" role="dialog" aria-hidden={!showEditModal}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header bg-primary text-white">
                            <h5 className="modal-title">
                                <i className="bi bi-pencil-square"></i> Edit Match Details
                            </h5>
                            <button type="button" className="btn-close btn-close-white" onClick={() => setShowEditModal(false)}></button>
                        </div>
                        <div className="modal-body">
                            <form id="editMatchForm">
                                {/* Match Info Display */}
                                <div className="alert alert-info mb-4">
                                    <strong>Match:</strong> <span>{editForm.teamA} vs {editForm.teamB}</span><br />
                                    <strong>Match #:</strong> <span>{editForm.matchIndex}</span>
                                </div>

                                {/* Date and Time Selection */}
                                <div className="mb-3">
                                    <label className="form-label fw-bold">
                                        <i className="bi bi-calendar-event"></i> Match Date & Time
                                    </label>
                                    <div className="time-picker-group">
                                        <input
                                            type="date"
                                            className="form-control"
                                            style={{ flex: 1 }}
                                            value={editForm.date}
                                            onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                                            required
                                        />
                                        <select
                                            className="form-select"
                                            style={{ width: '120px' }}
                                            value={editForm.time}
                                            onChange={(e) => setEditForm({...editForm, time: e.target.value})}
                                            required
                                        >
                                            <option value="">Time...</option>
                                            {TIME_SLOTS.map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                            {/* Handle custom times that might come from DB but not in list */}
                                            {editForm.time && !TIME_SLOTS.includes(editForm.time) && (
                                                <option value={editForm.time}>{editForm.time}</option>
                                            )}
                                        </select>
                                    </div>
                                    <small className="text-muted">Set the date and time for this match</small>
                                </div>

                                {/* Stadium Selection */}
                                <div className="mb-3">
                                    <label className="form-label fw-bold">
                                        <i className="bi bi-geo-alt"></i> Stadium
                                    </label>
                                    <select
                                        className="form-select"
                                        value={editForm.stadium}
                                        onChange={(e) => setEditForm({...editForm, stadium: e.target.value})}
                                        required
                                    >
                                        <option value="">-- Select Stadium --</option>

                                        {stadiumsList && stadiumsList.length > 0 ? (
                                            stadiumsList.map((stadium, index) => (
                                                <option key={`stad-${index}`} value={stadium.name}>
                                                    {stadium.name}
                                                </option>
                                            ))
                                        ) : (
                                            <option disabled>No stadiums available</option>
                                        )}

                                        {editForm.stadium && stadiumsList && !stadiumsList.some(s => s.name === editForm.stadium) && (
                                            <option key="custom-stad" value={editForm.stadium}>
                                                {editForm.stadium} (Current)
                                            </option>
                                        )}
                                    </select>
                                    <small className="text-muted">Choose the venue for this match</small>
                                </div>

                                {/* Referee Selection */}
                                <div className="mb-3">
                                    <label className="form-label fw-bold">
                                        <i className="bi bi-person-badge"></i> Referee
                                    </label>
                                    <select
                                        className="form-select"
                                        value={editForm.referee}
                                        onChange={(e) => setEditForm({...editForm, referee: e.target.value})}
                                        required
                                    >
                                        <option value="">-- Select Referee --</option>
                                        {refereesList.map(ref => (
                                            <option key={ref.id} value={`${ref.surname} ${ref.username}`}>
                                                {ref.surname} {ref.username}
                                            </option>
                                        ))}
                                        {/* Handle custom referees */}
                                        {editForm.referee && !refereesList.some(r => `${r.surname} ${r.username}` === editForm.referee) && (
                                            <option value={editForm.referee}>{editForm.referee}</option>
                                        )}
                                    </select>
                                    <small className="text-muted">Assign a referee to this match</small>
                                </div>

                                {/* Scores Section */}
                                <div className="card mb-3">
                                    <div className="card-header bg-light">
                                        <h6 className="mb-0">
                                            <i className="bi bi-trophy"></i> Match Scores
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <label className="form-label">Team A Score</label>
                                                <div className="input-group">
                                                    <span className="input-group-text">{editForm.teamA}</span>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        min="0"
                                                        value={editForm.scoreA}
                                                        onChange={(e) => setEditForm({...editForm, scoreA: parseInt(e.target.value) || 0})}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Team B Score</label>
                                                <div className="input-group">
                                                    <span className="input-group-text">{editForm.teamB}</span>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        min="0"
                                                        value={editForm.scoreB}
                                                        onChange={(e) => setEditForm({...editForm, scoreB: parseInt(e.target.value) || 0})}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </form>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                                <i className="bi bi-x-circle"></i> Cancel
                            </button>
                            <button type="button" className="btn btn-success" onClick={saveMatchChanges}>
                                <i className="bi bi-check-circle"></i> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Backdrop for modal */}
            {showEditModal && <div className="modal-backdrop fade show"></div>}
        </div>
    );
}