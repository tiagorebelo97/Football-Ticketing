import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const SeasonForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        start_date: '',
        end_date: '',
        is_active: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEdit && id) {
            loadSeason();
        }
    }, [id]);

    const loadSeason = async () => {
        try {
            const response = await axios.get(`/api/seasons/${id}`);
            const data = response.data;
            setFormData({
                name: data.name || '',
                start_date: data.start_date ? data.start_date.split('T')[0] : '', // Format for date input
                end_date: data.end_date ? data.end_date.split('T')[0] : '',
                is_active: data.is_active || false
            });
        } catch (err) {
            setError('Failed to load season');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validation
        if (new Date(formData.end_date) <= new Date(formData.start_date)) {
            setError('End date must be after start date');
            setLoading(false);
            return;
        }

        try {
            if (isEdit) {
                await axios.put(`/api/seasons/${id}`, formData);
            } else {
                await axios.post('/api/seasons', formData);
            }
            navigate('/seasons');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to save season');
            setLoading(false);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <button
                    onClick={() => navigate('/seasons')}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '14px',
                        marginBottom: '16px'
                    }}
                >
                    ← Back to Seasons
                </button>
                <h1 className="text-gradient" style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>
                    {isEdit ? 'Edit Season' : 'Add Season'}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>
                    {isEdit ? 'Update season configuration' : 'Define a new football season'}
                </p>
            </div>

            <div className="glass-card" style={{ padding: '32px', maxWidth: '700px' }}>
                {error && (
                    <div style={{
                        padding: '16px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 'var(--radius-sm)',
                        color: '#ef4444',
                        marginBottom: '24px'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                            Season Name <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., 2025/2026"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border-glass)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-main)',
                                fontSize: '15px'
                            }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                                Start Date <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border-glass)',
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--text-main)',
                                    fontSize: '15px',
                                    colorScheme: 'dark'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                                End Date <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border-glass)',
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--text-main)',
                                    fontSize: '15px',
                                    colorScheme: 'dark'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
                            <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
                            />
                            Set as Active Season
                        </label>
                        <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginLeft: '30px', marginTop: '4px' }}>
                            Setting this as active will automatically deactivate all other seasons.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            className="premium-btn premium-btn-secondary"
                            onClick={() => navigate('/seasons')}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="premium-btn premium-btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : isEdit ? 'Update Season' : 'Create Season'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SeasonForm;
