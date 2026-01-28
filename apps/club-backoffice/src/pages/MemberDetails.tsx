import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { memberService } from '../services/memberService';
import { useTranslation } from 'react-i18next';
import '../App.css';

interface Member {
  id: string;
  member_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  member_since: string;
  status: string;
  member_type: string;
  quota_amount: number;
  quota_frequency: string;
  notes: string;
}

interface Quota {
  id: string;
  amount: number;
  payment_date: string;
  period_start: string;
  period_end: string;
  payment_method: string;
  status: string;
  reference: string;
  notes: string;
  recorded_by: string;
}

const MemberDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [quotas, setQuotas] = useState<Quota[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuotaForm, setShowQuotaForm] = useState(false);
  const [quotaFormData, setQuotaFormData] = useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    period_start: '',
    period_end: '',
    payment_method: 'cash',
    status: 'paid',
    reference: '',
    notes: ''
  });

  useEffect(() => {
    if (id) {
      fetchMember();
      fetchQuotas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchMember = async () => {
    try {
      setLoading(true);
      const data = await memberService.getMember(id!);
      setMember(data);
      setQuotaFormData(prev => ({
        ...prev,
        amount: data.quota_amount.toString()
      }));
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load member';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuotas = async () => {
    try {
      const data = await memberService.getMemberQuotas(id!);
      setQuotas(data);
    } catch (err) {
      console.error('Failed to load quotas:', err);
    }
  };

  const handleQuotaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await memberService.createQuotaPayment(id!, quotaFormData);
      setShowQuotaForm(false);
      setQuotaFormData({
        amount: member?.quota_amount.toString() || '',
        payment_date: new Date().toISOString().split('T')[0],
        period_start: '',
        period_end: '',
        payment_method: 'cash',
        status: 'paid',
        reference: '',
        notes: ''
      });
      fetchQuotas();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add quota payment';
      alert('Failed to add quota payment: ' + errorMessage);
    }
  };

  if (loading) return <div className="loading">Loading member data...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!member) return <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>Member not found</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="font-premium text-gradient" style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800 }}>Member Details</h1>
          <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            View and manage member information and quota history
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate(`/members/${id}/edit`)} className="premium-btn premium-btn-secondary">
            Edit Member
          </button>
          <button onClick={() => navigate('/members')} className="premium-btn premium-btn-secondary">
            Back to List
          </button>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '32px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div className="glass-card" style={{ padding: 'var(--content-padding)' }}>
            <h3 className="font-premium" style={{ fontSize: '1.5rem', marginBottom: '24px', color: 'var(--accent-secondary)' }}>Personal Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Member Number</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--accent-secondary)' }}>{member.member_number}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Full Name</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#ffffff' }}>{member.first_name} {member.last_name}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Email Address</div>
                <div style={{ fontSize: '1rem', color: '#ffffff' }}>{member.email}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Phone Number</div>
                <div style={{ fontSize: '1rem', color: '#ffffff' }}>{member.phone || 'N/A'}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Date of Birth</div>
                <div style={{ fontSize: '1rem', color: '#ffffff' }}>{member.date_of_birth ? new Date(member.date_of_birth).toLocaleDateString() : 'N/A'}</div>
              </div>
            </div>

            <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid var(--border-glass)' }}>
              <h3 className="font-premium" style={{ fontSize: '1.5rem', marginBottom: '24px', color: 'var(--accent-secondary)' }}>Address Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Street Address</div>
                  <div style={{ fontSize: '1rem', color: '#ffffff' }}>{member.address || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>City</div>
                  <div style={{ fontSize: '1rem', color: '#ffffff' }}>{member.city || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Postal Code</div>
                  <div style={{ fontSize: '1rem', color: '#ffffff' }}>{member.postal_code || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Country</div>
                  <div style={{ fontSize: '1rem', color: '#ffffff' }}>{member.country || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: 'var(--content-padding)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 className="font-premium" style={{ fontSize: '1.5rem', margin: 0, color: 'var(--accent-secondary)' }}>Quota Payment History</h3>
              <button onClick={() => setShowQuotaForm(!showQuotaForm)} className="premium-btn premium-btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>
                {showQuotaForm ? 'Cancel' : '+ Add Payment'}
              </button>
            </div>

            {showQuotaForm && (
              <div style={{ marginBottom: '32px', padding: '24px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
                <form onSubmit={handleQuotaSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <div className="form-group">
                      <label>Amount (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={quotaFormData.amount}
                        onChange={(e) => setQuotaFormData({ ...quotaFormData, amount: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Payment Date</label>
                      <input
                        type="date"
                        value={quotaFormData.payment_date}
                        onChange={(e) => setQuotaFormData({ ...quotaFormData, payment_date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Period Start</label>
                      <input
                        type="date"
                        value={quotaFormData.period_start}
                        onChange={(e) => setQuotaFormData({ ...quotaFormData, period_start: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Period End</label>
                      <input
                        type="date"
                        value={quotaFormData.period_end}
                        onChange={(e) => setQuotaFormData({ ...quotaFormData, period_end: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Payment Method</label>
                      <select
                        value={quotaFormData.payment_method}
                        onChange={(e) => setQuotaFormData({ ...quotaFormData, payment_method: e.target.value })}
                      >
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="transfer">Bank Transfer</option>
                        <option value="stripe">Stripe</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Reference</label>
                      <input
                        type="text"
                        value={quotaFormData.reference}
                        onChange={(e) => setQuotaFormData({ ...quotaFormData, reference: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginTop: '16px' }}>
                    <label>Notes</label>
                    <textarea
                      value={quotaFormData.notes}
                      onChange={(e) => setQuotaFormData({ ...quotaFormData, notes: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <button type="submit" className="premium-btn premium-btn-primary">Save Payment</button>
                  </div>
                </form>
              </div>
            )}

            <div className="responsive-table-wrapper">
              <table className="table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px', minWidth: '600px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '12px 32px', border: 'none' }}>Date</th>
                    <th style={{ padding: '12px 32px', border: 'none' }}>Period</th>
                    <th style={{ padding: '12px 32px', border: 'none' }}>Amount</th>
                    <th style={{ padding: '12px 32px', border: 'none' }}>Method</th>
                    <th style={{ padding: '12px 32px', border: 'none' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {quotas.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No quota payments recorded yet.
                      </td>
                    </tr>
                  ) : (
                    quotas.map((quota) => (
                      <tr key={quota.id} className="table-row-hover">
                        <td style={{ padding: '16px 32px', border: 'none', color: '#ffffff' }}>{new Date(quota.payment_date).toLocaleDateString()}</td>
                        <td style={{ padding: '16px 32px', border: 'none', color: 'var(--text-muted)', fontSize: '13px' }}>
                          {new Date(quota.period_start).toLocaleDateString()} - {new Date(quota.period_end).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '16px 32px', border: 'none', fontWeight: '700', color: 'var(--accent-secondary)' }}>€{parseFloat(quota.amount.toString()).toFixed(2)}</td>
                        <td style={{ padding: '16px 32px', border: 'none', color: '#ffffff', textTransform: 'capitalize' }}>{quota.payment_method}</td>
                        <td style={{ padding: '16px 32px', border: 'none' }}>
                          <span className={`badge ${quota.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                            {quota.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div className="glass-card" style={{ padding: 'var(--content-padding)' }}>
            <h3 className="font-premium" style={{ fontSize: '1.5rem', marginBottom: '24px', color: 'var(--accent-secondary)' }}>Membership</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Current Status</div>
                <span className={`badge ${member.status === 'active' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '14px', padding: '6px 16px' }}>
                  {member.status}
                </span>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Member Type</div>
                <div style={{ display: 'flex' }}>
                  <span className="badge" style={{
                    background: 'rgba(112, 0, 255, 0.1)',
                    color: '#a855f7',
                    border: '1px solid rgba(112, 0, 255, 0.2)',
                    fontSize: '14px',
                    padding: '6px 16px'
                  }}>
                    {member.member_type}
                  </span>
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Subscription Details</div>
                <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Amount:</span>
                    <span style={{ fontWeight: '700', color: '#ffffff' }}>€{parseFloat(member.quota_amount.toString()).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Frequency:</span>
                    <span style={{ color: '#ffffff', textTransform: 'capitalize' }}>{member.quota_frequency}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Member Since:</span>
                    <span style={{ color: '#ffffff' }}>{new Date(member.member_since).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: 'var(--content-padding)' }}>
            <h3 className="font-premium" style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--accent-secondary)' }}>Internal Notes</h3>
            <p style={{ color: member.notes ? '#ffffff' : 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', fontStyle: member.notes ? 'normal' : 'italic' }}>
              {member.notes || 'No internal notes found for this member.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDetails;
