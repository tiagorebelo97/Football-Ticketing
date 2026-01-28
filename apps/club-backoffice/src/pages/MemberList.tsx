import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { memberService } from '../services/memberService';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      const errorMessage = err instanceof Error ? err.message : t('common.errorLoading') || 'Failed to load members';
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
    if (!window.confirm(t('common.confirmDeactivate') || 'Are you sure you want to deactivate this member?') || !clubId) return;

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
      alert(t('common.selectFile') || 'Please select a file to import');
      return;
    }

    if (!importFile || !clubId) return;

    try {
      setImportStatus(t('common.importing') || 'Importing...');
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
    switch (status.toLowerCase()) {
      case 'active':
        return <span className="badge badge-success">{t('members.statusActive')}</span>;
      case 'suspended':
        return <span className="badge badge-warning">{t('members.statusSuspended')}</span>;
      case 'cancelled':
        return (
          <span className="badge" style={{
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-glass)'
          }}>
            {t('members.statusCancelled')}
          </span>
        );
      default:
        return <span className="badge" style={{ background: 'var(--bg-glass-light)', color: 'var(--text-muted)' }}>{status}</span>;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, { bg: string, text: string }> = {
      regular: { bg: 'rgba(79, 172, 254, 0.1)', text: 'var(--accent-secondary)' },
      premium: { bg: 'rgba(112, 0, 255, 0.1)', text: '#a855f7' },
      vip: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' },
      junior: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981' },
      senior: { bg: 'rgba(94, 114, 228, 0.1)', text: '#5e72e4' }
    };

    const style = colors[type.toLowerCase()] || { bg: 'rgba(255, 255, 255, 0.05)', text: 'var(--text-muted)' };

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h1 className="font-premium text-gradient" style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800 }}>{t('members.title')}</h1>
          <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            {t('members.subtitle')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={() => setShowImportModal(true)} className="premium-btn premium-btn-secondary" style={{ whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: '1.2em' }}>📥</span> {t('members.import')}
          </button>
          <Link to="/members/create" className="premium-btn premium-btn-primary" style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: '1.2em' }}>+</span> {t('members.add')}
          </Link>
        </div>
      </div>

      {/* Statistics Row */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>{t('members.stats.total')}</div>
            <div style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'Outfit' }}>{stats.members.total_members}</div>
          </div>
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>{t('members.stats.active')}</div>
            <div style={{ fontSize: '36px', fontWeight: '800', color: '#10b981', fontFamily: 'Outfit' }}>{stats.members.active_members}</div>
          </div>
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>{t('members.stats.overdue')}</div>
            <div style={{ fontSize: '36px', fontWeight: '800', color: '#f59e0b', fontFamily: 'Outfit' }}>{stats.quotas.overdue_quotas}</div>
          </div>
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>{t('members.stats.revenue')}</div>
            <div className="text-gradient" style={{ fontSize: '36px', fontWeight: '800', fontFamily: 'Outfit' }}>
              €{parseFloat(stats.quotas.total_revenue).toLocaleString('pt-PT', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      )}

      {/* Members Main Section */}
      <div className="glass-card" style={{ padding: 'var(--content-padding)' }}>
        {/* Filters Panel */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={{ gridColumn: '1 / -1', display: 'flex' }}>
            <input
              type="text"
              placeholder={t('members.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{
                width: '100%',
                padding: '14px 20px',
                background: 'var(--bg-glass-light)',
                border: '1px solid var(--border-glass)',
                borderRadius: '14px',
                color: 'var(--text-main)',
                outline: 'none',
                transition: 'var(--transition-smooth)'
              }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '14px 20px',
              background: 'var(--bg-glass-light)',
              border: '1px solid var(--border-glass)',
              borderRadius: '14px',
              color: 'var(--text-main)',
              outline: 'none'
            }}
          >
            <option value="" style={{ background: '#0f111a' }}>{t('members.allStatus')}</option>
            <option value="active" style={{ background: '#0f111a' }}>Active</option>
            <option value="suspended" style={{ background: '#0f111a' }}>Suspended</option>
            <option value="cancelled" style={{ background: '#0f111a' }}>Cancelled</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              padding: '14px 20px',
              background: 'var(--bg-glass-light)',
              border: '1px solid var(--border-glass)',
              borderRadius: '14px',
              color: 'var(--text-main)',
              outline: 'none'
            }}
          >
            <option value="" style={{ background: '#0f111a' }}>{t('members.allTypes')}</option>
            <option value="regular" style={{ background: '#0f111a' }}>Regular</option>
            <option value="premium" style={{ background: '#0f111a' }}>Premium</option>
            <option value="vip" style={{ background: '#0f111a' }}>VIP</option>
            <option value="junior" style={{ background: '#0f111a' }}>Junior</option>
            <option value="senior" style={{ background: '#0f111a' }}>Senior</option>
          </select>
        </div>

        {loading && <div className="loading" style={{ padding: '40px' }}>{t('common.loading')}</div>}
        {error && <div className="error">{error}</div>}

        {!loading && !error && (
          <div className="responsive-table-wrapper">
            <table className="table" style={{ borderCollapse: 'separate', borderSpacing: '0 8px', width: '100%', minWidth: '1000px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '16px 32px', border: 'none' }}>{t('members.table.number')}</th>
                  <th style={{ padding: '16px 32px', border: 'none' }}>{t('members.table.name')}</th>
                  <th style={{ padding: '16px 32px', border: 'none' }}>{t('members.table.status')}</th>
                  <th style={{ padding: '16px 32px', border: 'none' }}>{t('members.table.type')}</th>
                  <th style={{ padding: '16px 32px', border: 'none' }}>{t('members.table.since')}</th>
                  <th style={{ padding: '16px 32px', border: 'none' }}>{t('members.table.quota')}</th>
                  <th style={{ padding: '16px 32px', border: 'none' }}>{t('members.table.statusQuota')}</th>
                  <th style={{ padding: '16px 32px', border: 'none', textAlign: 'right' }}>{t('members.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      {t('members.noMembers')}
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr
                      key={member.id}
                      className="table-row-hover"
                      style={{
                        transition: 'var(--transition-smooth)',
                        borderRadius: '12px'
                      }}
                    >
                      <td style={{ padding: '16px 32px', border: 'none', fontWeight: '600', color: 'var(--accent-secondary)' }}>{member.member_number}</td>
                      <td style={{ padding: '16px 32px', border: 'none' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{member.first_name} {member.last_name}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{member.email}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 32px', border: 'none' }}>{getStatusBadge(member.status)}</td>
                      <td style={{ padding: '16px 32px', border: 'none' }}>{getTypeBadge(member.member_type)}</td>
                      <td style={{ padding: '16px 32px', border: 'none', color: 'var(--text-muted)' }}>{new Date(member.member_since).toLocaleDateString()}</td>
                      <td style={{ padding: '16px 32px', border: 'none', fontWeight: '600', color: 'var(--text-main)' }}>€{parseFloat(member.quota_amount.toString()).toFixed(2)}</td>
                      <td style={{ padding: '16px 32px', border: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#10b981', fontWeight: '600', fontSize: '13px' }}>{member.paid_quotas} {t('members.paid')}</span>
                          {member.overdue_quotas > 0 && (
                            <span style={{
                              color: '#ff4d4d',
                              fontSize: '11px',
                              background: 'rgba(255, 77, 77, 0.1)',
                              padding: '2px 8px',
                              borderRadius: '20px',
                              fontWeight: '600',
                              textTransform: 'uppercase'
                            }}>
                              {member.overdue_quotas} {t('members.overdue')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px 32px', border: 'none' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <Link to={`/members/${member.id}`} className="premium-btn premium-btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', textDecoration: 'none', borderRadius: '10px' }}>
                            {t('members.view')}
                          </Link>
                          <Link to={`/members/${member.id}/edit`} className="premium-btn premium-btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', textDecoration: 'none', borderRadius: '10px' }}>
                            {t('common.edit')}
                          </Link>
                          <button
                            onClick={() => handleDelete(member.id)}
                            className="premium-btn"
                            style={{
                              padding: '8px 16px',
                              fontSize: '13px',
                              background: 'rgba(255, 77, 77, 0.1)',
                              color: '#ff4d4d',
                              border: '1px solid rgba(255, 77, 77, 0.2)',
                              borderRadius: '10px'
                            }}
                          >
                            {t('members.deactivate')}
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
            <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>{t('members.import')}</h3>
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
                {t('common.cancel')}
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
