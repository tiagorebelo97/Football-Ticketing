import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import SearchableSelect from '../components/SearchableSelect';

interface Club {
    id: string;
    name: string;
}

const VenueForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        club_id: '',
        city: '',
        capacity: '',
        address: '',
        latitude: '',
        longitude: ''
    });
    const [clubs, setClubs] = useState<Club[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadClubs();
        if (isEdit && id) {
            loadVenue();
        }
    }, [id]);

    const loadClubs = async () => {
        try {
            // Need perPage to get all clubs
            const response = await axios.get('/api/clubs', { params: { perPage: 300 } });
            setClubs(response.data.data || []);
        } catch (err) {
            console.error('Failed to load clubs');
        }
    };

    const loadVenue = async () => {
        try {
            const response = await axios.get(`/api/venues/${id}`);
            const data = response.data;
            setFormData({
                name: data.name || '',
                club_id: data.club_id || '',
                city: data.city || '',
                capacity: data.capacity || '',
                address: data.address || '',
                latitude: data.latitude || '',
                longitude: data.longitude || ''
            });
        } catch (err: any) {
            console.error('Error loading venue:', err);
            setError(err.response?.data?.error || err.message || 'Failed to load venue');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                ...formData,
                capacity: formData.capacity ? parseInt(formData.capacity.toString()) : null,
                latitude: formData.latitude ? parseFloat(formData.latitude.toString()) : null,
                longitude: formData.longitude ? parseFloat(formData.longitude.toString()) : null,
                clubId: formData.club_id, // Map snake_case state to camelCase API expectation
            };

            if (isEdit) {
                await axios.put(`/api/venues/${id}`, payload);
            } else {
                await axios.post('/api/venues', payload);
            }
            navigate('/venues');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to save venue');
            setLoading(false);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <button
                    onClick={() => navigate('/venues')}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '14px',
                        marginBottom: '16px'
                    }}
                >
                    ← Back to Venues
                </button>
                <h1 className="text-gradient" style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>
                    {isEdit ? 'Edit Venue' : 'Add Venue'}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>
                    {isEdit ? 'Update venue details' : 'Register a new stadium or facility'}
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
                            Venue Name <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Old Trafford"
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

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                            Home Club <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <SearchableSelect
                            options={clubs.map(c => ({ id: c.id, name: c.name }))}
                            value={formData.club_id}
                            onChange={(val) => setFormData({ ...formData, club_id: val })}
                            placeholder="Select a club"
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                                City <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                placeholder="e.g., Manchester"
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
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                                Capacity
                            </label>
                            <input
                                type="number"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                placeholder="0"
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
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                            Address
                        </label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            rows={3}
                            placeholder="Full address..."
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border-glass)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-main)',
                                fontSize: '15px',
                                resize: 'none'
                            }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                                Latitude
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={formData.latitude}
                                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                placeholder="e.g., 41.1579"
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
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                                Longitude
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={formData.longitude}
                                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                placeholder="e.g., -8.6291"
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
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            className="premium-btn premium-btn-secondary"
                            onClick={() => navigate('/venues')}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="premium-btn premium-btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : isEdit ? 'Update Venue' : 'Create Venue'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VenueForm;
