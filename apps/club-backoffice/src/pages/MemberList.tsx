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

  const clubId = user?.clubId || 'test-club-id';

  useEffect(() => {
    fetchMembers();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubId, searchTerm, statusFilter, typeFilter]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await memberService.listMembers(clubId, {
        search: searchTerm,
        status: statusFilter,
        memberType: typeFilter
      });
      setMembers(data.members);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await memberService.getMemberStats(clubId);
      setStats(data);
    } catch (err: any) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to deactivate this member?')) {
      return;
    }

    try {
      await memberService.deleteMember(id);
      fetchMembers();
      fetchStats();
    } catch (err: any) {
      alert('Failed to deactivate member: ' + err.message);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      alert('Please select a file to import');
      return;
    }

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
    } catch (err: any) {
      setImportStatus('Import failed: ' + err.message);
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
    const colors: any = {
      active: '#4caf50',
      suspended: '#ff9800',
      cancelled: '#f44336'
    };
    return (
      <span style={{
        padding: '4px 8px',
        borderRadius: '4px',
        backgroundColor: colors[status] || '#999',
        color: 'white',
        fontSize: '12px'
      }}>
        {status}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors: any = {
      regular: '#2196f3',
      premium: '#9c27b0',
      vip: '#ff9800',
      junior: '#4caf50',
      senior: '#607d8b'
    };
    return (
      <span style={{
        padding: '4px 8px',
        borderRadius: '4px',
        backgroundColor: colors[type] || '#999',
        color: 'white',
        fontSize: '12px'
      }}>
        {type}
      </span>
    );
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Club Members / Sócios do Clube</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowImportModal(true)} className="btn-secondary">
            Import Excel
          </button>
          <Link to="/members/create" className="btn">
            Add New Member
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
          <div className="card" style={{ padding: '15px', background: '#f5f5f5' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>Total Members</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{stats.members.total_members}</p>
          </div>
          <div className="card" style={{ padding: '15px', background: '#e8f5e9' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>Active Members</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#4caf50' }}>{stats.members.active_members}</p>
          </div>
          <div className="card" style={{ padding: '15px', background: '#fff3e0' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>Overdue Quotas</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#ff9800' }}>{stats.quotas.overdue_quotas}</p>
          </div>
          <div className="card" style={{ padding: '15px', background: '#e3f2fd' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>Total Revenue</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#2196f3' }}>€{parseFloat(stats.quotas.total_revenue).toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by name, email, or member number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, minWidth: '200px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
        >
          <option value="">All Types</option>
          <option value="regular">Regular</option>
          <option value="premium">Premium</option>
          <option value="vip">VIP</option>
          <option value="junior">Junior</option>
          <option value="senior">Senior</option>
        </select>
      </div>

      {loading && <p>Loading members...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left' }}>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Member #</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Name</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Email</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Status</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Type</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Member Since</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Quota</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Quotas Status</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '20px', textAlign: 'center' }}>
                    No members found. Click "Add New Member" to create one or import from Excel.
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}>{member.member_number}</td>
                    <td style={{ padding: '10px' }}>{member.first_name} {member.last_name}</td>
                    <td style={{ padding: '10px' }}>{member.email}</td>
                    <td style={{ padding: '10px' }}>{getStatusBadge(member.status)}</td>
                    <td style={{ padding: '10px' }}>{getTypeBadge(member.member_type)}</td>
                    <td style={{ padding: '10px' }}>{new Date(member.member_since).toLocaleDateString()}</td>
                    <td style={{ padding: '10px' }}>€{parseFloat(member.quota_amount.toString()).toFixed(2)}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ color: '#4caf50' }}>{member.paid_quotas} paid</span>
                      {member.overdue_quotas > 0 && (
                        <span style={{ color: '#f44336', marginLeft: '5px' }}> / {member.overdue_quotas} overdue</span>
                      )}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <Link to={`/members/${member.id}`} className="btn-secondary" style={{ fontSize: '12px', padding: '4px 8px' }}>
                          View
                        </Link>
                        <Link to={`/members/${member.id}/edit`} className="btn-secondary" style={{ fontSize: '12px', padding: '4px 8px' }}>
                          Edit
                        </Link>
                        <button 
                          onClick={() => handleDelete(member.id)} 
                          className="btn-danger"
                          style={{ fontSize: '12px', padding: '4px 8px' }}
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

      {/* Import Modal */}
      {showImportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ width: '500px', maxWidth: '90%' }}>
            <h3>Import Members from Excel</h3>
            <p>Upload an Excel (.xlsx) or CSV file with member information.</p>
            
            <button onClick={downloadTemplate} className="btn-secondary" style={{ marginBottom: '15px', width: '100%' }}>
              Download Template
            </button>

            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              style={{ marginBottom: '15px', width: '100%' }}
            />

            {importStatus && (
              <p style={{ color: importStatus.includes('failed') ? 'red' : 'green', marginBottom: '15px' }}>
                {importStatus}
              </p>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowImportModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleImport} className="btn" disabled={!importFile}>
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberList;
