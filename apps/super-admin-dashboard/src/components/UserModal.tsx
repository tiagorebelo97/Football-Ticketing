import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
    id?: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    role: string;
    club_id: string | null;
}

interface Club {
    id: string;
    name: string;
}

interface UserModalProps {
    user?: User | null;
    onClose: () => void;
    onSave: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState<User>({
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        role: 'fan',
        club_id: null
    });
    const [password, setPassword] = useState('');
    const [clubs, setClbs] = useState<Club[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                email: user.email || '',
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                phone: user.phone || '',
                role: user.role || 'fan',
                club_id: user.club_id || null
            });
        }
        fetchClubs();
    }, [user]);

    const fetchClubs = async () => {
        try {
            const response = await axios.get('/api/clubs');
            setClbs(response.data);
        } catch (err) {
            console.error('Failed to fetch clubs');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (user?.id) {
                await axios.put(`/api/users/${user.id}`, formData);
            } else {
                await axios.post('/api/users', { ...formData, password });
            }
            onSave();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to save user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(5, 5, 10, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            backdropFilter: 'blur(12px)',
            padding: '20px'
        }}>
            <div className="glass-card" style={{
                width: '100%',
                maxWidth: '600px',
                padding: '48px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-glass)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative background element */}
                <div style={{
                    position: 'absolute',
                    top: '-100px',
                    right: '-100px',
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(79, 172, 254, 0.1) 0%, transparent 70%)',
                    zIndex: -1
                }}></div>

                <div style={{ marginBottom: '32px' }}>
                    <h2 className="text-gradient" style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>
                        {user ? 'Modify Profile' : 'Initialize Account'}
                    </h2>
                    <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>
                        {user ? `Updating identity records for ${user.email}` : 'Configure access parameters for the new platform entity'}
                    </p>
                </div>

                {error && (
                    <div style={{
                        marginBottom: '24px',
                        padding: '12px 16px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '12px',
                        color: '#ef4444',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <span>⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Primary Identity (Email)</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                                required
                                disabled={!!user}
                                className="glass-effect"
                                style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', color: 'white', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', opacity: !!user ? 0.6 : 1 }}
                            />
                        </div>

                        {!user && (
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Access Credentials</label>
                                <input
                                    type="password"
                                    placeholder="Enter secure password"
                                    value={password}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                    required
                                    className="glass-effect"
                                    style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', color: 'white', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}
                                />
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>First Name</label>
                                <input
                                    type="text"
                                    value={formData.first_name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, first_name: e.target.value })}
                                    className="glass-effect"
                                    style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', color: 'white', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Last Name</label>
                                <input
                                    type="text"
                                    value={formData.last_name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, last_name: e.target.value })}
                                    className="glass-effect"
                                    style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', color: 'white', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Privilege Class</label>
                                <select
                                    value={formData.role}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, role: e.target.value })}
                                    required
                                    className="glass-effect"
                                    style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', color: 'white', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}
                                >
                                    <option value="super_admin" style={{ background: '#0f111a' }}>Super Admin</option>
                                    <option value="editor" style={{ background: '#0f111a' }}>Editor</option>
                                    <option value="club_admin" style={{ background: '#0f111a' }}>Club Admin</option>
                                    <option value="staff" style={{ background: '#0f111a' }}>Staff</option>
                                    <option value="fan" style={{ background: '#0f111a' }}>Fan</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Organization</label>
                                <select
                                    value={formData.club_id || ''}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, club_id: e.target.value || null })}
                                    disabled={!['club_admin', 'staff', 'fan'].includes(formData.role)}
                                    className="glass-effect"
                                    style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', color: 'white', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', opacity: !['club_admin', 'staff', 'fan'].includes(formData.role) ? 0.3 : 1 }}
                                >
                                    <option value="" style={{ background: '#0f111a' }}>Global Scope</option>
                                    {clubs.map(c => (
                                        <option key={c.id} value={c.id} style={{ background: '#0f111a' }}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginTop: '48px' }}>
                        <button
                            type="button"
                            className="premium-btn premium-btn-secondary"
                            onClick={onClose}
                            style={{ flex: 1, padding: '16px' }}
                        >
                            Abort
                        </button>
                        <button
                            type="submit"
                            className="premium-btn premium-btn-primary"
                            disabled={loading}
                            style={{ flex: 2, padding: '16px' }}
                        >
                            {loading ? 'Processing...' : (user ? 'Commit Changes' : 'Finalize Initialization')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;
