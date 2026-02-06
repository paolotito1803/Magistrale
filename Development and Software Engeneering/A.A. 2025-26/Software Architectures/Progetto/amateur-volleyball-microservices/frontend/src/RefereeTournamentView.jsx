import React, { useEffect, useState, useCallback } from 'react';
import {useParams, Link, useNavigate} from 'react-router-dom';
import { GATEWAY_URL } from './App';

export default function RefereeTournamentView() {
    const { id } = useParams();

    // State
    const [tournament, setTournament] = useState(null);
    const [matchesByStage, setMatchesByStage] = useState({});
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        matchId: '',
        teamA: '',
        teamB: '',
        scoreA: 0,
        scoreB: 0,
        winner: null // To track current winner status logic in modal
    });

    const token = localStorage.getItem('jwt_token');

    // --- CSS STYLES (Ported from HTML) ---
    const customStyles = `
        :root {
            --primary-color: #4e73df;
            --secondary-color: #858796;
            --success-color: #1cc88a;
        }
        .hero-header {
            background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);
            color: white;
            padding: 3rem 0;
            margin-bottom: 2rem;
            border-bottom: 5px solid #1cc88a;
        }
        .info-card {
            border: none;
            border-radius: 15px;
            box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
        }
        .match-item {
            border-left: 4px solid #4e73df;
            margin-bottom: 1.5rem;
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            transition: all 0.3s;
        }
        .match-item:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.12);
            transform: translateY(-2px);
        }
        .match-item.disabled-card {
            opacity: 0.8; /* Slightly dimmed but readable */
            border-left-color: #dee2e6;
        }
        .stage-title {
            color: #4e73df;
            font-weight: 700;
            border-bottom: 2px solid #e3e6f0;
            padding-bottom: 0.5rem;
            margin-top: 2rem;
        }
        .score-display {
            font-size: 1.5rem;
            font-weight: 800;
            color: #2e59d9;
            min-width: 80px;
            text-align: center;
            background: linear-gradient(135deg, #f8f9fc 0%, #e3e6f0 100%);
            padding: 0.5rem;
            border-radius: 8px;
        }
        .winner-label {
            color: #1cc88a;
            font-weight: bold;
            font-size: 0.8rem;
            display: inline-block;
            margin-top: 0.25rem;
        }
        .match-header {
            background: linear-gradient(to right, #f8f9fc, transparent);
            padding: 0.75rem 1rem;
            margin: -1.5rem -1.5rem 1rem -1.5rem;
            border-radius: 8px 8px 0 0;
            border-bottom: 2px solid #e3e6f0;
        }
        .match-detail-item {
            display: flex;
            align-items: center;
            padding: 0.5rem 0;
            border-bottom: 1px solid #f1f3f5;
        }
        .match-detail-label {
            font-size: 0.75rem;
            text-transform: uppercase;
            color: #858796;
            font-weight: 600;
            letter-spacing: 0.5px;
        }
        .match-detail-value {
            font-size: 0.95rem;
            color: #2e3338;
            font-weight: 500;
        }
        .seats-badge {
            padding: 0.35rem 0.75rem;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
        }
        .seats-available { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .seats-low { background-color: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
        .seats-full { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .team-vs-section {
            background-color: #f8f9fc;
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
        }
        /* Modal Specifics */
        .score-input {
            font-size: 2rem;
            font-weight: 800;
            text-align: center;
            border: 3px solid #dee2e6;
            border-radius: 10px;
            height: 80px;
        }
        .score-input:focus { border-color: #ffc107; box-shadow: 0 0 0 0.25rem rgba(255, 193, 7, 0.25); outline: none; }
        .winner-badge {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        .declare-winner-btn {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            border: none; color: white; padding: 0.5rem 1rem;
            border-radius: 8px; font-weight: 600; font-size: 0.85rem;
            box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
        }
    `;

    // --- DATA LOADING ---
    const loadTournamentData = useCallback(async () => {
        setLoading(true);
        try {
            // Get User Info
            const userStr = localStorage.getItem('user_info');
            const currentUser = userStr ? JSON.parse(userStr) : null;
            setUser(currentUser);

            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const res = await fetch(`${GATEWAY_URL}/tournaments/id/${id}`, { headers });

            if (!res.ok) throw new Error("Error loading tournament");

            const data = await res.json();
            setTournament(data);

            const grouped = {};
            if (data.matches) {
                // Logic: Show ALL matches, grouping logic remains the same
                data.matches.forEach(m => {
                    if (!grouped[m.stage]) grouped[m.stage] = [];
                    grouped[m.stage].push(m);
                });

                // Sort by match index within stage
                Object.keys(grouped).forEach(stage => {
                    grouped[stage].sort((a, b) => a.matchIndex - b.matchIndex);
                });
            }
            setMatchesByStage(grouped);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id, token]);

    useEffect(() => {
        loadTournamentData();
    }, [loadTournamentData]);

    // --- HELPERS ---
    const getStageName = (stage) => {
        const s = parseInt(stage);
        if (s === 1) return 'Round 1';
        if (s === 2) return 'Quarter-finals';
        if (s === 3) return 'Semi-finals';
        if (s === 4) return 'Final';
        return `Stage ${s}`;
    };

    const formatDate = (dateArr) => {
        if (!dateArr) return 'To Be Determined';
        if (Array.isArray(dateArr)) {
            const date = new Date(dateArr[0], dateArr[1] - 1, dateArr[2], dateArr[3] || 0, dateArr[4] || 0);
            return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        }
        return new Date(dateArr).toLocaleString();
    };

    // Permission Logic
    const isMyMatch = (match) => {
        if (!user) return false;
        const myFullName = `${user.surname} ${user.username}`;
        // Check if referee string matches. Note: Handling potential formatting differences
        return match.referee === myFullName;
    };

    const isMatchFinished = (match) => {
        return match.winner && match.winner !== '' && match.winner !== 'null';
    };

    // --- ACTION HANDLERS ---
    const openEditModal = (match) => {
        setEditForm({
            matchId: match.matchId,
            teamA: match.teamA || 'TBD',
            teamB: match.teamB || 'TBD',
            scoreA: match.scoreA || 0,
            scoreB: match.scoreB || 0,
            winner: null
        });
        setShowEditModal(true);
    };

    // Just update score (no winner)
    const handleSaveScore = async () => {
        if (!window.confirm(`Save score:\n${editForm.teamA} ${editForm.scoreA} - ${editForm.scoreB} ${editForm.teamB}\n\nNote: This will NOT declare a winner yet.`)) return;

        try {
            const response = await fetch(`${GATEWAY_URL}/tournaments/match/score`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    matchId: editForm.matchId,
                    scoreA: editForm.scoreA,
                    scoreB: editForm.scoreB
                })
            });

            if (response.ok) {
                setShowEditModal(false);
                loadTournamentData();
            } else {
                alert("Error updating score");
            }
        } catch (error) {
            alert("Error: " + error.message);
        }
    };

    // Declare winner
    const handleDeclareWinner = async (winningTeamName) => {
        const { matchId, scoreA, scoreB, teamA, teamB } = editForm;

        // Validate scores
        if ((winningTeamName === teamA && scoreA <= scoreB) || (winningTeamName === teamB && scoreB <= scoreA)) {
            alert("The winning team must have a higher score!");
            return;
        }

        if (!window.confirm(`DECLARE WINNER:\n${teamA} ${scoreA} - ${scoreB} ${teamB}\n\nWinner: ${winningTeamName}\n\nThis action will finalize the match!`)) return;

        try {
            // 1. Save Score first
            await fetch(`${GATEWAY_URL}/tournaments/match/score`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ matchId, scoreA, scoreB })
            });

            // 2. Set Winner
            const response = await fetch(`${GATEWAY_URL}/tournaments/match/winner`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ matchId, winner: winningTeamName })
            });

            if (response.ok) {
                setShowEditModal(false);
                loadTournamentData();
            } else {
                const txt = await response.text();
                alert("Error declaring winner: " + txt);
            }
        } catch (error) {
            alert("Error: " + error.message);
        }
    };

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

    const sortedStages = Object.keys(matchesByStage).sort((a, b) => a - b);

    return (
        <div className="bg-light min-vh-100 font-inter">
            {/* Inject Custom CSS */}
            <style>{customStyles}</style>

            <nav className="navbar navbar-dark bg-dark shadow-sm">
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
                </div>
            </nav>

            <header className="hero-header">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-md-8 text-center text-md-start">
                            <h1 className="display-4 fw-bold">{tournament?.tournamentName}</h1>
                            <p className="lead mb-0">
                                <i className="fas fa-users me-2"></i>
                                {tournament?.teams?.length || 0} Registered Teams
                            </p>
                        </div>
                        <div className="col-md-4 text-center text-md-end mt-3 mt-md-0">
                            <Link to={`/tournament/${id}/bracket_view`} className="btn btn-light btn-lg shadow-sm">
                                <i className="fas fa-sitemap me-2"></i>View Full Bracket
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mb-5">
                <div className="row">
                    {/* Left Sidebar: Participating Teams */}
                    <div className="col-lg-4 mb-4">
                        <div className="card info-card bg-white">
                            <div className="card-header bg-white py-3 border-0">
                                <h5 className="m-0 font-weight-bold text-primary">Participating Teams</h5>
                            </div>
                            <div className="card-body p-0">
                                <ul className="list-group list-group-flush">
                                    {tournament?.teams?.map((team, index) => (
                                        <li key={index} className="list-group-item d-flex align-items-center border-0 py-2">
                                            <i className="fas fa-shield-alt text-secondary me-3"></i>
                                            <span className="fw-medium">{team.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Main Content: All Matches */}
                    <div className="col-lg-8">
                        <h3 className="mb-4 text-dark fw-bold">
                            <i className="fas fa-calendar-alt me-2 text-primary"></i>Match Schedule - Referee View
                        </h3>

                        {sortedStages.length === 0 ? (
                            <div className="alert alert-info shadow-sm">
                                <i className="fas fa-info-circle me-2"></i>
                                The schedule for this tournament has not been generated yet.
                            </div>
                        ) : (
                            sortedStages.map((stage) => (
                                <div key={stage}>
                                    <h4 className="stage-title">
                                        <i className="fas fa-layer-group me-2"></i>
                                        {getStageName(stage)}
                                    </h4>

                                    {matchesByStage[stage].map((match) => {
                                        const finished = isMatchFinished(match);
                                        const assignedToMe = isMyMatch(match);

                                        // Card visuals: Dimmed if I can't edit it or if it's finished (unless I finished it)
                                        // Logic from HTML: .disabled class if referee doesn't match
                                        const cardClass = `match-item ${!assignedToMe ? 'disabled-card' : ''}`;

                                        return (
                                            <div key={match.matchId} className={cardClass}>

                                                {/* Match Header */}
                                                <div className="match-header">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div><strong className="text-primary"><i className="fas fa-hashtag me-1"></i>Match {match.matchIndex}</strong></div>
                                                        <div>
                                                            {finished ? (
                                                                <span className="badge bg-success me-2"><i className="fas fa-trophy me-1"></i>Completed</span>
                                                            ) : (
                                                                <span className="badge bg-warning text-dark me-2"><i className="fas fa-clock me-1"></i>Upcoming</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Team VS Section */}
                                                <div className="team-vs-section">
                                                    <div className="row align-items-center text-center">
                                                        <div className="col-5">
                                                            <div className="fw-bold fs-5 text-dark">{match.teamA || 'TBD'}</div>
                                                            {finished && match.winner === match.teamA && (
                                                                <span className="winner-label"><i className="fas fa-trophy"></i> WINNER</span>
                                                            )}
                                                        </div>

                                                        <div className="col-2">
                                                            <div className="score-display">{match.scoreA} : {match.scoreB}</div>
                                                            <div className="text-muted small fw-bold mt-1">VS</div>
                                                        </div>

                                                        <div className="col-5">
                                                            <div className="fw-bold fs-5 text-dark">{match.teamB || 'TBD'}</div>
                                                            {finished && match.winner === match.teamB && (
                                                                <span className="winner-label"><i className="fas fa-trophy"></i> WINNER</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Area (Buttons/Badges) */}
                                                <div className="text-center mt-3 mb-4">
                                                    {assignedToMe && !finished && (
                                                        <button className="btn btn-warning btn-sm fw-bold shadow-sm px-4" onClick={() => openEditModal(match)}>
                                                            <i className="fas fa-pencil-alt me-1"></i> Enter Score
                                                        </button>
                                                    )}

                                                    {assignedToMe && finished && (
                                                        <span className="badge bg-success p-2 rounded-pill">
                                                            <i className="fas fa-check-circle me-1"></i>Match Finalized
                                                        </span>
                                                    )}

                                                    {!assignedToMe && (
                                                        <span className="badge bg-secondary p-2 rounded-pill">
                                                            <i className="fas fa-lock me-1"></i>Not your match
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Details Grid */}
                                                <div className="row pt-2 border-top g-3">
                                                    <div className="col-md-6">
                                                        <div className="match-detail-item border-0">
                                                            <div>
                                                                <div className="match-detail-label">Stadium</div>
                                                                <div className="match-detail-value">{match.stadium || 'Not assigned'}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="match-detail-item border-0">
                                                            <div>
                                                                <div className="match-detail-label">Referee</div>
                                                                <div className="match-detail-value">{match.referee || 'Not assigned'}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="match-detail-item border-0">
                                                            <div>
                                                                <div className="match-detail-label">Date & Time</div>
                                                                <div className="match-detail-value">{formatDate(match.matchDate)}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="match-detail-item border-0">
                                                            <div className="d-flex align-items-center justify-content-between w-100">
                                                                <div>
                                                                    <div className="match-detail-label">Available Seats</div>
                                                                    <div className="match-detail-value">{match.freeSeats || 0} seats</div>
                                                                </div>
                                                                <div>
                                                                    {match.freeSeats > 50 && <span className="seats-badge seats-available"><i className="fas fa-check-circle me-1"></i>Available</span>}
                                                                    {match.freeSeats > 0 && match.freeSeats <= 50 && <span className="seats-badge seats-low"><i className="fas fa-exclamation-triangle me-1"></i>Low Stock</span>}
                                                                    {match.freeSeats <= 0 && <span className="seats-badge seats-full"><i className="fas fa-times-circle me-1"></i>Sold Out</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            {/* YELLOW HEADER MODAL (Like HTML) */}
            {showEditModal && (
                <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.6)'}}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header bg-warning text-dark">
                                <h5 className="modal-title fw-bold"><i className="fas fa-clipboard-list me-2"></i>Enter Match Score</h5>
                                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="row text-center align-items-start">
                                    {/* Team A Input */}
                                    <div className="col-5">
                                        <label className="d-block mb-2 fw-bold text-truncate">{editForm.teamA}</label>
                                        <input type="number" className="form-control score-input"
                                               value={editForm.scoreA}
                                               min="0"
                                               onChange={e => setEditForm({...editForm, scoreA: parseInt(e.target.value) || 0})}/>

                                        {/* Dynamic Winner Indicator Team A */}
                                        <div className="mt-3" style={{minHeight: '40px'}}>
                                            {editForm.scoreA > editForm.scoreB && editForm.scoreA > 0 && (
                                                <>
                                                    <span className="winner-badge d-block mb-2"><i className="fas fa-trophy me-1"></i>Leading</span>
                                                    <button className="declare-winner-btn" onClick={() => handleDeclareWinner(editForm.teamA)}>
                                                        <i className="fas fa-check me-1"></i>Declare Winner
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* VS Divider */}
                                    <div className="col-2 pt-4">
                                        <div className="h2 fw-bold text-secondary">VS</div>
                                    </div>

                                    {/* Team B Input */}
                                    <div className="col-5">
                                        <label className="d-block mb-2 fw-bold text-truncate">{editForm.teamB}</label>
                                        <input type="number" className="form-control score-input"
                                               value={editForm.scoreB}
                                               min="0"
                                               onChange={e => setEditForm({...editForm, scoreB: parseInt(e.target.value) || 0})}/>

                                        {/* Dynamic Winner Indicator Team B */}
                                        <div className="mt-3" style={{minHeight: '40px'}}>
                                            {editForm.scoreB > editForm.scoreA && editForm.scoreB > 0 && (
                                                <>
                                                    <span className="winner-badge d-block mb-2"><i className="fas fa-trophy me-1"></i>Leading</span>
                                                    <button className="declare-winner-btn" onClick={() => handleDeclareWinner(editForm.teamB)}>
                                                        <i className="fas fa-check me-1"></i>Declare Winner
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer bg-light justify-content-between">
                                <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                                    <i className="fas fa-times me-1"></i> Cancel
                                </button>
                                <button className="btn btn-primary fw-bold" onClick={handleSaveScore}>
                                    <i className="fas fa-save me-1"></i> Save Score
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}