import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface User {
    id: string;
    email: string;
    role: string;
    is_verified: boolean;
    created_at: string;
}

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user: currentUser } = useAuth();

    const fetchUsers = async () => {
        try {
            const response = await axios.get('/api/users');
            setUsers(response.data);
        } catch (err) {
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            await axios.put(`/api/users/${userId}/role`, { role: newRole });
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (err) {
            alert('Failed to update role');
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

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container" style={{ padding: '20px' }}>
            <h1>User Management</h1>
            <div className="card" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left' }}>
                            <th style={{ padding: '12px' }}>Email</th>
                            <th style={{ padding: '12px' }}>Role</th>
                            <th style={{ padding: '12px' }}>Verified</th>
                            <th style={{ padding: '12px' }}>Joined</th>
                            <th style={{ padding: '12px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                <td style={{ padding: '12px' }}>{u.email}</td>
                                <td style={{ padding: '12px' }}>
                                    <span className={`badge ${u.role === 'super_admin' ? 'badge-primary' : 'badge-secondary'}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td style={{ padding: '12px' }}>{u.is_verified ? '✅' : '❌'}</td>
                                <td style={{ padding: '12px' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                                <td style={{ padding: '12px' }}>
                                    {u.id !== currentUser?.id && (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {u.role !== 'super_admin' && (
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => handleRoleChange(u.id, 'super_admin')}
                                                >
                                                    Make Admin
                                                </button>
                                            )}
                                            {u.role !== 'editor' && (
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => handleRoleChange(u.id, 'editor')}
                                                >
                                                    Make Editor
                                                </button>
                                            )}
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDelete(u.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;
