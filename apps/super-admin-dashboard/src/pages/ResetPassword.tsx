import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

const ResetPassword: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get('token');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!token) {
            setError('Invalid or missing reset token');
            return;
        }

        setLoading(true);

        try {
            await axios.post('/api/auth/reset-password', { token, newPassword: password });
            setMessage('Password reset successfully. Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle at top left, #1e1e2f 0%, #05070a 100%)',
                color: 'white'
            }}>
                <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
                    <h2>Invalid Link</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>This password reset link is invalid or has expired.</p>
                    <Link to="/forgot-password" style={{ color: 'var(--accent-primary)' }}>Request a new link</Link>
                </div>
            </div>
        );
    }

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
                        <span style={{ fontSize: '32px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>🔑</span>
                    </div>
                    <h1 className="text-gradient" style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>Reset Password</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Enter your new password below</p>
                </div>

                {message && (
                    <div className="glass-effect" style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        color: '#10b981',
                        padding: '16px',
                        borderRadius: '12px',
                        marginBottom: '24px',
                        fontSize: '14px',
                        textAlign: 'center',
                        border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                        {message}
                    </div>
                )}

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
                        <label style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>New Password</label>
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

                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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

                    <button
                        type="submit"
                        className="premium-btn premium-btn-primary"
                        style={{ width: '100%', padding: '16px', fontSize: '16px' }}
                        disabled={loading}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
