import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('/api/auth/login', { email, password });
            login(response.data.token, response.data.user, rememberMe);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed');
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
                        <span style={{ fontSize: '32px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>⚡</span>
                    </div>
                    <h1 className="text-gradient" style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>Welcome Back</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Enter your credentials to access the portal</p>
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
                        <label style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="glass-effect"
                            style={{
                                width: '100%',
                                padding: '14px 18px',
                                color: 'white',
                                borderRadius: '12px',
                                background: 'rgba(255,255,255,0.03)'
                            }}
                            placeholder="admin@platform.com"
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="glass-effect"
                            style={{
                                width: '100%',
                                padding: '14px 18px',
                                color: 'white',
                                borderRadius: '12px',
                                background: 'rgba(255,255,255,0.03)'
                            }}
                            placeholder="••••••••"
                        />
                    </div>

                    <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            style={{
                                width: '18px',
                                height: '18px',
                                cursor: 'pointer',
                                accentColor: 'var(--accent-primary)'
                            }}
                        />
                        <label htmlFor="rememberMe" style={{ color: 'var(--text-muted)', fontSize: '14px', cursor: 'pointer', userSelect: 'none' }}>
                            Keep me signed in
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="premium-btn premium-btn-primary"
                        style={{ width: '100%', padding: '16px', fontSize: '16px' }}
                        disabled={loading}
                    >
                        {loading ? 'Authenticating...' : 'Sign Into Portal'}
                    </button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px' }}>
                    <span style={{ color: 'var(--text-dim)' }}>New to the platform? </span>
                    <Link to="/register" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>
                        Create Account
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
