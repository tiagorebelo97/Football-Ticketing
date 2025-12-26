
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
        } catch (error: any) {
            console.error('Login error:', error);
            let errorMessage = error.message || 'Login failed. Please check your credentials.';
            
            // Provide more helpful error messages
            if (error.message === 'Club not found') {
                errorMessage = 'Club not found. Please check the club slug. Example: "sporting-cp", "benfica", "fc-porto"';
            } else if (error.message && error.message.includes('Failed to fetch')) {
                errorMessage = 'Unable to connect to the server. Please ensure the services are running.';
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at top left, #1e1e2f 0%, #05070a 100%)',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Decorations */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'var(--accent-primary)', filter: 'blur(150px)', opacity: 0.05, borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'var(--accent-vibrant)', filter: 'blur(150px)', opacity: 0.05, borderRadius: '50%' }} />

            <div className="glass-card" style={{
                width: '100%',
                maxWidth: '440px',
                padding: '48px',
                position: 'relative',
                zIndex: 1
            }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px auto',
                        boxShadow: '0 8px 16px rgba(0, 242, 254, 0.2)'
                    }}>
                        <span style={{ fontSize: '32px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>🛡️</span>
                    </div>
                    <h1 className="text-gradient" style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>Club Admin</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Access your club management console</p>
                </div>

                {error && (
                    <div className="glass-effect" style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        padding: '16px',
                        borderRadius: '12px',
                        marginBottom: '24px',
                        fontSize: '14px',
                        textAlign: 'center',
                        border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Club Slug</label>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="e.g. sporting-cp"
                            required
                            className="glass-effect"
                            style={{
                                width: '100%',
                                padding: '14px 18px',
                                color: 'white',
                                borderRadius: '12px',
                                background: 'rgba(255,255,255,0.03)'
                            }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Admin Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@club.com"
                            required
                            className="glass-effect"
                            style={{
                                width: '100%',
                                padding: '14px 18px',
                                color: 'white',
                                borderRadius: '12px',
                                background: 'rgba(255,255,255,0.03)'
                            }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="glass-effect"
                            style={{
                                width: '100%',
                                padding: '14px 18px',
                                color: 'white',
                                borderRadius: '12px',
                                background: 'rgba(255,255,255,0.03)'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="premium-btn premium-btn-primary"
                        style={{ width: '100%', padding: '16px', fontSize: '16px' }}
                        disabled={loading}
                    >
                        {loading ? 'Authenticating...' : 'Access Dashboard'}
                    </button>
                </form>

                <div style={{ marginTop: '24px', padding: '12px', background: 'rgba(79, 172, 254, 0.1)', border: '1px solid rgba(79, 172, 254, 0.3)', borderRadius: '8px', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
                    <strong style={{ color: 'var(--accent-primary)' }}>Development Mode:</strong> Enter your club slug to access the dashboard. Password is not required.
                </div>

                <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Need help? </span>
                    <a href="#" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>
                        Contact Support
                    </a>
                </div>
            </div>
            <div style={{ position: 'absolute', bottom: '20px', color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
                Football Ticketing Platform &copy; 2025
            </div>
        </div>
    );
};

export default Login;
