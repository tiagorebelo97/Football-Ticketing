import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

interface Country {
    id: string;
    name: string;
}

const CompetitionForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        short_name: '',
        type: 'league',
        country_id: '',
        logo_url: ''
    });
    const [countries, setCountries] = useState<Country[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadCountries();
        if (isEdit && id) {
            loadCompetition();
        }
    }, [id]);

    const loadCountries = async () => {
        try {
            const response = await axios.get('/api/countries', { params: { perPage: 100 } });
            setCountries(response.data.data || []);
        } catch (err) {
            console.error('Failed to load countries');
        }
    };

    const loadCompetition = async () => {
        try {
            const response = await axios.get(`/api/competitions/${id}`);
            const data = response.data;
            setFormData({
                name: data.name || '',
                short_name: data.short_name || '',
                type: data.type || 'league',
                country_id: data.country_id || '',
                logo_url: data.logo_url || ''
            });
        } catch (err) {
            setError('Failed to load competition');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isEdit) {
                await axios.put(`/api/competitions/${id}`, formData);
            } else {
                await axios.post('/api/competitions', formData);
            }
            navigate('/competitions');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to save competition');
            setLoading(false);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <button
                    onClick={() => navigate('/competitions')}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '14px',
                        marginBottom: '16px'
                    }}
                >
                    ← Back to Competitions
                </button>
                <h1 className="text-gradient" style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>
                    {isEdit ? 'Edit Competition' : 'Add Competition'}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>
                    {isEdit ? 'Update competition details' : 'Create a new competition'}
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
                            Competition Name <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Premier League"
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
                                Short Name
                            </label>
                            <input
                                type="text"
                                value={formData.short_name}
                                onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
                                placeholder="e.g., EPL"
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
                                Type <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <select
                                required
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border-glass)',
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--text-main)',
                                    fontSize: '15px'
                                }}
                            >
                                <option value="league">League</option>
                                <option value="cup">Cup</option>
                                <option value="international">International</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                            Country <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <select
                            required
                            value={formData.country_id}
                            onChange={(e) => setFormData({ ...formData, country_id: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border-glass)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-main)',
                                fontSize: '15px'
                            }}
                        >
                            <option value="">Select a country</option>
                            {countries.map((country) => (
                                <option key={country.id} value={country.id}>{country.name}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                            Logo URL
                        </label>
                        <input
                            type="url"
                            value={formData.logo_url}
                            onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                            placeholder="https://example.com/logo.png"
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

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            className="premium-btn premium-btn-secondary"
                            onClick={() => navigate('/competitions')}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="premium-btn premium-btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : isEdit ? 'Update Competition' : 'Create Competition'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompetitionForm;
