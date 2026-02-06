import React, { useEffect, useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import { GATEWAY_URL } from './App';

export default function ViewerDashboard() {

    const [activeTab, setActiveTab] = useState('shop'); // 'shop' o 'wallet'
    const [matches, setMatches] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);


    const [showBuyModal, setShowBuyModal] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [seatNum, setSeatNum] = useState(1);

    const navigate = useNavigate();
    const token = localStorage.getItem('jwt_token');
    const user = JSON.parse(localStorage.getItem('user_info') || '{}');


    useEffect(() => {
        if (!token) {
            navigate('/login');
        } else {

            if (activeTab === 'shop') loadShopMatches();
            else loadMyTickets();
        }
    }, [token, navigate, activeTab]);


    const logout = () => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_info');
        navigate('/');
    };


    const loadShopMatches = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${GATEWAY_URL}/tournaments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Server Error");

            const tournaments = await res.json();
            const list = [];

            tournaments.forEach(t => {
                if (t.matches) {
                    t.matches.forEach(m => {
                        // Filtro: partite future con posti liberi e senza vincitore
                        if (!m.winner && m.teamA && m.teamB && m.freeSeats > 0) {
                            list.push({ ...m, tournamentName: t.tournamentName });
                        }
                    });
                }
            });
            setMatches(list);
        } catch (e) {
            console.error(e);
            alert("Error loading matches");
        } finally {
            setLoading(false);
        }
    };


    const loadMyTickets = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${GATEWAY_URL}/tickets/user/${user.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Error retrieving tickets");

            const data = await res.json();
            setTickets(data);
        } catch (e) {
            console.error(e);
            alert("Error loading history");
        } finally {
            setLoading(false);
        }
    };


    const openBuyModal = (match) => {
        setSelectedMatch(match);
        setSeatNum(1); // Reset
        setShowBuyModal(true);
    };


    const confirmPurchase = async () => {
        if (!seatNum || seatNum < 1) {
            alert("Please enter a valid seat number");
            return;
        }

        const body = {
            userId: user.id,
            matchId: selectedMatch.matchId,
            numSeat: parseInt(seatNum)
        };

        try {
            const res = await fetch(`${GATEWAY_URL}/tickets/booking`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                alert("Ticket Purchased Successfully!");
                setShowBuyModal(false);

                setActiveTab('wallet');
            } else {

                let errorMsg = "Unknown error";
                try {
                    const errorData = await res.json();
                    errorMsg = errorData.detail || errorData.message || JSON.stringify(errorData);
                } catch(e) {
                    console.error(e);
                    errorMsg = await res.text();
                }
                alert("Purchase error: " + errorMsg);
            }
        } catch (e) {
            alert("Connection error: " + e.message);
        }
    };

    return (
        <div className="bg-light min-vh-100 position-relative">

            {/* NAVBAR */}
            <nav className="navbar navbar-dark bg-dark mb-4">
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
                        <span className="text-white fw-bold">Hello, {user.username}</span>
                        <button onClick={logout} className="btn btn-danger btn-sm">Logout</button>
                    </div>
                </div>
            </nav>

            <div className="container">
                {/* TABS */}
                <ul className="nav nav-tabs mb-4">
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'shop' ? 'active' : ''}`}
                            onClick={() => setActiveTab('shop')}
                        >
                            🎟 Buy Tickets
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'wallet' ? 'active' : ''}`}
                            onClick={() => setActiveTab('wallet')}
                        >
                            👜 My Purchases
                        </button>
                    </li>
                </ul>

                {/* CONTENT AREA */}
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary"></div>
                        <p>Loading...</p>
                    </div>
                ) : (
                    <>
                        {/* TAB SHOP */}
                        {activeTab === 'shop' && (
                            <div className="row">
                                {matches.length === 0 ? (
                                    <div className="col-12"><div className="alert alert-info text-center">No matches available for purchase at the moment.</div></div>
                                ) : (
                                    matches.map(match => {
                                        // Formattazione data
                                        const dateStr = match.matchDate
                                            ? new Date(match.matchDate).toLocaleDateString() + ' ' + new Date(match.matchDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                                            : "Date TBD";

                                        return (
                                            <div key={match.matchId} className="col-md-6 col-lg-4 mb-4">
                                                <div className="card shadow-sm h-100" style={{ borderLeft: '5px solid #0d6efd' }}>
                                                    <div className="card-header bg-white">
                                                        <small className="text-muted fw-bold">{match.tournamentName}</small>
                                                    </div>
                                                    <div className="card-body text-center">
                                                        <h5 className="card-title text-primary mb-3">
                                                            {match.teamA} <span className="text-dark">vs</span> {match.teamB}
                                                        </h5>
                                                        <p className="card-text text-muted small mb-1">
                                                            <i className="bi bi-geo-alt me-1"></i> {match.stadium || 'Stadium TBD'}
                                                        </p>
                                                        <p className="card-text text-muted small">
                                                            <i className="bi bi-calendar-event me-1"></i> {dateStr}
                                                        </p>
                                                        <hr />
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <span className="badge bg-info text-dark">{match.freeSeats} free seats</span>
                                                            <button
                                                                className="btn btn-primary btn-sm"
                                                                onClick={() => openBuyModal(match)}
                                                            >
                                                                Purchase
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}

                        {/* TAB WALLET */}
                        {activeTab === 'wallet' && (
                            <div className="row">
                                {tickets.length === 0 ? (
                                    <div className="col-12"><div className="alert alert-warning text-center">You haven't purchased any tickets yet.</div></div>
                                ) : (
                                    tickets.map(t => {
                                        const matchName = t.match ? `${t.match.teamA} vs ${t.match.teamB}` : "Unknown Match";
                                        const stadium = t.match ? t.match.stadium : "N/A";
                                        const dateStr = t.match && t.match.matchDate
                                            ? new Date(t.match.matchDate).toLocaleDateString()
                                            : "Date TBD";

                                        return (
                                            <div key={t.id} className="col-md-6 col-lg-4 mb-3">
                                                <div className="card shadow-sm h-100" style={{ borderLeft: '5px solid #198754' }}>
                                                    <div className="card-body">
                                                        <h5 className="card-title text-success">
                                                            <i className="bi bi-ticket-perforated-fill me-1"></i>
                                                            Ticket #{t.id.substring(0,8)}
                                                        </h5>
                                                        <h6 className="card-subtitle mb-2 text-muted">{matchName}</h6>
                                                        <p className="card-text mt-3 small">
                                                            <strong>Seat:</strong> {t.numSeat}<br/>
                                                            <strong>Stadium:</strong> {stadium}<br/>
                                                            <strong>Date:</strong> {dateStr}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* PURCHASE MODAL */}
            {showBuyModal && selectedMatch && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">Confirm Purchase</h5>
                                <button className="btn-close" onClick={() => setShowBuyModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p>You are purchasing a ticket for:</p>
                                <h4 className="text-center text-primary fw-bold my-3">
                                    {selectedMatch.teamA} vs {selectedMatch.teamB}
                                </h4>

                                <div className="mb-3">
                                    <label className="form-label">Available Seats:</label>
                                    <span className="badge bg-info text-dark ms-2">{selectedMatch.freeSeats}</span>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Select Seat Number</label>
                                    <input
                                        type="number" className="form-control"
                                        value={seatNum} onChange={(e) => setSeatNum(e.target.value)}
                                        min="1"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowBuyModal(false)}>Cancel</button>
                                <button className="btn btn-success fw-bold" onClick={confirmPurchase}>Pay & Book</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}