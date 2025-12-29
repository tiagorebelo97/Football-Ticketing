import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { clubService, Country, UpdateClubData } from '../services/clubService';
import '../index.css';

const ClubSettings: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [countries, setCountries] = useState<Country[]>([]);

    const [formData, setFormData] = useState<UpdateClubData>({
        name: '',
        short_name: '',
        logo_url: '',
        country_id: '',
        founded_year: undefined,
        stadium_capacity: undefined,
        website: '',
        primary_color: '#FF0000',
        secondary_color: '#0000FF'
    });

    useEffect(() => {
        loadData();
        // loadData is intentionally not in the dependency array to prevent infinite loops
        // We only want to reload data when the clubId changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.clubId]);

    const loadData = async () => {
        if (!user?.clubId) return;

        try {
            setLoading(true);
            const [clubData, countriesData] = await Promise.all([
                clubService.getClubById(user.clubId),
                clubService.getCountries()
            ]);

            setFormData({
                name: clubData.name,
                short_name: clubData.short_name || '',
                logo_url: clubData.logo_url || '',
                country_id: clubData.country_id || '',
                founded_year: clubData.founded_year || undefined,
                stadium_capacity: clubData.stadium_capacity || undefined,
                website: clubData.website || '',
                primary_color: clubData.primary_color,
                secondary_color: clubData.secondary_color
            });

            setCountries(countriesData);
        } catch (error: any) {
            console.error('Error loading club data:', error);
            setMessage({ type: 'error', text: 'Failed to load club information' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user?.clubId) return;

        try {
            setSaving(true);
            setMessage(null);

            await clubService.updateClub(user.clubId, formData);

            setMessage({ 
                type: 'success', 
                text: 'Club information updated successfully! Please refresh the page to see the changes in the sidebar.' 
            });
        } catch (error: any) {
            console.error('Error updating club:', error);
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.error || 'Failed to update club information' 
            });
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value ? parseInt(value, 10) : undefined
        }));
    };

    if (loading) {
        return (
            <div style={{ padding: '32px' }}>
                <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
                    <div className="spinner" style={{ margin: '0 auto' }} />
                    <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Loading club settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '32px' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 className="text-gradient" style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>
                    Club Settings
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>
                    Update your club's information to keep it current for fans and members
                </p>
            </div>

            {message && (
                <div className="glass-card" style={{
                    padding: '16px 20px',
                    marginBottom: '24px',
                    background: message.type === 'success' 
                        ? 'rgba(46, 213, 115, 0.1)' 
                        : 'rgba(245, 59, 87, 0.1)',
                    borderLeft: `4px solid ${message.type === 'success' ? '#2ed573' : '#f53b57'}`
                }}>
                    <p style={{ 
                        color: message.type === 'success' ? '#2ed573' : '#f53b57',
                        fontWeight: 500,
                        margin: 0
                    }}>
                        {message.text}
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="glass-card" style={{ padding: '32px', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-main)' }}>
                        Basic Information
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontWeight: 600 }}>
                                Club Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border-glass)',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    color: 'var(--text-main)',
                                    fontSize: '14px'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontWeight: 600 }}>
                                Short Name
                            </label>
                            <input
                                type="text"
                                name="short_name"
                                value={formData.short_name}
                                onChange={handleInputChange}
                                maxLength={100}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border-glass)',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    color: 'var(--text-main)',
                                    fontSize: '14px'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontWeight: 600 }}>
                                Founded Year
                            </label>
                            <input
                                type="number"
                                name="founded_year"
                                value={formData.founded_year || ''}
                                onChange={handleNumberChange}
                                min="1800"
                                max={new Date().getFullYear()}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border-glass)',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    color: 'var(--text-main)',
                                    fontSize: '14px'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontWeight: 600 }}>
                                Country
                            </label>
                            <select
                                name="country_id"
                                value={formData.country_id}
                                onChange={handleInputChange}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border-glass)',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    color: 'var(--text-main)',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="">Select a country</option>
                                {countries.map(country => (
                                    <option key={country.id} value={country.id}>
                                        {country.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontWeight: 600 }}>
                                Website
                            </label>
                            <input
                                type="url"
                                name="website"
                                value={formData.website}
                                onChange={handleInputChange}
                                placeholder="https://example.com"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border-glass)',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    color: 'var(--text-main)',
                                    fontSize: '14px'
                                }}
                            />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontWeight: 600 }}>
                                Logo URL
                            </label>
                            <input
                                type="url"
                                name="logo_url"
                                value={formData.logo_url}
                                onChange={handleInputChange}
                                placeholder="https://example.com/logo.png"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border-glass)',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    color: 'var(--text-main)',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '32px', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-main)' }}>
                        Stadium Information
                    </h2>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontWeight: 600 }}>
                            Stadium Capacity
                        </label>
                        <input
                            type="number"
                            name="stadium_capacity"
                            value={formData.stadium_capacity || ''}
                            onChange={handleNumberChange}
                            min="0"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-glass)',
                                background: 'rgba(255, 255, 255, 0.03)',
                                color: 'var(--text-main)',
                                fontSize: '14px'
                            }}
                        />
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '32px', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-main)' }}>
                        Branding Colors
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontWeight: 600 }}>
                                Primary Color
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <input
                                    type="color"
                                    name="primary_color"
                                    value={formData.primary_color}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '60px',
                                        height: '48px',
                                        border: '1px solid var(--border-glass)',
                                        borderRadius: 'var(--radius-sm)',
                                        cursor: 'pointer'
                                    }}
                                />
                                <input
                                    type="text"
                                    name="primary_color"
                                    value={formData.primary_color}
                                    onChange={handleInputChange}
                                    pattern="^#[0-9A-Fa-f]{6}$"
                                    style={{
                                        flex: 1,
                                        padding: '12px 16px',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid var(--border-glass)',
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        color: 'var(--text-main)',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontWeight: 600 }}>
                                Secondary Color
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <input
                                    type="color"
                                    name="secondary_color"
                                    value={formData.secondary_color}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '60px',
                                        height: '48px',
                                        border: '1px solid var(--border-glass)',
                                        borderRadius: 'var(--radius-sm)',
                                        cursor: 'pointer'
                                    }}
                                />
                                <input
                                    type="text"
                                    name="secondary_color"
                                    value={formData.secondary_color}
                                    onChange={handleInputChange}
                                    pattern="^#[0-9A-Fa-f]{6}$"
                                    style={{
                                        flex: 1,
                                        padding: '12px 16px',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid var(--border-glass)',
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        color: 'var(--text-main)',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                    <button
                        type="button"
                        onClick={loadData}
                        disabled={saving}
                        style={{
                            padding: '14px 32px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-glass)',
                            background: 'rgba(255, 255, 255, 0.03)',
                            color: 'var(--text-main)',
                            fontSize: '15px',
                            fontWeight: 600,
                            cursor: saving ? 'not-allowed' : 'pointer',
                            opacity: saving ? 0.5 : 1
                        }}
                    >
                        Reset
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="glow-button"
                        style={{
                            padding: '14px 32px',
                            borderRadius: 'var(--radius-sm)',
                            border: 'none',
                            background: 'var(--accent-primary)',
                            color: 'var(--dark-bg)',
                            fontSize: '15px',
                            fontWeight: 700,
                            cursor: saving ? 'not-allowed' : 'pointer',
                            opacity: saving ? 0.5 : 1
                        }}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ClubSettings;
