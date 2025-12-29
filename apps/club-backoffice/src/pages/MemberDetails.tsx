import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { memberService } from '../services/memberService';
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
    } catch (err: any) {
      setError(err.message || 'Failed to load member');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuotas = async () => {
    try {
      const data = await memberService.getMemberQuotas(id!);
      setQuotas(data);
    } catch (err: any) {
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
    } catch (err: any) {
      alert('Failed to add quota payment: ' + err.message);
    }
  };

  if (loading) return <div className="card">Loading...</div>;
  if (error) return <div className="card" style={{ color: 'red' }}>{error}</div>;
  if (!member) return <div className="card">Member not found</div>;

  return (
    <div>
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Member Details / Detalhes do Sócio</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => navigate(`/members/${id}/edit`)} className="btn-secondary">
              Edit Member
            </button>
            <button onClick={() => navigate('/members')} className="btn-secondary">
              Back to List
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          <div>
            <h3>Personal Information</h3>
            <div style={{ marginBottom: '10px' }}>
              <strong>Member Number:</strong> {member.member_number}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Name:</strong> {member.first_name} {member.last_name}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Email:</strong> {member.email}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Phone:</strong> {member.phone || 'N/A'}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Date of Birth:</strong> {member.date_of_birth ? new Date(member.date_of_birth).toLocaleDateString() : 'N/A'}
            </div>
          </div>

          <div>
            <h3>Address</h3>
            <div style={{ marginBottom: '10px' }}>
              <strong>Address:</strong> {member.address || 'N/A'}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>City:</strong> {member.city || 'N/A'}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Postal Code:</strong> {member.postal_code || 'N/A'}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Country:</strong> {member.country || 'N/A'}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
          <h3>Membership Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div>
              <strong>Status:</strong>
              <span style={{
                marginLeft: '10px',
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: member.status === 'active' ? '#4caf50' : '#f44336',
                color: 'white',
                fontSize: '12px'
              }}>
                {member.status}
              </span>
            </div>
            <div>
              <strong>Type:</strong>
              <span style={{
                marginLeft: '10px',
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: '#2196f3',
                color: 'white',
                fontSize: '12px'
              }}>
                {member.member_type}
              </span>
            </div>
            <div>
              <strong>Member Since:</strong> {new Date(member.member_since).toLocaleDateString()}
            </div>
          </div>
          <div style={{ marginTop: '15px' }}>
            <strong>Quota:</strong> €{parseFloat(member.quota_amount.toString()).toFixed(2)} / {member.quota_frequency}
          </div>
          {member.notes && (
            <div style={{ marginTop: '15px' }}>
              <strong>Notes:</strong>
              <p style={{ marginTop: '5px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                {member.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>Quota Payment History / Histórico de Quotas</h3>
          <button onClick={() => setShowQuotaForm(!showQuotaForm)} className="btn">
            {showQuotaForm ? 'Cancel' : 'Add Payment'}
          </button>
        </div>

        {showQuotaForm && (
          <form onSubmit={handleQuotaSubmit} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Amount (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={quotaFormData.amount}
                  onChange={(e) => setQuotaFormData({ ...quotaFormData, amount: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Payment Date *</label>
                <input
                  type="date"
                  value={quotaFormData.payment_date}
                  onChange={(e) => setQuotaFormData({ ...quotaFormData, payment_date: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Period Start *</label>
                <input
                  type="date"
                  value={quotaFormData.period_start}
                  onChange={(e) => setQuotaFormData({ ...quotaFormData, period_start: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Period End *</label>
                <input
                  type="date"
                  value={quotaFormData.period_end}
                  onChange={(e) => setQuotaFormData({ ...quotaFormData, period_end: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Payment Method</label>
                <select
                  value={quotaFormData.payment_method}
                  onChange={(e) => setQuotaFormData({ ...quotaFormData, payment_method: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="transfer">Bank Transfer</option>
                  <option value="stripe">Stripe</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Reference</label>
                <input
                  type="text"
                  value={quotaFormData.reference}
                  onChange={(e) => setQuotaFormData({ ...quotaFormData, reference: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
            </div>
            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Notes</label>
              <textarea
                value={quotaFormData.notes}
                onChange={(e) => setQuotaFormData({ ...quotaFormData, notes: e.target.value })}
                rows={2}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
            <div style={{ marginTop: '15px' }}>
              <button type="submit" className="btn">Save Payment</button>
            </div>
          </form>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left' }}>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Payment Date</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Period</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Amount</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Method</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Status</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Reference</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {quotas.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '20px', textAlign: 'center' }}>
                    No quota payments recorded yet.
                  </td>
                </tr>
              ) : (
                quotas.map((quota) => (
                  <tr key={quota.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}>{new Date(quota.payment_date).toLocaleDateString()}</td>
                    <td style={{ padding: '10px' }}>
                      {new Date(quota.period_start).toLocaleDateString()} - {new Date(quota.period_end).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '10px' }}>€{parseFloat(quota.amount.toString()).toFixed(2)}</td>
                    <td style={{ padding: '10px' }}>{quota.payment_method}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: quota.status === 'paid' ? '#4caf50' : '#f44336',
                        color: 'white',
                        fontSize: '12px'
                      }}>
                        {quota.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>{quota.reference || '-'}</td>
                    <td style={{ padding: '10px' }}>{quota.recorded_by || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MemberDetails;
