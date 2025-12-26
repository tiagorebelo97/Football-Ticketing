
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const [slug, setSlug] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(slug, email, password);
            navigate('/');
        } catch (error) {
            setError('Login failed. Please check the Club Slug.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#f0f2f5',
            backgroundImage: 'linear-gradient(135deg, #1e1e2f 0%, #2c3e50 100%)',
            padding: '20px'
        }}>
            <div className="card" style={{
                width: '100%',
                maxWidth: '450px',
                padding: '50px',
                borderRadius: '16px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                background: 'white'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#1e1e2f' }}>Club Administration</h2>
                <p style={{ textAlign: 'center', marginBottom: '40px', color: '#7f8c8d' }}>
                    Secure access to your club management console
                </p>

                {error && <div style={{ color: 'red', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Club Slug (e.g., clube-futebol-benfica)</label>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="your-club-slug"
                            required
                            style={{ padding: '15px' }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Admin Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@club.com"
                            required
                            style={{ padding: '15px' }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            style={{ padding: '15px' }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-success"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '15px',
                            fontSize: '16px',
                            marginTop: '20px',
                            fontWeight: 600
                        }}
                    >
                        {loading ? 'Authenticating...' : 'Access Dashboard'}
                    </button>
                </form>
            </div>
            <div style={{ marginTop: '20px', color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                Football Ticketing Platform &copy; 2025
            </div>
        </div>
    );
};

export default Login;
