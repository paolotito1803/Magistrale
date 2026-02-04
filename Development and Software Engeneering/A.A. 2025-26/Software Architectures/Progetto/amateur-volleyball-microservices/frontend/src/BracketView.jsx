import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { GATEWAY_URL } from './App';

/**
 * BracketView Component
 * Renders a read-only view of the tournament bracket.
 * Displays stages, matches, and winners with a professional layout.
 */
export default function BracketView() {
    const { id } = useParams();
    const navigate = useNavigate();

    // --- STATE ---
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState({});

    const token = localStorage.getItem('jwt_token');

    // --- INITIALIZATION ---
    useEffect(() => {
        const storedUser = localStorage.getItem('user_info');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        loadBracketData();
    }, [id]);

    const loadBracketData = async () => {
        setLoading(true);
        try {
            const headers = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch(`${GATEWAY_URL}/tournaments/id/${id}`, { headers });
            if (response.ok) {
                const data = await response.json();
                setTournament(data);
            } else {
                console.error("Failed to fetch tournament data");
            }
        } catch (error) {
            console.error("Error loading bracket:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- LOGIC: Grouping Matches by Stage ---
    const matchesByStage = useMemo(() => {
        if (!tournament || !tournament.matches) return {};

        const grouped = {};
        tournament.matches.forEach(match => {
            if (!grouped[match.stage]) {
                grouped[match.stage] = [];
            }
            grouped[match.stage].push(match);
        });

        // Sort matches within each stage by matchIndex
        Object.keys(grouped).forEach(stage => {
            grouped[stage].sort((a, b) => a.matchIndex - b.matchIndex);
        });

        return grouped;
    }, [tournament]);

    const getStageName = (stage, teamCount, totalStages) => {
        const stageNum = parseInt(stage);

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

    const logout = () => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_info');
        navigate('/');
    };

    // --- RENDER HELPERS ---
    const renderTeamRow = (match, teamName, score, isWinner, isLoser, isWaiting) => {
        let rowClass = "team-row";
        if (isWinner) rowClass += " winner";
        else if (isLoser) rowClass += " loser";
        else if (isWaiting || !teamName) rowClass += " waiting";

        return (
            <div className={rowClass}>
                <span className="team-name">{teamName || 'Waiting...'}</span>
                {teamName === 'BYE' ? (
                    <span className="badge-bye">BYE</span>
                ) : (
                    <>
                        {isWinner && <span className="winner-icon">🏆</span>}
                        <span className="match-score">{score ?? 0}</span>
                    </>
                )}
            </div>
        );
    };

    const isReferee = user?.role === 'REFEREE';
    const targetUrl = isReferee
        ? `/tournament/${id}/referee_tournament_view`
        : `/tournament/${id}/view`;

    return (
        <div className="bg-light min-vh-100">
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
                        <span className="text-white">Hello, {user.username || 'Guest'}!</span>
                        {token && (
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
                            <h2 className="mb-2 fw-bold">{tournament?.tournamentName || 'Tournament Bracket'}</h2>
                            <p className="mb-0 opacity-75">
                                {tournament?.teams?.length || 0} Teams • {tournament?.matches?.length || 0} Total Matches
                            </p>
                        </div>
                        <div>
                            <Link to={targetUrl} className="btn btn-light">← Back to View</Link>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container-fluid py-4">
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                        <p className="mt-3">Loading tournament bracket...</p>
                    </div>
                ) : (
                    <div id="bracket-view">
                        {/* LEGEND */}
                        <div className="legend mb-4">
                            <h5 className="mb-3">Tournament Legend</h5>
                            <div className="d-flex flex-wrap gap-4">
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

                        {/* BRACKET CONTAINER */}
                        <div className="bracket-container">
                            {Object.keys(matchesByStage).length > 0 ? (
                                Object.keys(matchesByStage).sort((a, b) => a - b).map((stage, idx, arr) => (
                                    <div key={stage} className={`stage-column ${idx !== arr.length - 1 ? 'stage-connector' : ''}`}>
                                        <div className="stage-header">
                                            {getStageName(stage, tournament.teams.length, arr.length)}
                                        </div>
                                        {matchesByStage[stage].map(match => (
                                            <div key={match.matchId} className="match-card">
                                                <div className="match-header">
                                                    <span className="match-index">Match #{match.matchIndex}</span>
                                                </div>

                                                {renderTeamRow(
                                                    match,
                                                    match.teamA,
                                                    match.scoreA,
                                                    match.winner === match.teamA && match.winner !== '',
                                                    match.winner && match.winner !== match.teamA,
                                                    !match.teamA
                                                )}

                                                {renderTeamRow(
                                                    match,
                                                    match.teamB,
                                                    match.scoreB,
                                                    match.winner === match.teamB && match.winner !== '',
                                                    match.winner && match.winner !== match.teamB,
                                                    !match.teamB
                                                )}

                                                {(match.matchDate || match.stadium || match.referee) && (
                                                    <div className="match-info-section">
                                                        {match.matchDate && (
                                                            <div className="match-info-item">
                                                                <i className="bi bi-calendar-event text-primary"></i>
                                                                <span>{new Date(match.matchDate).toLocaleString('en-GB', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}</span>
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
                                        ))}
                                    </div>
                                ))
                            ) : (
                                <div className="alert alert-info w-100 text-center">
                                    The bracket is currently being generated. Please check back later.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* INLINE CSS */}
            <style>{`
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
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                .match-card {
                    border: 1px solid #dee2e6;
                    border-radius: 12px;
                    margin-bottom: 25px;
                    background-color: white;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.08);
                    overflow: hidden;
                    transition: transform 0.2s;
                }
                .match-card:hover {
                    transform: translateY(-3px);
                }
                .match-header {
                    background-color: #f8f9fa;
                    padding: 6px 15px;
                    border-bottom: 1px solid #eee;
                    font-size: 0.8rem;
                    color: #6c757d;
                    font-weight: bold;
                }
                .team-row {
                    padding: 12px 15px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #f0f0f0;
                }
                .team-row:last-of-type {
                    border-bottom: none;
                }
                .team-name {
                    font-weight: 500;
                    color: #333;
                }
                .match-score {
                    font-weight: 700;
                    color: #667eea;
                    min-width: 25px;
                    text-align: center;
                }
                .winner {
                    background: linear-gradient(to right, #d4edda 0%, #ffffff 100%);
                    border-left: 4px solid #28a745;
                }
                .winner .team-name {
                    color: #155724;
                    font-weight: 700;
                }
                .loser {
                    opacity: 0.6;
                    background-color: #f8f9fa;
                }
                .loser .team-name {
                    text-decoration: line-through;
                }
                .waiting {
                    background-color: #fff9e6;
                    border-left: 4px solid #ffc107;
                    font-style: italic;
                }
                .stage-connector {
                    border-right: 2px dashed #dee2e6;
                }
                .legend {
                    background-color: white;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                }
                .legend-item {
                    display: flex;
                    align-items: center;
                }
                .legend-box {
                    width: 30px;
                    height: 20px;
                    border-radius: 4px;
                    margin-right: 10px;
                    border: 1px solid #dee2e6;
                }
                .legend-winner { background: linear-gradient(to right, #d4edda 0%, #ffffff 100%); border-left: 3px solid #28a745; }
                .legend-waiting { background-color: #fff9e6; border-left: 3px solid #ffc107; }
                .legend-loser { background-color: #f8f9fa; opacity: 0.6; }
                .match-info-section {
                    background-color: #fcfcfc;
                    padding: 8px 15px;
                    border-top: 1px solid #eee;
                    font-size: 0.8rem;
                }
                .match-info-item {
                    display: flex;
                    align-items: center;
                    margin-bottom: 3px;
                    color: #555;
                }
                .match-info-item i {
                    margin-right: 8px;
                    font-size: 0.9rem;
                }
                .winner-icon {
                    margin-right: 8px;
                }
                .badge-bye {
                    background-color: #6c757d;
                    color: white;
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-size: 0.7rem;
                    font-weight: bold;
                }
            `}</style>
        </div>
    );
}