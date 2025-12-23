import React, { useEffect, useState } from 'react';
import axios from 'axios';

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

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const clubId = 'demo-club-id'; // Would come from auth
      const [salesRes, attendanceRes] = await Promise.all([
        axios.get(`/api/reports/sales/${clubId}`),
        axios.get(`/api/reports/attendance/${clubId}`),
      ]);
      setSalesData(salesRes.data);
      setAttendanceData(attendanceRes.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load reports');
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading reports...</div>;
  if (error) return <div className="error">{error}</div>;

  const totalRevenue = salesData.reduce((sum, item) => sum + parseFloat(item.total_revenue), 0);
  const totalTickets = salesData.reduce((sum, item) => sum + parseInt(item.tickets_sold, 10), 0);

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Reports & Analytics</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div className="card">
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
            ${totalRevenue.toFixed(2)}
          </div>
          <div style={{ color: 'var(--color-text-light)' }}>Total Revenue</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{totalTickets}</div>
          <div style={{ color: 'var(--color-text-light)' }}>Tickets Sold</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '20px' }}>Sales Report</h3>
        {salesData.length === 0 ? (
          <p>No sales data available</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Match</th>
                <th>Tickets Sold</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {salesData.map((item, idx) => (
                <tr key={idx}>
                  <td>{new Date(item.date).toLocaleDateString()}</td>
                  <td>{item.home_team} vs {item.away_team}</td>
                  <td>{item.tickets_sold}</td>
                  <td>${parseFloat(item.total_revenue).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '20px' }}>Attendance Report</h3>
        {attendanceData.length === 0 ? (
          <p>No attendance data available</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Match</th>
                <th>Date</th>
                <th>Attendance</th>
                <th>Capacity</th>
                <th>Fill Rate</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((item) => (
                <tr key={item.id}>
                  <td>{item.home_team} vs {item.away_team}</td>
                  <td>{new Date(item.match_date).toLocaleDateString()}</td>
                  <td>{item.current_attendance}</td>
                  <td>{item.total_capacity}</td>
                  <td>{parseFloat(item.attendance_percentage).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Reports;
