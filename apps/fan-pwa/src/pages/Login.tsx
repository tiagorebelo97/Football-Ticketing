
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, 'dummy-password');
            navigate('/');
        } catch (error) {
            console.error('Login failed', error);
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
            background: 'linear-gradient(135deg, #1abc9c 0%, #2c3e50 100%)',
            padding: '20px'
        }}>
            <div className="card" style={{
                width: '100%',
                maxWidth: '400px',
                padding: '40px',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)'
            }}>
                <h1 style={{ textAlign: 'center', marginBottom: '10px', color: 'var(--color-secondary)' }}>Welcome Back</h1>
                <p style={{ textAlign: 'center', marginBottom: '30px', color: 'var(--color-text-light)' }}>
                    Sign in to access your tickets
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@example.com"
                            required
                            style={{
                                padding: '15px',
                                fontSize: '16px',
                                background: '#f8f9fa',
                                border: '1px solid #e9ecef'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-success"
                        disabled={loading}
                        style={{
                            padding: '15px',
                            fontSize: '18px',
                            marginTop: '10px',
                            boxShadow: '0 4px 15px rgba(26, 188, 156, 0.4)'
                        }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
