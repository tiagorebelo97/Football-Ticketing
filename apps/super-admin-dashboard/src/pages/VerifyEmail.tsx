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
            background: 'linear-gradient(135deg, #1e1e2f 0%, #2c3e50 100%)',
            padding: '20px'
        }}>
            <div className="card" style={{
                width: '100%',
                maxWidth: '400px',
                padding: '40px',
                textAlign: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
            }}>
                {status === 'verifying' && (
                    <>
                        <h2 style={{ color: 'var(--color-secondary)' }}>Verifying...</h2>
                        <p>Please wait while we verify your email address.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <h2 style={{ color: 'var(--color-primary)' }}>Email Verified!</h2>
                        <p style={{ marginBottom: '20px' }}>Your account has been successfully verified.</p>
                        <button
                            className="btn btn-success"
                            onClick={() => navigate('/login')}
                            style={{ width: '100%' }}
                        >
                            Continue to Login
                        </button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <h2 style={{ color: 'var(--color-danger)' }}>Verification Failed</h2>
                        <p style={{ marginBottom: '20px' }}>{message}</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/login')}
                            style={{ width: '100%' }}
                        >
                            Back to Login
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
