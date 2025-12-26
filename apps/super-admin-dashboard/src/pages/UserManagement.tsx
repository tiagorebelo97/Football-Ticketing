import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import UserModal from '../components/UserModal';

interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    role: string;
    is_verified: boolean;
    club_id: string | null;
    club_name?: string;
    created_at: string;
}

interface Club {
    id: string;
    name: string;
}

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [clubs, setClubs] = useState<Club[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user: currentUser } = useAuth();

    // Filters
    const [query, setQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [clubFilter, setClubFilter] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const fetchUsers = async () => {
        try {
            const params = new URLSearchParams();
            if (query) params.append('query', query);
            if (roleFilter) params.append('role', roleFilter);
            if (clubFilter) params.append('clubId', clubFilter);

            const response = await axios.get(`/api/users?${params.toString()}`);
            setUsers(response.data);
        } catch (err) {
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const fetchClubs = async () => {
        try {
            const response = await axios.get('/api/clubs');
            setClubs(response.data);
        } catch (err) {
            console.error('Failed to fetch clubs');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [query, roleFilter, clubFilter]);

    useEffect(() => {
        fetchClubs();
    }, []);

    const handleToggleVerify = async (user: User) => {
        try {
            await axios.post(`/api/users/${user.id}/toggle-verify`, { is_verified: !user.is_verified });
            setUsers(users.map(u => u.id === user.id ? { ...u, is_verified: !u.is_verified } : u));
        } catch (err) {
            alert('Failed to update verification status');
        }
    };

    const handleResetPassword = async (userId: string) => {
        const newPassword = window.prompt('Enter new password:');
        if (!newPassword) return;

        try {
            await axios.post(`/api/users/${userId}/reset-password`, { password: newPassword });
            alert('Password reset successfully');
        } catch (err) {
            alert('Failed to reset password');
        }
    };

    const handleDelete = async (userId: string) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await axios.delete(`/api/users/${userId}`);
            setUsers(users.filter(u => u.id !== userId));
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    if (loading && users.length === 0) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'var(--text-muted)' }}>
            <div style={{ textAlign: 'center' }}>
                <div className="text-gradient" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Syncing Database...</div>
                <p>Establishing secure connection</p>
            </div>
        </div>
    );

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>User Matrix</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Universal access orchestration across all platform layers</p>
                </div>
                <button
                    className="premium-btn premium-btn-primary"
                    onClick={openCreateModal}
                >
                    + Initialize New Account
                </button>
            </div>

            <div className="glass-card" style={{
                marginBottom: '40px',
                padding: '24px',
                display: 'flex',
                gap: '24px',
                flexWrap: 'wrap',
                background: 'rgba(255, 255, 255, 0.02)',
                alignItems: 'center'
            }}>
                <div style={{ flex: '1', minWidth: '300px' }}>
                    <input
                        type="text"
                        placeholder="Search by identity or email..."
                        value={query}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                        className="glass-effect"
                        style={{ width: '100%', padding: '14px 20px', height: '48px', borderRadius: '12px', color: 'white', background: 'rgba(255,255,255,0.03)' }}
                    />
                </div>
                <div style={{ minWidth: '180px' }}>
                    <select
                        value={roleFilter}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRoleFilter(e.target.value)}
                        className="glass-effect"
                        style={{ width: '100%', padding: '14px 20px', height: '48px', borderRadius: '12px', color: 'white', background: 'rgba(255,255,255,0.03)' }}
                    >
                        <option value="" style={{ background: '#0f111a' }}>All Roles</option>
                        <option value="super_admin" style={{ background: '#0f111a' }}>Super Admin</option>
                        <option value="editor" style={{ background: '#0f111a' }}>Editor</option>
                        <option value="club_admin" style={{ background: '#0f111a' }}>Club Admin</option>
                        <option value="staff" style={{ background: '#0f111a' }}>Staff</option>
                        <option value="fan" style={{ background: '#0f111a' }}>Fan</option>
                    </select>
                </div>
                <div style={{ minWidth: '220px' }}>
                    <select
                        value={clubFilter}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setClubFilter(e.target.value)}
                        className="glass-effect"
                        style={{ width: '100%', padding: '14px 20px', height: '48px', borderRadius: '12px', color: 'white', background: 'rgba(255,255,255,0.03)' }}
                    >
                        <option value="" style={{ background: '#0f111a' }}>Global Access</option>
                        {clubs.map(c => <option key={c.id} value={c.id} style={{ background: '#0f111a' }}>{c.name}</option>)}
                    </select>
                </div>
            </div>

            {error && (
                <div className="glass-effect" style={{ marginBottom: '24px', padding: '16px', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', textAlign: 'center' }}>
                    {error}
                </div>
            )}

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.01)', textAlign: 'left' }}>
                            <th style={{ padding: '24px 32px', color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Account</th>
                            <th style={{ padding: '24px 32px', color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Privilege</th>
                            <th style={{ padding: '24px 32px', color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Organization</th>
                            <th style={{ padding: '24px 32px', color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Integrity</th>
                            <th style={{ padding: '24px 32px', color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody style={{ fontSize: '14px' }}>
                        {users.map(u => (
                            <tr key={u.id} style={{ borderTop: '1px solid var(--border-glass)', transition: 'background 0.2s' }}>
                                <td style={{ padding: '24px 32px' }}>
                                    <div style={{ fontWeight: 700, marginBottom: '2px' }}>{u.first_name} {u.last_name}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{u.email}</div>
                                </td>
                                <td style={{ padding: '24px 32px' }}>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '8px',
                                        fontSize: '11px',
                                        fontWeight: 800,
                                        letterSpacing: '0.05em',
                                        textTransform: 'uppercase',
                                        backgroundColor: u.role === 'super_admin' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(79, 172, 254, 0.1)',
                                        color: u.role === 'super_admin' ? '#ef4444' : 'var(--accent-secondary)',
                                        border: u.role === 'super_admin' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(79, 172, 254, 0.2)'
                                    }}>
                                        {u.role.replace('_', ' ')}
                                    </span>
                                </td>
                                <td style={{ padding: '24px 32px' }}>
                                    <span style={{ color: u.club_name ? 'var(--text-main)' : 'var(--text-dim)', fontWeight: u.club_name ? 600 : 400 }}>
                                        {u.club_name || 'System Level'}
                                    </span>
                                </td>
                                <td style={{ padding: '24px 32px' }}>
                                    <span className={`badge ${u.is_verified ? 'badge-success' : 'badge-warning'}`}>
                                        {u.is_verified ? 'Verified' : 'Pending'}
                                    </span>
                                </td>
                                <td style={{ padding: '24px 32px', color: 'var(--text-dim)', fontSize: '13px' }}>
                                    {new Date(u.created_at).toLocaleDateString()}
                                </td>
                                <td style={{ padding: '24px 32px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                        <button className="premium-btn premium-btn-secondary" style={{ padding: '8px', minWidth: '36px' }} onClick={() => openEditModal(u)} title="Modify Profile">✏️</button>
                                        <button className="premium-btn premium-btn-secondary" style={{ padding: '8px', minWidth: '36px' }} onClick={() => handleToggleVerify(u)} title={u.is_verified ? "Revoke Identity" : "Authorize Identity"}>
                                            {u.is_verified ? '🛡️' : '✅'}
                                        </button>
                                        <button className="premium-btn premium-btn-secondary" style={{ padding: '8px', minWidth: '36px' }} onClick={() => handleResetPassword(u.id)} title="Regenerate Credentials">🔑</button>
                                        {u.id !== currentUser?.id && (
                                            <button className="premium-btn premium-btn-secondary" style={{ padding: '8px', minWidth: '36px', border: '1px solid rgba(239,68,68,0.2)' }} onClick={() => handleDelete(u.id)} title="Purge Record">🗑️</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <UserModal
                    user={selectedUser}
                    onClose={() => setIsModalOpen(false)}
                    onSave={fetchUsers}
                />
            )}
        </div>
    );
};

export default UserManagement;
