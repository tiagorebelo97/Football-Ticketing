import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            await axios.post('/api/auth/register', { email, password });
            setSuccess('Initialization packet sent. Verification required.');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registry entry failed');
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
            background: 'radial-gradient(circle at center, #1a1c2c 0%, #0a0b14 100%)',
            padding: '24px',
            fontFamily: "'Inter', sans-serif",
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Animated background particles simulation via CSS */}
            <div className="animated-bg" style={{ opacity: 0.4 }}></div>

            <div className="glass-card" style={{
                width: '100%',
                maxWidth: '440px',
                padding: '56px',
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                position: 'relative',
                zIndex: 10
            }}>
                <div style={{ marginBottom: '40px' }}>
                    <div style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: 'var(--accent-primary)',
                        textTransform: 'uppercase',
                        letterSpacing: '3px',
                        marginBottom: '16px'
                    }}>
                        Security Oracle
                    </div>
                    <h1 className="text-gradient" style={{
                        fontSize: '32px',
                        fontWeight: 800,
                        marginBottom: '12px',
                        fontFamily: "'Outfit', sans-serif"
                    }}>
                        Registry Access
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
                        Establish your administrative identity in the platform core
                    </p>
                </div>

                {error && (
                    <div className="glass-effect" style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        padding: '14px',
                        borderRadius: '12px',
                        marginBottom: '28px',
                        fontSize: '13px',
                        border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                        {error}
                    </div>
                )}

                {success && (
                    <div className="glass-effect" style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        color: '#10b981',
                        padding: '20px',
                        borderRadius: '12px',
                        marginBottom: '28px',
                        fontSize: '14px',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        lineHeight: '1.6'
                    }}>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>✨</div>
                        {success}
                    </div>
                )}

                {!success && (
                    <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Command Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                required
                                className="glass-effect"
                                style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', color: 'white', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}
                                placeholder="name@command.center"
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Security Key</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                required
                                className="glass-effect"
                                style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', color: 'white', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}
                                placeholder="••••••••"
                            />
                        </div>

                        <div style={{ marginBottom: confirmPassword ? '32px' : '32px' }}>
                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Confirm Sentinel</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                                required
                                className="glass-effect"
                                style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', color: 'white', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            className="premium-btn premium-btn-primary"
                            style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: 700 }}
                            disabled={loading}
                        >
                            {loading ? 'Transmitting...' : 'Establish Identity'}
                        </button>
                    </form>
                )}

                <div style={{ marginTop: '32px', fontSize: '14px' }}>
                    <Link to="/login" style={{ color: 'var(--accent-secondary)', textDecoration: 'none', fontWeight: 600 }}>
                        Return to Authentication Portal
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
