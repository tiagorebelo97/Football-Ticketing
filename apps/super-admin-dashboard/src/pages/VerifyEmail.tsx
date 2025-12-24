import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No verification token provided.');
            return;
        }

        const verify = async () => {
            try {
                await axios.post('/api/auth/verify-email', { token });
                setStatus('success');
            } catch (err: any) {
                setStatus('error');
                setMessage(err.response?.data?.error || 'Verification failed. The token may be invalid or expired.');
            }
        };

        verify();
    }, [token]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at center, #1a1c2c 0%, #0a0b14 100%)',
            padding: '24px',
            fontFamily: "'Inter', sans-serif"
        }}>
            <div className="animated-bg" style={{ opacity: 0.3 }}></div>

            <div className="glass-card" style={{
                width: '100%',
                maxWidth: '440px',
                padding: '56px',
                textAlign: 'center',
                position: 'relative',
                zIndex: 10
            }}>
                {status === 'verifying' && (
                    <>
                        <div style={{ fontSize: '48px', marginBottom: '24px', animation: 'pulse 2s infinite' }}>📡</div>
                        <h2 className="text-gradient" style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px' }}>Verifying...</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Synchronizing administrative credentials with the core registry.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div style={{ fontSize: '48px', marginBottom: '24px' }}>🛡️</div>
                        <h2 className="text-gradient" style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px' }}>Identity Verified</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>Your administrative access has been provisioned and secured.</p>
                        <button
                            className="premium-btn premium-btn-primary"
                            onClick={() => navigate('/login')}
                            style={{ width: '100%', padding: '16px' }}
                        >
                            Proceed to Command Center
                        </button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div style={{ fontSize: '48px', marginBottom: '24px' }}>⚠️</div>
                        <h2 style={{ color: '#ef4444', fontSize: '32px', fontWeight: 800, marginBottom: '12px' }}>Verification Failure</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>{message}</p>
                        <button
                            className="premium-btn premium-btn-secondary"
                            onClick={() => navigate('/login')}
                            style={{ width: '100%', padding: '16px' }}
                        >
                            Return to Portal
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
