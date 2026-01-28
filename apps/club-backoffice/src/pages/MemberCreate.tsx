import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { memberService } from '../services/memberService';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import '../App.css';

const MemberCreate: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const clubId = user?.clubId || 'test-club-id';

  const [formData, setFormData] = useState({
    member_number: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'Portugal',
    member_since: new Date().toISOString().split('T')[0],
    status: 'active',
    member_type: 'regular',
    quota_amount: '25.00',
    quota_frequency: 'monthly',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await memberService.createMember(clubId, formData);
      navigate('/members');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create member';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: 'var(--content-padding)' }}>
      <h1 className="font-premium text-gradient" style={{ fontSize: '2rem', marginBottom: '32px' }}>Add New Member</h1>

      {error && (
        <div style={{
          padding: '16px',
          marginBottom: '24px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
          borderRadius: '12px',
          border: '1px solid rgba(239, 68, 68, 0.2)'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px',
          marginBottom: '32px'
        }}>
          {/* Personal Information */}
          <div>
            <h3 className="font-premium" style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'var(--accent-secondary)' }}>Personal Information</h3>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label>Member Number *</label>
              <input
                type="text"
                name="member_number"
                value={formData.member_number}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Unique member ID"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Address & Membership */}
          <div>
            <h3 className="font-premium" style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'var(--accent-secondary)' }}>Address & Membership</h3>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Postal Code</label>
                <input
                  type="text"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label>Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label>Member Since *</label>
              <input
                type="date"
                name="member_since"
                value={formData.member_since}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-input"
                  style={{ background: 'rgba(255, 255, 255, 0.03)' }}
                >
                  <option value="active" style={{ background: '#0f111a' }}>Active</option>
                  <option value="suspended" style={{ background: '#0f111a' }}>Suspended</option>
                  <option value="cancelled" style={{ background: '#0f111a' }}>Cancelled</option>
                </select>
              </div>
              <div className="form-group">
                <label>Member Type</label>
                <select
                  name="member_type"
                  value={formData.member_type}
                  onChange={handleChange}
                  className="form-input"
                  style={{ background: 'rgba(255, 255, 255, 0.03)' }}
                >
                  <option value="regular" style={{ background: '#0f111a' }}>Regular</option>
                  <option value="premium" style={{ background: '#0f111a' }}>Premium</option>
                  <option value="vip" style={{ background: '#0f111a' }}>VIP</option>
                  <option value="junior" style={{ background: '#0f111a' }}>Junior</option>
                  <option value="senior" style={{ background: '#0f111a' }}>Senior</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Quota Information */}
        <div style={{
          paddingTop: '32px',
          marginTop: '32px',
          borderTop: '1px solid var(--border-glass)',
          marginBottom: '32px'
        }}>
          <h3 className="font-premium" style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'var(--accent-secondary)' }}>Quota Information</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div className="form-group">
              <label>Quota Amount (€)</label>
              <input
                type="number"
                step="0.01"
                name="quota_amount"
                value={formData.quota_amount}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Quota Frequency</label>
              <select
                name="quota_frequency"
                value={formData.quota_frequency}
                onChange={handleChange}
                className="form-input"
                style={{ background: 'rgba(255, 255, 255, 0.03)' }}
              >
                <option value="monthly" style={{ background: '#0f111a' }}>Monthly</option>
                <option value="quarterly" style={{ background: '#0f111a' }}>Quarterly</option>
                <option value="annual" style={{ background: '#0f111a' }}>Annual</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Internal Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="form-input"
              placeholder="Any additional information..."
              style={{ resize: 'vertical', minHeight: '100px' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => navigate('/members')}
            className="premium-btn premium-btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="premium-btn premium-btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Member'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MemberCreate;
