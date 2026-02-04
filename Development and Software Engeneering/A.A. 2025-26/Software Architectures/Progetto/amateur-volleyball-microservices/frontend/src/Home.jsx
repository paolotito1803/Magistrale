import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GATEWAY_URL } from './App';

/**
 * Home Component
 * Landing page with tournament listings and role-based quick access.
 */
export default function Home() {
    const navigate = useNavigate();

    // --- STATE ---
    const [user, setUser] = useState(null);
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('jwt_token');

    // --- EFFECTS ---
    useEffect(() => {
        // Check if user is logged in
        const storedUser = localStorage.getItem('user_info');
        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, [token]);

    // --- DATA LOADING ---
    const loadTournamentDetails = async (tournamentId, tournamentName) => {
        try {
            const headers = {};
            if (token) headers['Authorization'] = 'Bearer ' + token;

            // Get match count
            const matchRes = await fetch(`${GATEWAY_URL}/tournaments/match/count?tournamentId=${tournamentId}`, { headers });
            const matchCount = matchRes.ok ? await matchRes.json() : 0;

            // Get team count
            const teamRes = await fetch(`${GATEWAY_URL}/tournaments/team/count?tournamentId=${tournamentId}`, { headers });
            const teamCount = teamRes.ok ? await teamRes.json() : 0;

            // Get matches to calculate progress
            const matchesRes = await fetch(`${GATEWAY_URL}/tournaments/${tournamentId}/matches`, { headers });
            const matches = matchesRes.ok ? await matchesRes.json() : [];
            const completedMatches = matches.filter(m => m.winner && m.winner !== '').length;

            return {
                id: tournamentId,
                tournamentName,
                matchCount,
                teamCount,
                completedMatches,
                progress: matchCount > 0 ? Math.round((completedMatches / matchCount) * 100) : 0
            };
        } catch (error) {
            console.error('Error loading tournament details:', error);
            return {
                id: tournamentId,
                tournamentName,
                matchCount: 0,
                teamCount: 0,
                completedMatches: 0,
                progress: 0
            };
        }
    };

    const loadTournaments = useCallback(async () => {
        setLoading(true);
        try {
            const headers = {};
            if (token) headers['Authorization'] = 'Bearer ' + token;

            const response = await fetch(`${GATEWAY_URL}/tournaments`, { headers });

            if (response.ok) {
                const data = await response.json();

                // Load detailed data for each tournament (Parallel requests)
                const detailedTournaments = await Promise.all(
                    data.map(t => loadTournamentDetails(t.id, t.tournamentName))
                );

                setTournaments(detailedTournaments);
            } else {
                console.error("Failed to fetch tournaments list");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        loadTournaments();
    }, [loadTournaments]);

    // --- ACTIONS ---
    const logout = () => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_info');
        setUser(null);
        navigate('/'); // Reload or stay on home
        window.location.reload(); // Ensure state is cleared cleanly
    };

    // --- STYLES ---
    // Inline styles for dynamic or specific elements
    // Note: Hover effects are handled via the <style> tag at the bottom
    // to preserve the original CSS logic without external files.
    const styles = {
        hero: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '80px 0'
        },
        tournamentStats: {
            display: 'flex',
            justifyContent: 'space-around',
            marginTop: '10px',
            paddingTop: '10px',
            borderTop: '1px solid #e9ecef'
        },
        statNumber: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#667eea'
        },
        statLabel: {
            fontSize: '0.85rem',
            color: '#6c757d'
        }
    };

    return (
        <div className="bg-light min-vh-100 font-sans">

            {/* NAVBAR */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container">
                    <Link className="navbar-brand fw-bold" to="/">🏐 Volleyball Tournament</Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item">
                                <Link className="nav-link active" to="/">Home</Link>
                            </li>
                            {/* Simple anchor for page scroll, or Link if separate page */}
                            <li className="nav-item">
                                <a className="nav-link" href="#tournaments">Tournaments</a>
                            </li>

                            {user ? (
                                <>
                                    <li className="nav-item">
                                        <span className="nav-link text-white">Hello, {user.username}!</span>
                                    </li>
                                    <li className="nav-item">
                                        <button onClick={logout} className="btn btn-outline-light btn-sm ms-2">Logout</button>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/login">Login</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/register">Register</Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>

            {/* HERO SECTION */}
            <section style={styles.hero}>
                <div className="container text-center">
                    <h1 className="display-3 fw-bold mb-4">Welcome to Volleyball Tournament</h1>
                    <p className="lead mb-5">Manage tournaments, book tickets and follow your favorite teams</p>
                    <div className="d-flex justify-content-center gap-3">
                        <a href="#tournaments" className="btn btn-light btn-lg">Explore Tournaments</a>
                        {!user && (
                            <Link to="/login" className="btn btn-outline-light btn-lg">Login</Link>
                        )}
                    </div>
                </div>
            </section>

            {/* QUICK ACCESS SECTION (For logged users) */}
            {user && user.role !== 'REFEREE' && (
                <section className="py-5 bg-white">
                    <div className="container">
                        <h2 className="text-center mb-4">Quick Access</h2>
                        <div className="row g-4 justify-content-center">

                            {/* ADMIN ACCESS */}
                            {user.role === 'ADMIN' && (
                                <div className="col-md-3">
                                    <div className="card quick-access-btn bg-danger text-white text-center h-100 border-0 shadow-sm">
                                        <div className="card-body d-flex flex-column justify-content-center">
                                            <h3>🛠️</h3>
                                            <h5>Admin Dashboard</h5>
                                            <Link to="/admin" className="btn btn-light mt-3">Access</Link>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* COACH ACCESS */}
                            {user.role === 'COACH' && (
                                <div className="col-md-3">
                                    <div className="card quick-access-btn bg-primary text-white text-center h-100 border-0 shadow-sm">
                                        <div className="card-body d-flex flex-column justify-content-center">
                                            <h3>🏃</h3>
                                            <h5>Coach Dashboard</h5>
                                            <Link to="/coach" className="btn btn-light mt-3">Access</Link>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* VIEWER ACCESS */}
                            {user.role === 'VIEWER' && (
                                <div className="col-md-3">
                                    <div className="card quick-access-btn bg-success text-white text-center h-100 border-0 shadow-sm">
                                        <div className="card-body d-flex flex-column justify-content-center">
                                            <h3>👀</h3>
                                            <h5>My Tickets</h5>
                                            <Link to="/viewer" className="btn btn-light mt-3">View</Link>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* TOURNAMENTS SECTION */}
            <section id="tournaments" className="py-5">
                <div className="container">
                    <h2 className="text-center mb-5">Available Tournaments</h2>

                    {/* LOADING */}
                    {loading && (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                            <p className="mt-3">Loading tournaments...</p>
                        </div>
                    )}

                    {/* EMPTY STATE */}
                    {!loading && tournaments.length === 0 && (
                        <div className="text-center py-5">
                            <h4 className="text-muted">No tournaments available</h4>
                            <p className="text-muted">Come back later to see the newest tournaments</p>
                        </div>
                    )}

                    {/* TOURNAMENTS LIST */}
                    {!loading && tournaments.length > 0 && (
                        <div className="row g-4">
                            {tournaments.map((t) => {
                                const isReferee = user?.role === 'REFEREE';
                                const targetUrl = isReferee
                                    ? `/tournament/${t.id}/referee_tournament_view`
                                    : `/tournament/${t.id}/view`;

                                return (
                                    <div key={t.id} className="col-md-4 mb-4">
                                        <Link to={targetUrl} className="text-decoration-none text-reset">
                                            <div className="card tournament-card shadow h-100">
                                                <div className="card-header bg-primary text-white">
                                                    <h5 className="mb-0">{t.tournamentName}</h5>
                                                </div>
                                                <div className="card-body">
                                                    <div style={styles.tournamentStats}>
                                                        <div className="text-center">
                                                            <div style={styles.statNumber}>{t.teamCount}</div>
                                                            <div style={styles.statLabel}>Teams</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div style={styles.statNumber}>{t.matchCount}</div>
                                                            <div style={styles.statLabel}>Matches</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div style={styles.statNumber}>{t.progress}%</div>
                                                            <div style={styles.statLabel}>Complete</div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3">
                                                        <div className="progress" style={{ height: '8px' }}>
                                                            <div
                                                                className="progress-bar bg-primary"
                                                                role="progressbar"
                                                                style={{ width: `${t.progress}%` }}
                                                                aria-valuenow={t.progress}
                                                                aria-valuemin="0"
                                                                aria-valuemax="100">
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="card-footer bg-white border-top-0">
                                                    <div className="btn btn-primary w-100">
                                                        {isReferee ? 'Manage as Referee' : 'View Tournament'}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-dark text-white py-4 mt-5">
                <div className="container text-center">
                    <p className="mb-0">&copy; 2025 Volleyball Tournament. All rights reserved.</p>
                </div>
            </footer>

            {/* INLINE CSS FOR HOVER EFFECTS */}
            <style>{`
                .tournament-card {
                    transition: transform 0.2s;
                    cursor: pointer;
                }
                .tournament-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 16px rgba(0,0,0,0.2) !important;
                }
                .quick-access-btn {
                    padding: 20px;
                    border-radius: 10px;
                    transition: all 0.3s;
                }
                .quick-access-btn:hover {
                    transform: scale(1.05);
                }
            `}</style>
        </div>
    );
}