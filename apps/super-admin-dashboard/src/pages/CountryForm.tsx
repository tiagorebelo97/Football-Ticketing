import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const CountryForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    flagUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit && id) {
      loadCountry();
    }
  }, [id]);

  const loadCountry = async () => {
    try {
      const response = await axios.get(`/api/countries/${id}`);
      const country = response.data;
      setFormData({
        name: country.name || '',
        code: country.code || '',
        flagUrl: country.flag_url || ''
      });
    } catch (err) {
      setError('Failed to load country');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEdit) {
        await axios.put(`/api/countries/${id}`, formData);
      } else {
        await axios.post('/api/countries', formData);
      }
      navigate('/countries');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save country');
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <button
          onClick={() => navigate('/countries')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '14px',
            marginBottom: '16px'
          }}
        >
          ← Back to Countries
        </button>
        <h1 className="text-gradient" style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>
          {isEdit ? 'Edit Country' : 'Add Country'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>
          {isEdit ? 'Update country information' : 'Add a new country to the system'}
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
              Country Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Portugal"
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
              Country Code (ISO) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              required
              maxLength={3}
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g., PT or PRT"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-main)',
                fontSize: '15px',
                textTransform: 'uppercase'
              }}
            />
            <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginTop: '8px' }}>
              2 or 3 character ISO code
            </p>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
              Flag URL
            </label>
            <input
              type="url"
              value={formData.flagUrl}
              onChange={(e) => setFormData({ ...formData, flagUrl: e.target.value })}
              placeholder="https://example.com/flag.png"
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
              onClick={() => navigate('/countries')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="premium-btn premium-btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : isEdit ? 'Update Country' : 'Create Country'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CountryForm;
