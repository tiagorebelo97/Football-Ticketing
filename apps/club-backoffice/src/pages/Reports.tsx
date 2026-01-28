import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

interface SalesReport {
  date: string;
  tickets_sold: string;
  total_revenue: string;
  home_team: string;
  away_team: string;
}

interface AttendanceReport {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  total_capacity: number;
  current_attendance: number;
  attendance_percentage: string;
}

const Reports: React.FC = () => {
  const [salesData, setSalesData] = useState<SalesReport[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useTranslation();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.clubId) {
      loadReports();
    }
  }, [user?.clubId]);

  const loadReports = async () => {
    try {
      if (!user?.clubId) return;
      const clubId = user.clubId;
      const [salesRes, attendanceRes] = await Promise.all([
        axios.get(`/api/reports/sales/${clubId}`),
        axios.get(`/api/reports/attendance/${clubId}`),
      ]);
      setSalesData(salesRes.data);
      setAttendanceData(attendanceRes.data);
      setLoading(false);
    } catch (err) {
      setError(t('reports.loadError'));
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">{t('common.loading')}...</div>;
  if (error) return <div className="error">{error}</div>;

  const totalRevenue = salesData.reduce((sum, item) => sum + parseFloat(item.total_revenue), 0);
  const totalTickets = salesData.reduce((sum, item) => sum + parseInt(item.tickets_sold, 10), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      <div style={{ marginBottom: '8px' }}>
        <h1 className="font-premium text-gradient" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>
          {t('reports.title')}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          {t('reports.subtitle')}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
          <div className="text-gradient" style={{ fontSize: '40px', fontWeight: 800, marginBottom: '8px' }}>
            €{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '13px' }}>
            {t('reports.types.revenue')}
          </div>
        </div>
        <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
            {totalTickets.toLocaleString()}
          </div>
          <div style={{ color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '13px' }}>
            {t('reports.types.sales')}
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 className="font-premium" style={{ marginBottom: '24px', fontSize: '20px', fontWeight: 700 }}>{t('reports.types.sales')}</h3>
        {salesData.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>{t('common.noData')}</p>
        ) : (
          <div className="responsive-table-wrapper">
            <table className="member-table" style={{ minWidth: '800px' }}>
              <thead>
                <tr>
                  <th>{t('common.date')}</th>
                  <th>{t('matches.table.opponent')}</th>
                  <th style={{ textAlign: 'right' }}>{t('reports.types.sales')}</th>
                  <th style={{ textAlign: 'right' }}>{t('matches.table.ticketPrice')}</th>
                </tr>
              </thead>
              <tbody>
                {salesData.map((item, idx) => (
                  <tr key={idx}>
                    <td>{new Date(item.date).toLocaleDateString()}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.home_team} vs {item.away_team}</div>
                    </td>
                    <td style={{ textAlign: 'right' }}>{item.tickets_sold}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      €{parseFloat(item.total_revenue).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 className="font-premium" style={{ marginBottom: '24px', fontSize: '20px', fontWeight: 700 }}>{t('reports.types.attendance')}</h3>
        {attendanceData.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>{t('common.noData')}</p>
        ) : (
          <div className="responsive-table-wrapper">
            <table className="member-table" style={{ minWidth: '900px' }}>
              <thead>
                <tr>
                  <th>{t('matches.table.opponent')}</th>
                  <th>{t('common.date')}</th>
                  <th style={{ textAlign: 'right' }}>{t('matches.table.attendance')}</th>
                  <th style={{ textAlign: 'right' }}>{t('matches.form.attendance')}</th>
                  <th style={{ textAlign: 'right' }}>{t('reports.fillRate')}</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.home_team} vs {item.away_team}</div>
                    </td>
                    <td>{new Date(item.match_date).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>{item.current_attendance.toLocaleString()}</td>
                    <td style={{ textAlign: 'right' }}>{item.total_capacity.toLocaleString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${item.attendance_percentage}%`,
                            height: '100%',
                            background: parseFloat(item.attendance_percentage) > 80 ? '#22c55e' : (parseFloat(item.attendance_percentage) > 50 ? 'var(--accent-secondary)' : '#ef4444')
                          }} />
                        </div>
                        <span style={{ fontWeight: 700, minWidth: '45px' }}>{parseFloat(item.attendance_percentage).toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
