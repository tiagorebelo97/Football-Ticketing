import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { clubService, Country, UpdateClubData } from '../services/clubService';
import { useTranslation } from 'react-i18next';
import '../index.css';

const ClubSettings: React.FC = () => {
    const { t } = useTranslation();
    const { user, updateClub } = useAuth();
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
            setMessage({ type: 'error', text: t('settings.loadError') });
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

            const updatedClub = await clubService.updateClub(user.clubId, formData);

            // Update global context to reflect changes immediately
            if (updatedClub) {
                updateClub({
                    id: updatedClub.id,
                    name: updatedClub.name,
                    slug: updatedClub.slug,
                    primaryColor: updatedClub.primary_color,
                    secondaryColor: updatedClub.secondary_color,
                    logoUrl: updatedClub.logo_url
                });
            }

            setMessage({
                type: 'success',
                text: t('settings.updateSuccess')
            });
        } catch (error: any) {
            console.error('Error updating club:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.error || t('settings.updateError')
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
                    <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
            <div style={{ marginBottom: '8px' }}>
                <h1 className="font-premium text-gradient" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>
                    {t('settings.title')}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                    {t('settings.subtitle')}
                </p>
            </div>

            {message && (
                <div style={{
                    padding: '16px 20px',
                    marginBottom: '24px',
                    background: message.type === 'success'
                        ? 'rgba(34, 197, 94, 0.1)'
                        : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${message.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                    borderRadius: '12px'
                }}>
                    <p style={{
                        color: message.type === 'success' ? '#22c55e' : '#ef4444',
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
                        {t('settings.basicInfo')}
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontWeight: 600 }}>
                                {t('settings.clubName')} *
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
                                {t('settings.shortName')}
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

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontWeight: 600 }}>
                                {t('settings.foundedYear')}
                            </label>
                            <input
                                type="number"
                                name="founded_year"
                                className="form-input"
                                value={formData.founded_year || ''}
                                onChange={handleNumberChange}
                                min="1800"
                                max={new Date().getFullYear()}
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontWeight: 600 }}>
                                {t('settings.country')}
                            </label>
                            <select
                                name="country_id"
                                className="form-input"
                                value={formData.country_id}
                                onChange={handleInputChange}
                            >
                                <option value="">{t('settings.selectCountry')}</option>
                                {countries.map(country => (
                                    <option key={country.id} value={country.id}>
                                        {country.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ marginTop: '24px' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontWeight: 600 }}>
                                {t('settings.website')}
                            </label>
                            <input
                                type="url"
                                name="website"
                                className="form-input"
                                value={formData.website}
                                onChange={handleInputChange}
                                placeholder="https://example.com"
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '24px' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontWeight: 600 }}>
                                {t('settings.logoUrl')}
                            </label>
                            <input
                                type="url"
                                name="logo_url"
                                className="form-input"
                                value={formData.logo_url}
                                onChange={handleInputChange}
                                placeholder="https://example.com/logo.png"
                            />
                        </div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '32px', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-main)' }}>
                        {t('settings.stadiumInfo')}
                    </h2>

                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontWeight: 600 }}>
                            {t('settings.stadiumCapacity')}
                        </label>
                        <input
                            type="number"
                            name="stadium_capacity"
                            className="form-input"
                            value={formData.stadium_capacity || ''}
                            onChange={handleNumberChange}
                            min="0"
                        />
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '32px', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-main)' }}>
                        {t('settings.brandingColors')}
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontWeight: 600 }}>
                                {t('settings.primaryColor')}
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <input
                                    type="color"
                                    name="primary_color"
                                    className="form-input"
                                    value={formData.primary_color}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '60px',
                                        height: '48px',
                                        padding: '4px',
                                        cursor: 'pointer'
                                    }}
                                />
                                <input
                                    type="text"
                                    name="primary_color"
                                    className="form-input"
                                    value={formData.primary_color}
                                    onChange={handleInputChange}
                                    pattern="^#[0-9A-Fa-f]{6}$"
                                    style={{ flex: 1 }}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontWeight: 600 }}>
                                {t('settings.secondaryColor')}
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <input
                                    type="color"
                                    name="secondary_color"
                                    className="form-input"
                                    value={formData.secondary_color}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '60px',
                                        height: '48px',
                                        padding: '4px',
                                        cursor: 'pointer'
                                    }}
                                />
                                <input
                                    type="text"
                                    name="secondary_color"
                                    className="form-input"
                                    value={formData.secondary_color}
                                    onChange={handleInputChange}
                                    pattern="^#[0-9A-Fa-f]{6}$"
                                    style={{ flex: 1 }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '32px' }}>
                    <button
                        type="button"
                        className="premium-btn premium-btn-secondary"
                        onClick={loadData}
                        disabled={saving}
                        style={{ padding: '12px 24px' }}
                    >
                        {t('common.reset')}
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="premium-btn premium-btn-primary"
                        style={{ padding: '12px 32px' }}
                    >
                        {saving ? t('common.saving') : t('common.saveChanges')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ClubSettings;
