import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Match {
    id: string;
    home_team: string;
    away_team: string;
    match_date: string;
    venue: string;
}

interface MatchSelectionProps {
    onSelectMatch: (match: Match) => void;
}

const MatchSelection: React.FC<MatchSelectionProps> = ({ onSelectMatch }) => {
    const navigate = useNavigate();
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const API_URL = process.env.REACT_APP_ENTRY_API_URL || 'http://entry-api.localhost';

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/validation/matches`);
                setMatches(response.data);
            } catch (err) {
                setError('Failed to load matches. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, [API_URL]);

    const handleMatchSelect = (match: Match) => {
        onSelectMatch(match);
        navigate('/gate-selection');
    };

    if (loading) return (
        <div className="container" style={{ textAlign: 'center', marginTop: '100px' }}>
            <div className="glass-card">
                <h2>Loading matches...</h2>
            </div>
        </div>
    );

    return (
        <div>
            <div className="header">
                <h1>Entry Web</h1>
                <div className="nav-buttons">
                    <button className="btn btn-outline" onClick={() => navigate('/capacity')}>
                        Capacity
                    </button>
                </div>
            </div>

            <div className="container">
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <h2>Select Match</h2>
                    <p style={{ color: 'var(--color-text-dim)' }}>
                        Choose the match you are managing today
                    </p>
                </div>

                {error && (
                    <div className="glass-card" style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}>
                        {error}
                    </div>
                )}

                <div style={{ display: 'grid', gap: '16px' }}>
                    {matches.map((match) => (
                        <div
                            key={match.id}
                            className="gate-card"
                            style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            onClick={() => handleMatchSelect(match)}
                        >
                            <div>
                                <h3 style={{ marginBottom: '4px' }}>{match.home_team} vs {match.away_team}</h3>
                                <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-dim)' }}>
                                    {new Date(match.match_date).toLocaleString()} • {match.venue}
                                </p>
                            </div>
                            <span style={{ fontSize: '24px' }}>→</span>
                        </div>
                    ))}

                    {matches.length === 0 && !error && (
                        <div className="glass-card" style={{ textAlign: 'center' }}>
                            <p>No scheduled matches found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MatchSelection;
