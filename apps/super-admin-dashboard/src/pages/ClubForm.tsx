import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const ClubForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [countries, setCountries] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '', shortName: '', countryId: '', logoUrl: '', foundedYear: '', stadiumCapacity: '', website: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCountries();
    if (isEdit && id) loadClub();
  }, [id]);

  const loadCountries = async () => {
    const res = await axios.get('/api/countries', { params: { perPage: 100 } });
    setCountries(res.data.data || res.data);
  };

  const loadClub = async () => {
    try {
      const res = await axios.get(`/api/clubs/${id}`);
      const club = res.data;
      setFormData({
        name: club.name || '',
        shortName: club.short_name || '',
        countryId: club.country_id || '',
        logoUrl: club.logo_url || '',
        foundedYear: club.founded_year || '',
        stadiumCapacity: club.stadium_capacity || '',
        website: club.website || ''
      });
    } catch (err) {
      setError('Failed to load club');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await axios.put(`/api/clubs/${id}`, formData);
      } else {
        await axios.post('/api/clubs', { ...formData, slug: formData.name.toLowerCase().replace(/\s+/g, '-') });
      }
      navigate('/clubs');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save club');
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => navigate('/clubs')} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '16px' }}>← Back</button>
      <h1 className="text-gradient" style={{ fontSize: '36px', fontWeight: 800, marginBottom: '32px' }}>{isEdit ? 'Edit Club' : 'Add Club'}</h1>
      
      <div className="glass-card" style={{ padding: '32px', maxWidth: '700px' }}>
        {error && <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-sm)', color: '#ef4444', marginBottom: '24px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Club Name *</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Short Name</label>
            <input type="text" value={formData.shortName} onChange={(e) => setFormData({ ...formData, shortName: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Country *</label>
            <select required value={formData.countryId} onChange={(e) => setFormData({ ...formData, countryId: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}>
              <option value="">Select Country</option>
              {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Logo URL</label>
            <input type="url" value={formData.logoUrl} onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Founded Year</label>
              <input type="number" value={formData.foundedYear} onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Stadium Capacity</label>
              <input type="number" value={formData.stadiumCapacity} onChange={(e) => setFormData({ ...formData, stadiumCapacity: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} />
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Website</label>
            <input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="premium-btn premium-btn-secondary" onClick={() => navigate('/clubs')}>Cancel</button>
            <button type="submit" className="premium-btn premium-btn-primary" disabled={loading}>{loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClubForm;
