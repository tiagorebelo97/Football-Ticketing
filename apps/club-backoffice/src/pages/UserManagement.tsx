import React, { useState, useEffect } from 'react';
import { userService, User, Role, CreateUserRequest, PERMISSION_LABELS } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaEdit, FaTrash, FaShieldAlt, FaTimes } from 'react-icons/fa';

const UserManagement: React.FC = () => {
    const { club } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Form state
    const [formData, setFormData] = useState<CreateUserRequest>({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        roleId: ''
    });

    useEffect(() => {
        if (club?.id) {
            loadData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [club?.id]);

    const loadData = async () => {
        if (!club?.id) return;
        
        try {
            setLoading(true);
            const [usersData, rolesData] = await Promise.all([
                userService.getUsers(club.id),
                userService.getRoles(club.id)
            ]);
            setUsers(usersData);
            setRoles(rolesData);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load data';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!club?.id) return;

        try {
            await userService.createUser(club.id, formData);
            setShowCreateModal(false);
            resetForm();
            loadData();
        } catch (err) {
            const message = err instanceof Error && 'response' in err ? 
                (err as any).response?.data?.error || err.message : 
                'Failed to create user';
            setError(message);
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!club?.id || !editingUser) return;

        try {
            await userService.updateUser(club.id, editingUser.id, formData);
            setEditingUser(null);
            resetForm();
            loadData();
        } catch (err) {
            const message = err instanceof Error && 'response' in err ? 
                (err as any).response?.data?.error || err.message : 
                'Failed to update user';
            setError(message);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!club?.id) return;
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            await userService.deleteUser(club.id, userId);
            loadData();
        } catch (err) {
            const message = err instanceof Error && 'response' in err ? 
                (err as any).response?.data?.error || err.message : 
                'Failed to delete user';
            setError(message);
        }
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setFormData({
            email: user.email,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            phone: user.phone || '',
            roleId: user.role.id
        });
    };

    const resetForm = () => {
        setFormData({
            email: '',
            firstName: '',
            lastName: '',
            phone: '',
            roleId: ''
        });
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingUser(null);
        resetForm();
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '60px' }}>
                <div className="spinner" style={{ margin: '0 auto' }} />
                <p style={{ color: 'var(--text-muted)', marginTop: '16px' }}>Loading users...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ margin: 0, color: 'var(--text-main)', fontSize: '32px', fontWeight: 700 }}>User Management</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Manage staff accounts and permissions</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="premium-btn premium-btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <FaPlus /> Create User
                </button>
            </div>

            {error && (
                <div className="glass-card" style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    padding: '16px',
                    marginBottom: '24px',
                    border: '1px solid rgba(239, 68, 68, 0.2)'
                }}>
                    {error}
                </div>
            )}

            {/* Users Table */}
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                            <th style={{ padding: '20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase' }}>User</th>
                            <th style={{ padding: '20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase' }}>Role</th>
                            <th style={{ padding: '20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase' }}>Permissions</th>
                            <th style={{ padding: '20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '20px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                                <td style={{ padding: '20px' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                                            {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}
                                        </div>
                                        {user.firstName && user.lastName && (
                                            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                                {user.email}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FaShieldAlt style={{ color: 'var(--accent-primary)' }} />
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{user.role.name}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.role.description}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {user.role.permissions.slice(0, 3).map((perm) => (
                                            <span
                                                key={perm}
                                                style={{
                                                    padding: '4px 10px',
                                                    fontSize: '11px',
                                                    background: 'rgba(0, 242, 254, 0.1)',
                                                    color: 'var(--accent-primary)',
                                                    borderRadius: '6px',
                                                    border: '1px solid rgba(0, 242, 254, 0.2)'
                                                }}
                                            >
                                                {PERMISSION_LABELS[perm] || perm}
                                            </span>
                                        ))}
                                        {user.role.permissions.length > 3 && (
                                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                +{user.role.permissions.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td style={{ padding: '20px' }}>
                                    <span style={{
                                        padding: '6px 12px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        background: user.isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        color: user.isActive ? '#22c55e' : '#ef4444',
                                        borderRadius: '8px',
                                        border: `1px solid ${user.isActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                                    }}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td style={{ padding: '20px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        <button
                                            onClick={() => openEditModal(user)}
                                            className="icon-btn"
                                            style={{ padding: '8px 12px' }}
                                            title="Edit"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="icon-btn"
                                            style={{ padding: '8px 12px', color: '#ef4444' }}
                                            title="Delete"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {users.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                        <FaShieldAlt style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }} />
                        <p>No users found. Create your first user to get started.</p>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {(showCreateModal || editingUser) && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: '20px'
                }}>
                    <div className="glass-card" style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>
                                {editingUser ? 'Edit User' : 'Create New User'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="icon-btn"
                                style={{ fontSize: '20px' }}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className="glass-effect"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        color: 'white',
                                        borderRadius: '10px',
                                        background: 'rgba(255,255,255,0.03)'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="glass-effect"
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            color: 'white',
                                            borderRadius: '10px',
                                            background: 'rgba(255,255,255,0.03)'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="glass-effect"
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            color: 'white',
                                            borderRadius: '10px',
                                            background: 'rgba(255,255,255,0.03)'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="glass-effect"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        color: 'white',
                                        borderRadius: '10px',
                                        background: 'rgba(255,255,255,0.03)'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>
                                    Role *
                                </label>
                                <select
                                    value={formData.roleId}
                                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                                    required
                                    className="glass-effect"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        color: 'white',
                                        borderRadius: '10px',
                                        background: 'rgba(255,255,255,0.03)'
                                    }}
                                >
                                    <option value="">Select a role</option>
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.id}>
                                            {role.name} - {role.description}
                                        </option>
                                    ))}
                                </select>

                                {formData.roleId && (
                                    <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(0, 242, 254, 0.05)', borderRadius: '8px', border: '1px solid rgba(0, 242, 254, 0.1)' }}>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>Permissions:</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                            {roles.find(r => r.id === formData.roleId)?.permissions.map((perm) => (
                                                <span
                                                    key={perm}
                                                    style={{
                                                        padding: '4px 10px',
                                                        fontSize: '11px',
                                                        background: 'rgba(0, 242, 254, 0.1)',
                                                        color: 'var(--accent-primary)',
                                                        borderRadius: '6px',
                                                        border: '1px solid rgba(0, 242, 254, 0.2)'
                                                    }}
                                                >
                                                    {PERMISSION_LABELS[perm] || perm}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="premium-btn"
                                    style={{ background: 'rgba(255,255,255,0.05)' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="premium-btn premium-btn-primary"
                                >
                                    {editingUser ? 'Update User' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
