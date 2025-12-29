import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { memberService } from '../services/memberService';
import { useAuth } from '../context/AuthContext';
import '../App.css';

interface Member {
  id: string;
  member_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  member_type: string;
  member_since: string;
  quota_amount: number;
  paid_quotas: number;
  overdue_quotas: number;
}

interface MemberStats {
  members: {
    total_members: string;
    active_members: string;
    suspended_members: string;
    cancelled_members: string;
  };
  quotas: {
    paid_quotas: string;
    overdue_quotas: string;
    total_revenue: string;
  };
}

const MemberList: React.FC = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const clubId = user?.clubId;

  useEffect(() => {
    fetchMembers();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubId, searchTerm, statusFilter, typeFilter]);

  const fetchMembers = async () => {
    if (!clubId) return;
    try {
      setLoading(true);
      const data = await memberService.listMembers(clubId, {
        search: searchTerm,
        status: statusFilter,
        memberType: typeFilter
      });
      setMembers(data.members);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load members';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!clubId) return;
    try {
      const data = await memberService.getMemberStats(clubId);
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this member?') || !clubId) return;

    try {
      await memberService.deleteMember(id);
      fetchMembers();
      fetchStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deactivate member';
      alert('Failed to deactivate member: ' + errorMessage);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      alert('Please select a file to import');
      return;
    }

    if (!importFile || !clubId) return;

    try {
      setImportStatus('Importing...');
      const result = await memberService.importMembers(clubId, importFile);
      setImportStatus(`Import completed: ${result.results.success} succeeded, ${result.results.failed} failed`);
      setTimeout(() => {
        setShowImportModal(false);
        setImportFile(null);
        setImportStatus(null);
        fetchMembers();
        fetchStats();
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Import failed';
      setImportStatus('Import failed: ' + errorMessage);
    }
  };

  const downloadTemplate = () => {
    const template = `Member Number,First Name,Last Name,Email,Phone,Date of Birth,Address,City,Postal Code,Country,Member Since,Status,Member Type,Quota Amount,Quota Frequency,Notes
12345,João,Silva,joao.silva@example.com,+351912345678,1990-01-15,Rua Example 123,Lisboa,1000-001,Portugal,2020-01-01,active,regular,25.00,monthly,
12346,Maria,Santos,maria.santos@example.com,+351923456789,1985-05-20,Av. Example 456,Porto,4000-001,Portugal,2021-06-15,active,premium,50.00,monthly,`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'members_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const isSuccess = status === 'active';
    const isWarning = status === 'suspended';

    return (
      <span className={`badge ${isSuccess ? 'badge-success' : isWarning ? 'badge-warning' : ''}`} style={{
        backgroundColor: !isSuccess && !isWarning ? 'rgba(255, 255, 255, 0.05)' : undefined,
        color: !isSuccess && !isWarning ? 'var(--text-muted)' : undefined,
        border: !isSuccess && !isWarning ? '1px solid var(--border-glass)' : undefined,
      }}>
        {status}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, { bg: string, text: string }> = {
      regular: { bg: 'rgba(79, 172, 254, 0.1)', text: 'var(--accent-secondary)' },
      premium: { bg: 'rgba(112, 0, 255, 0.1)', text: '#a855f7' },
      vip: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' },
      junior: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981' },
      senior: { bg: 'rgba(94, 114, 228, 0.1)', text: '#5e72e4' }
    };

    const style = colors[type] || { bg: 'rgba(255, 255, 255, 0.05)', text: 'var(--text-muted)' };

    return (
      <span className="badge" style={{
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.bg.replace('0.1', '0.2')}`
      }}>
        {type}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: 0, color: '#ffffff', fontSize: '2.5rem' }}>Club Members</h1>
          <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            Manage and monitor your club's member base and revenue
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setShowImportModal(true)} className="premium-btn premium-btn-secondary">
            <span>📥</span> Import Excel
          </button>
          <Link to="/members/create" className="premium-btn premium-btn-primary" style={{ textDecoration: 'none' }}>
            <span>+</span> Add Member
          </Link>
        </div>
      </div>

      {/* Statistics Row */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Members</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffffff' }}>{stats.members.total_members}</div>
          </div>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Members</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>{stats.members.active_members}</div>
          </div>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Overdue Quotas</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>{stats.quotas.overdue_quotas}</div>
          </div>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Revenue</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
              €{parseFloat(stats.quotas.total_revenue).toLocaleString('pt-PT', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      )}

      {/* Members Main Section */}
      <div className="glass-card" style={{ padding: '24px' }}>
        {/* Filters Panel */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by name, email, or member number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-glass)',
                borderRadius: '12px',
                color: '#ffffff',
                outline: 'none'
              }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-glass)',
              borderRadius: '12px',
              color: '#ffffff',
              minWidth: '150px'
            }}
          >
            <option value="" style={{ background: '#1a1c23' }}>All Status</option>
            <option value="active" style={{ background: '#1a1c23' }}>Active</option>
            <option value="suspended" style={{ background: '#1a1c23' }}>Suspended</option>
            <option value="cancelled" style={{ background: '#1a1c23' }}>Cancelled</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-glass)',
              borderRadius: '12px',
              color: '#ffffff',
              minWidth: '150px'
            }}
          >
            <option value="" style={{ background: '#1a1c23' }}>All Types</option>
            <option value="regular" style={{ background: '#1a1c23' }}>Regular</option>
            <option value="premium" style={{ background: '#1a1c23' }}>Premium</option>
            <option value="vip" style={{ background: '#1a1c23' }}>VIP</option>
            <option value="junior" style={{ background: '#1a1c23' }}>Junior</option>
            <option value="senior" style={{ background: '#1a1c23' }}>Senior</option>
          </select>
        </div>

        {loading && <div className="loading">Updating member list...</div>}
        {error && <div className="error">{error}</div>}

        {!loading && !error && (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Member #</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Member Since</th>
                  <th>Quota</th>
                  <th>Quotas Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No members found matching your search criteria.
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr key={member.id}>
                      <td style={{ fontWeight: '500', color: 'var(--accent-secondary)' }}>{member.member_number}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '600' }}>{member.first_name} {member.last_name}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{member.email}</span>
                        </div>
                      </td>
                      <td>{getStatusBadge(member.status)}</td>
                      <td>{getTypeBadge(member.member_type)}</td>
                      <td>{new Date(member.member_since).toLocaleDateString()}</td>
                      <td style={{ fontWeight: '500' }}>€{parseFloat(member.quota_amount.toString()).toFixed(2)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#10b981', fontWeight: '500' }}>{member.paid_quotas} paid</span>
                          {member.overdue_quotas > 0 && (
                            <span style={{
                              color: 'var(--color-danger)',
                              fontSize: '12px',
                              background: 'rgba(231, 76, 60, 0.1)',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}>
                              {member.overdue_quotas} overdue
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <Link to={`/members/${member.id}`} className="premium-btn premium-btn-secondary" style={{ padding: '6px 12px', fontSize: '13px', textDecoration: 'none' }}>
                            View
                          </Link>
                          <Link to={`/members/${member.id}/edit`} className="premium-btn premium-btn-secondary" style={{ padding: '6px 12px', fontSize: '13px', textDecoration: 'none' }}>
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(member.id)}
                            className="premium-btn"
                            style={{
                              padding: '6px 12px',
                              fontSize: '13px',
                              background: 'rgba(231, 76, 60, 0.1)',
                              color: 'var(--color-danger)',
                              border: '1px solid rgba(231, 76, 60, 0.2)'
                            }}
                          >
                            Deactivate
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(10px)'
        }}>
          <div className="glass-card" style={{ width: '540px', maxWidth: '95%', padding: '32px' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Import Members</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Upload an Excel (.xlsx) or CSV file with member information to batch create records.</p>

            <button onClick={downloadTemplate} className="premium-btn premium-btn-secondary" style={{ marginBottom: '16px', width: '100%', justifyContent: 'center' }}>
              📥 Download CSV Template
            </button>

            <div style={{
              border: '2px dashed var(--border-glass)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              marginBottom: '24px',
              background: 'rgba(255, 255, 255, 0.02)'
            }}>
              <input
                type="file"
                id="member-import-file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                style={{ display: 'none' }}
              />
              <label htmlFor="member-import-file" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>📄</span>
                <span style={{ fontWeight: '600' }}>{importFile ? importFile.name : 'Select or drop file here'}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Supported formats: .xlsx, .xls, .csv</span>
              </label>
            </div>

            {importStatus && (
              <div style={{
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '24px',
                background: importStatus.includes('failed') ? 'rgba(231, 76, 60, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                color: importStatus.includes('failed') ? 'var(--color-danger)' : '#10b981',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                {importStatus}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                  setImportStatus(null);
                }}
                className="premium-btn premium-btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleImport} className="premium-btn premium-btn-primary" disabled={!importFile || importStatus === 'Importing...'}>
                {importStatus === 'Importing...' ? 'Processing...' : 'Start Import'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

};

export default MemberList;
