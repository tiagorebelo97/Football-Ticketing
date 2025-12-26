import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaCog, FaSave, FaUndo } from 'react-icons/fa';

interface SettingsData {
    session_duration_hours: {
        value: string;
        description: string;
        updated_at: string;
    };
    remember_me_duration_days: {
        value: string;
        description: string;
        updated_at: string;
    };
}

const Settings: React.FC = () => {
    const [settings, setSettings] = useState<SettingsData | null>(null);
    const [sessionDuration, setSessionDuration] = useState('24');
    const [rememberMeDuration, setRememberMeDuration] = useState('30');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await axios.get('/api/settings');
            setSettings(response.data);
            setSessionDuration(response.data.session_duration_hours.value);
            setRememberMeDuration(response.data.remember_me_duration_days.value);
        } catch (err) {
            setError('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            await Promise.all([
                axios.put('/api/settings/session_duration_hours', { value: sessionDuration }),
                axios.put('/api/settings/remember_me_duration_days', { value: rememberMeDuration })
            ]);

            setSuccess('Settings saved successfully! Changes will apply to new logins.');
            await fetchSettings();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        if (settings) {
            setSessionDuration(settings.session_duration_hours.value);
            setRememberMeDuration(settings.remember_me_duration_days.value);
            setError('');
            setSuccess('');
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'var(--text-muted)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="text-gradient" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Loading Settings...</div>
                    <p>Fetching configuration</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '48px' }}>
                <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    boxShadow: '0 8px 16px rgba(0, 242, 254, 0.2)'
                }}>
                    <FaCog />
                </div>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>System Configuration</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Manage platform-wide settings and parameters</p>
                </div>
            </div>

            {error && (
                <div className="glass-effect" style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '24px',
                    fontSize: '14px',
                    border: '1px solid rgba(239, 68, 68, 0.2)'
                }}>
                    {error}
                </div>
            )}

            {success && (
                <div className="glass-effect" style={{
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    color: '#22c55e',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '24px',
                    fontSize: '14px',
                    border: '1px solid rgba(34, 197, 94, 0.2)'
                }}>
                    {success}
                </div>
            )}

            <div className="glass-card" style={{ padding: '40px', marginBottom: '24px' }}>
                <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>
                        Session Management
                    </h2>
                    <p style={{ fontSize: '14px', color: 'var(--text-dim)' }}>
                        Configure authentication session durations for the platform
                    </p>
                </div>

                <div style={{ display: 'grid', gap: '32px' }}>
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '12px',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            Default Session Duration (hours)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="168"
                            value={sessionDuration}
                            onChange={(e) => setSessionDuration(e.target.value)}
                            className="glass-effect"
                            style={{
                                width: '100%',
                                padding: '14px 20px',
                                borderRadius: '12px',
                                color: 'white',
                                background: 'rgba(255,255,255,0.03)',
                                fontSize: '16px'
                            }}
                        />
                        <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginTop: '8px' }}>
                            Session expires after this many hours when "Remember Me" is not checked (1-168 hours)
                        </p>
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '12px',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            Remember Me Duration (days)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="365"
                            value={rememberMeDuration}
                            onChange={(e) => setRememberMeDuration(e.target.value)}
                            className="glass-effect"
                            style={{
                                width: '100%',
                                padding: '14px 20px',
                                borderRadius: '12px',
                                color: 'white',
                                background: 'rgba(255,255,255,0.03)',
                                fontSize: '16px'
                            }}
                        />
                        <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginTop: '8px' }}>
                            Session expires after this many days when "Remember Me" is checked (1-365 days)
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                <button
                    onClick={handleReset}
                    className="premium-btn premium-btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 24px' }}
                    disabled={saving}
                >
                    <FaUndo />
                    Reset Changes
                </button>
                <button
                    onClick={handleSave}
                    className="premium-btn premium-btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 24px' }}
                    disabled={saving}
                >
                    <FaSave />
                    {saving ? 'Saving...' : 'Save Configuration'}
                </button>
            </div>
        </div>
    );
};

export default Settings;
