import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Home from './Home';
import Login from './Login';
import Register from './Register';
import AdminDashboard from './AdminDashboard';
import CoachDashboard from './CoachDashboard';
import RefereeTournamentView from './RefereeTournamentView'
import ViewerDashboard from './ViewerDashboard';
import AdminBracketView from './AdminBracketView';
import TournamentView from "./TournamentView";
import BracketView from "./BracketView"


export const GATEWAY_URL = 'http://localhost:8080/api';

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Home Page */}
                <Route path="/" element={<Home />} />

                {/* Auth */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Dashboard */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/coach" element={<CoachDashboard />} />
                <Route path="/referee" element={<Home />} />
                <Route path="/viewer" element={<ViewerDashboard />} />

                {/* extra admin */}
                <Route path="/tournament/:id/admin_bracket_view" element={<AdminBracketView/>} />

                {/* Others */}
                <Route path="/tournament/:id/referee_tournament_view" element={<RefereeTournamentView />} />
                <Route path="/tournament/:id/view" element={<TournamentView />} />
                <Route path="/tournament/:id/bracket_view" element={<BracketView />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;