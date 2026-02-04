import React, { useEffect, useState, useCallback } from 'react';
import {useParams, Link, useNavigate} from 'react-router-dom';
import { GATEWAY_URL } from './App';

/**
 * TournamentView Component
 * Public view for tournament details, teams, and match schedule.
 */
export default function TournamentView() {
    const { id } = useParams();
    const navigate = useNavigate();

    // --- STATE ---
    const [tournament, setTournament] = useState(null);
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [matchesByStage, setMatchesByStage] = useState({});
    const [loading, setLoading] = useState(true);

    // Authentication token (needed for fetching if the endpoint is protected,
    // otherwise can be removed if endpoint is public)
    const token = localStorage.getItem('jwt_token');
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
    }, []);

    // --- DATA LOADING ---
    const loadTournamentData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetching tournament data
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const res = await fetch(`${GATEWAY_URL}/tournaments/id/${id}`, {
                headers: headers
            });

            if (!res.ok) throw new Error("Error loading tournament");

            const data = await res.json();
            setTournament(data);

            // Group matches by stage
            const grouped = {};
            if (data.matches) {
                data.matches.forEach(m => {
                    if (!grouped[m.stage]) grouped[m.stage] = [];
                    grouped[m.stage].push(m);
                });
                // Sort by match index within stage if needed, though usually backend does it
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
        if (s === 4) return 'Final'; // Assuming 4 stages max for simplicity based on HTML logic
        return `Stage ${s}`;
    };

    const formatDate = (dateArr) => {
        if (!dateArr) return 'To Be Determined';
        // Handle array format [yyyy, mm, dd, hh, mm] coming from Java LocalDateTime
        if (Array.isArray(dateArr)) {
            const date = new Date(dateArr[0], dateArr[1] - 1, dateArr[2], dateArr[3] || 0, dateArr[4] || 0);
            const hasTime = dateArr.length > 3 && (dateArr[3] !== 0 || dateArr[4] !== 0);

            return date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                ...(hasTime && { hour: '2-digit', minute: '2-digit' })
            });
        }
        return new Date(dateArr).toLocaleString();
    };

    // --- STYLES ---
    // Mapping CSS variables from HTML to JS object
    const styles = {
        hero: {
            background: 'linear-gradient(135deg, #4e73df 0%, #224abe 100%)',
            color: 'white',
            padding: '3rem 0',
            marginBottom: '2rem',
            borderBottom: '5px solid #1cc88a'
        },
        infoCard: {
            border: 'none',
            borderRadius: '15px',
            boxShadow: '0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15)',
            transition: 'transform 0.2s'
        },
        matchItem: {
            borderLeft: '4px solid #4e73df',
            marginBottom: '1.5rem',
            background: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            transition: 'all 0.3s'
        },
        stageTitle: {
            color: '#4e73df',
            fontWeight: '700',
            borderBottom: '2px solid #e3e6f0',
            paddingBottom: '0.5rem',
            marginTop: '2rem'
        },
        scoreDisplay: {
            fontSize: '1.5rem',
            fontWeight: '800',
            color: '#2e59d9',
            minWidth: '80px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #f8f9fc 0%, #e3e6f0 100%)',
            padding: '0.5rem',
            borderRadius: '8px'
        },
        matchHeader: {
            background: 'linear-gradient(to right, #f8f9fc, transparent)',
            padding: '0.75rem 1rem',
            margin: '-1.5rem -1.5rem 1rem -1.5rem',
            borderRadius: '8px 8px 0 0',
            borderBottom: '2px solid #e3e6f0'
        },
        detailIcon: {
            width: '28px',
            height: '28px',
            fontSize: '0.75rem',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        winnerLabel: {
            color: '#1cc88a',
            fontWeight: 'bold',
            fontSize: '0.8rem',
            display: 'inline-block',
            marginTop: '0.25rem'
        }
    };

    if (loading) return (
        <div className="text-center py-5">
            <div className="spinner-border text-primary"></div>
            <p className="mt-3">Loading Tournament Details...</p>
        </div>
    );

    const sortedStages = Object.keys(matchesByStage).sort((a, b) => a - b);

    const getBracketLink = () => {
        // Link di default
        const defaultLink = `/tournament/${id}/bracket_view`;
        const adminLink = `/tournament/${id}/admin_bracket_view`;

        if (!token) return defaultLink;

        try {
            const userRole = user.role;

            return userRole === 'ADMIN' ? adminLink : defaultLink;
        } catch (error) {
            console.error("Token decode error: ", error);
            return defaultLink;
        }
    };

    const bracketTarget = getBracketLink();

    return (
        <div className="bg-light min-vh-100 font-sans">
            {/* NAVBAR */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
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

            {/* HERO HEADER */}
            <header style={styles.hero}>
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-md-8">
                            <h1 className="display-4 fw-bold">{tournament?.tournamentName}</h1>
                            <p className="lead mb-0">
                                <i className="fas fa-users me-2"></i>
                                {tournament?.teams?.length || 0} Registered Teams
                            </p>
                        </div>
                        <div className="col-md-4 text-md-end">
                            <Link to={bracketTarget} className="btn btn-light btn-lg shadow-sm">
                                <i className="fas fa-sitemap me-2"></i>View Full Bracket
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="container mb-5">
                <div className="row">
                    {/* LEFT COLUMN: TEAMS */}
                    <div className="col-lg-4">
                        <div className="card mb-4" style={styles.infoCard}>
                            <div className="card-header bg-white py-3">
                                <h5 className="m-0 font-weight-bold text-primary">Participating Teams</h5>
                            </div>
                            <div className="card-body">
                                <div className="list-group list-group-flush">
                                    {tournament?.teams?.map((team, index) => (
                                        <div key={index} className="list-group-item d-flex align-items-center border-0 py-2">
                                            <i className="fas fa-shield-alt text-secondary me-3"></i>
                                            <span className="fw-medium">{team.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: MATCH SCHEDULE */}
                    <div className="col-lg-8">
                        <h3 className="mb-4"><i className="fas fa-calendar-alt me-2 text-primary"></i>Match Schedule</h3>

                        {sortedStages.length === 0 && (
                            <div className="alert alert-info shadow-sm">
                                <i className="fas fa-info-circle me-2"></i>
                                The schedule for this tournament has not been generated yet.
                            </div>
                        )}

                        {sortedStages.map((stage) => (
                            <div key={stage}>
                                <h4 style={styles.stageTitle}>
                                    <i className="fas fa-layer-group me-2"></i>
                                    {getStageName(stage)}
                                </h4>

                                {matchesByStage[stage].map((match) => {
                                    const isFinished = match.winner && match.winner !== '';

                                    return (
                                        <div key={match.matchId} style={styles.matchItem} className="match-item-hover">
                                            {/* Match Header */}
                                            <div style={styles.matchHeader}>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <strong className="text-primary">
                                                        <i className="fas fa-hashtag me-1"></i>Match {match.matchIndex}
                                                    </strong>
                                                    {isFinished ? (
                                                        <span className="badge bg-success">
                                                            <i className="fas fa-trophy me-1"></i>Completed
                                                        </span>
                                                    ) : (
                                                        <span className="badge bg-warning text-dark">
                                                            <i className="fas fa-clock me-1"></i>Upcoming
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Teams VS Section */}
                                            <div className="bg-light rounded p-3 mb-3">
                                                <div className="row align-items-center text-center">
                                                    {/* Team A */}
                                                    <div className="col-5">
                                                        <div className="fw-bold fs-5">{match.teamA || 'TBD'}</div>
                                                        {isFinished && match.winner === match.teamA && (
                                                            <span style={styles.winnerLabel}>
                                                                <i className="fas fa-trophy"></i> WINNER
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Score */}
                                                    <div className="col-2">
                                                        <div style={styles.scoreDisplay}>
                                                            {match.scoreA} : {match.scoreB}
                                                        </div>
                                                        <small className="text-muted fw-bold">VS</small>
                                                    </div>

                                                    {/* Team B */}
                                                    <div className="col-5">
                                                        <div className="fw-bold fs-5">{match.teamB || 'TBD'}</div>
                                                        {isFinished && match.winner === match.teamB && (
                                                            <span style={styles.winnerLabel}>
                                                                <i className="fas fa-trophy"></i> WINNER
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Match Details Grid */}
                                            <div className="row mt-3">
                                                {/* Stadium */}
                                                <div className="col-md-6 mb-2">
                                                    <div className="d-flex align-items-center border-bottom pb-2">
                                                        <div className="me-3" style={styles.detailIcon}>
                                                            <i className="fas fa-map-marker-alt"></i>
                                                        </div>
                                                        <div>
                                                            <div className="text-uppercase text-secondary fw-bold" style={{fontSize: '0.75rem', letterSpacing: '0.5px'}}>Stadium</div>
                                                            <div className="fw-medium text-dark" style={{fontSize: '0.95rem'}}>
                                                                {match.stadium || 'Not Assigned'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Referee */}
                                                <div className="col-md-6 mb-2">
                                                    <div className="d-flex align-items-center border-bottom pb-2">
                                                        <div className="me-3" style={styles.detailIcon}>
                                                            <i className="fas fa-user-tie"></i>
                                                        </div>
                                                        <div>
                                                            <div className="text-uppercase text-secondary fw-bold" style={{fontSize: '0.75rem', letterSpacing: '0.5px'}}>Referee</div>
                                                            <div className="fw-medium text-dark" style={{fontSize: '0.95rem'}}>
                                                                {match.referee || 'Not Assigned'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Date & Time */}
                                                <div className="col-md-6 mb-2">
                                                    <div className="d-flex align-items-center border-bottom pb-2">
                                                        <div className="me-3" style={styles.detailIcon}>
                                                            <i className="fas fa-calendar-day"></i>
                                                        </div>
                                                        <div>
                                                            <div className="text-uppercase text-secondary fw-bold" style={{fontSize: '0.75rem', letterSpacing: '0.5px'}}>Date & Time</div>
                                                            <div className="fw-medium text-dark" style={{fontSize: '0.95rem'}}>
                                                                {formatDate(match.matchDate)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Available Seats */}
                                                <div className="col-md-6 mb-2">
                                                    <div className="d-flex align-items-center border-bottom pb-2">
                                                        <div className="me-3" style={styles.detailIcon}>
                                                            <i className="fas fa-ticket-alt"></i>
                                                        </div>
                                                        <div className="d-flex align-items-center justify-content-between w-100">
                                                            <div>
                                                                <div className="text-uppercase text-secondary fw-bold" style={{fontSize: '0.75rem', letterSpacing: '0.5px'}}>Available Seats</div>
                                                                <div className="fw-medium text-dark" style={{fontSize: '0.95rem'}}>
                                                                    {match.freeSeats} seats
                                                                </div>
                                                            </div>
                                                            <div>
                                                                {match.freeSeats > 50 && (
                                                                    <span className="badge" style={{backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb'}}>
                                                                        <i className="fas fa-check-circle me-1"></i>Available
                                                                    </span>
                                                                )}
                                                                {match.freeSeats > 0 && match.freeSeats <= 50 && (
                                                                    <span className="badge" style={{backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeaa7'}}>
                                                                        <i className="fas fa-exclamation-triangle me-1"></i>Low Stock
                                                                    </span>
                                                                )}
                                                                {match.freeSeats <= 0 && (
                                                                    <span className="badge" style={{backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb'}}>
                                                                        <i className="fas fa-times-circle me-1"></i>Sold Out
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* FOOTER */}
            <footer className="bg-dark text-white py-4 mt-auto">
                <div className="container text-center">
                    <p className="mb-0">&copy; 2025 Volleyball Tournament System. All rights reserved.</p>
                </div>
            </footer>

            {/* INLINE CSS FOR HOVER EFFECTS NOT HANDLED BY INLINE STYLES */}
            <style>{`
                .match-item-hover:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.12) !important;
                    transform: translateY(-2px);
                }
            `}</style>
        </div>
    );
}